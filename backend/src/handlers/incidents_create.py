# backend/src/handlers/incidents_create.py
import json
from uuid import uuid4
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any, Literal
from jose import jwt
import urllib.request

REGION = "us-east-1"
USER_POOL_ID = "us-east-1_eC0YPqY93"
CLIENT_ID = "51nedkfr5lb3odi1obfdi0n6vj"

def get_cognito_jwk():
    url = f"https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}/.well-known/jwks.json"
    with urllib.request.urlopen(url) as f:
        return json.load(f)["keys"]

from pydantic import (
    BaseModel,
    Field,
    EmailStr,
    ValidationError,
    constr,
    model_validator,
)

from common.dynamo import put
from common.constants import extract_platforms  # unchanged helper


# --------------------------------------------------------------------- #
# ENUM HELPERS – centralise valid values
# --------------------------------------------------------------------- #
HARM_TYPES = {
    "Hacked Account Take over",
    "Impersonation",
    "Fraud/Scam",
}

INCIDENT_CLASSIFICATIONS = {
    "Sale of illegal goods",
    "Harassment",
    "Hate Speech",
    "Spam",
    "Nudity",
    "Violence",
    "Scam",
    "False Information",
    "Something else",
}

PLATFORM_ENUM = {
    "Instagram",
    "Facebook",
    "Messenger",
    "WhatsApp",
    "Twitter",
    "LinkedIn",
    "Reddit",
    "Tumblr",
    "WeChat",
    "TikTok",
    "Other",
}

DYNAMIC_PLATFORMS = {"Instagram", "Facebook", "Messenger", "WhatsApp"}

YES_NO = Literal["Yes", "No"]


# --------------------------------------------------------------------- #
# Pydantic models
# --------------------------------------------------------------------- #
URL = constr(strip_whitespace=True, min_length=1)


class PlatformProfile(BaseModel):
    platform: constr(strip_whitespace=True, min_length=1)
    profileUrls: List[URL] = Field(..., min_length=1)
    userCount: int = Field(..., gt=0)


class IncidentDraft(BaseModel):
    # ---------- Core User ----------
    firstName: constr(strip_whitespace=True, min_length=1)
    lastName: constr(strip_whitespace=True, min_length=1)
    emailAddress: EmailStr

    # ---------- Classification ----------
    primaryHarmType: constr(strip_whitespace=True, min_length=1)
    incidentClassification: Optional[str] = None

    # ---------- Affected platforms ----------
    affectedPlatforms: List[PlatformProfile]

    # ---------- Hacking-specific ----------
    hackedElsewhere: Optional[Literal["yes", "no", "dont_know"]] = None
    hackedElsewhereDetails: Optional[str] = None
    crossPlatformDetails: Optional[str] = None

    # ---------- Dynamic platform Qs ----------
    platformForDynamicQuestions: Optional[str] = None
    # (all extra dynamic keys accepted via Config.extra)

    # ---------- Location ----------
    country: constr(strip_whitespace=True, min_length=1)
    city: Optional[str] = None
    culturalContext: Optional[str] = None

    # ---------- Case details ----------
    violationReason: constr(strip_whitespace=True, min_length=1)
    violationCode: Optional[str] = None
    typeOfSupportProvided: Optional[str] = None

    # ---------- Evidence ----------
    evidenceUrls: Optional[List[str]] = None  # files are uploaded later

    # ---------- Allow dynamic extras ----------
    class Config:
        extra = "allow"

    # ---------- Conditional validation ----------
    @model_validator(mode="after")
    def _conditional_rules(self):
        # harm type must be one of accepted values
        if self.primaryHarmType not in HARM_TYPES:
            raise ValueError(f"primaryHarmType must be one of {sorted(HARM_TYPES)}")

        if self.incidentClassification and self.incidentClassification not in INCIDENT_CLASSIFICATIONS:
            raise ValueError("Invalid incidentClassification value")

        # hacking-specific requirements
        if self.primaryHarmType == "Hacked Account Take over":
            if self.hackedElsewhere is None:
                raise ValueError("hackedElsewhere is required for hacked-account incidents")
            if self.hackedElsewhere == "yes" and not (self.hackedElsewhereDetails or "").strip():
                raise ValueError("hackedElsewhereDetails required when hackedElsewhere = 'yes'")

        return self


# --------------------------------------------------------------------- #
# Lambda handler
# --------------------------------------------------------------------- #
def handler(event, _):
    # Step 1: Extract Authorization header
    auth_header = event.get("headers", {}).get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return _resp(401, {"error": "Missing or invalid Authorization header"})

    token = auth_header.split(" ")[1]  # remove "Bearer "

    # Step 2: Decode JWT using Cognito JWKs
    try:
        jwks = get_cognito_jwk()
        headers = jwt.get_unverified_headers(token)
        kid = headers["kid"]
        key = next(k for k in jwks if k["kid"] == kid)

        claims = jwt.decode(token, key, algorithms=["RS256"], audience=CLIENT_ID)
        user_id = claims["sub"]
        user_email = claims.get("email")
    except Exception as e:
        return _resp(401, {"error": f"Token validation failed: {str(e)}"})

    # Step 3: Parse and validate request body
    try:
        body: Dict[str, Any] = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return _resp(400, {"error": "Malformed JSON"})

    try:
        draft = IncidentDraft.model_validate(body)
    except ValidationError as err:
        return _resp(400, {"error": [str(e) for e in err.errors()]})

    # Step 4: Build DynamoDB item
    incident_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()

    user_block = {
        "firstName": draft.firstName,
        "lastName": draft.lastName,
        "emailAddress": draft.emailAddress,
        "userId": user_id,         # <-- link to Cognito user
        "userEmail": user_email    # <-- optional from token
    }

    incident_block = {
        "primaryHarmType": draft.primaryHarmType,
        "incidentClassification": draft.incidentClassification,
        "violationReason": draft.violationReason,
        "country": draft.country,
        "city": draft.city,
        "culturalContext": draft.culturalContext,
        "violationCode": draft.violationCode,
        "typeOfSupportProvided": draft.typeOfSupportProvided,
        "platformForDynamicQuestions": draft.platformForDynamicQuestions,
        "affectedPlatforms": [p.model_dump() for p in draft.affectedPlatforms],
        "platformsSummary": extract_platforms([p.model_dump() for p in draft.affectedPlatforms]),
        "hackedElsewhere": draft.hackedElsewhere,
        "hackedElsewhereDetails": draft.hackedElsewhereDetails,
        "crossPlatformDetails": draft.crossPlatformDetails,
    }

    if draft.evidenceUrls:
        incident_block["evidenceUrls"] = draft.evidenceUrls

    dynamic_extras = {k: v for k, v in body.items() if k not in draft.model_fields}
    if dynamic_extras:
        incident_block["dynamicExtras"] = dynamic_extras

    item = {
        "incidentId": incident_id,
        "status": "DRAFT",
        "createdAt": now,
        "userBlock": user_block,
        "incidentBlock": incident_block,
        "evidenceMeta": {},
        "raw": body,
    }

    put(item)
    return _resp(201, {"incidentId": incident_id})


# --------------------------------------------------------------------- #
# CORS / JSON helper
# --------------------------------------------------------------------- #
def _resp(code: int, body: dict):
    return {
        "statusCode": code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,POST",
        },
        "body": json.dumps(body),
    }

