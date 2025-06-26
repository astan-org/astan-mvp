import boto3
import json
import uuid
import os
from datetime import datetime
from urllib.parse import urlparse

# Platform-specific field requirements based on type of request
FIELD_REQUIREMENTS = {
    "Hacked Account Take over": {
        "Instagram": [
            "accountUrl",
            "usedTelcoAuth",
            "emailUsedToCreate",
            "newEmailUsed"
        ],
        "Messenger": [
            "accountUrl",
            "usedTelcoAuth",
            "emailUsedToCreate",
            "newEmailUsed"
        ],
        "Facebook": [
            "accountUrl",
            "usedTelcoAuth",
            "emailUsedToCreate",
            "newEmailUsed"
        ],
        "WhatsApp": [
            "phoneNumber",
            "usedTelcoAuth",
            "emailUsedToCreate",
            "newEmailUsed"
        ]
    },
    "Impersonation": {
        "Instagram": [
            "realAccountUrl",
            "fakeAccountUrls",
            "proofOfRealAccount"
        ],
        "Messenger": [
            "realAccountUrl",
            "fakeAccountUrls",
            "proofOfRealAccount"
        ],
        "Facebook": [
            "realAccountUrl",
            "fakeAccountUrls",
            "proofOfRealAccount"
        ],
        "WhatsApp": [
            "usedTelcoAuth"
        ]
    },
    "Fraud/Scam": {
        "Instagram": [
            "victimAccountUrl",
            "fraudEvidence",
            "fraudsterIdentifier"
        ],
        "Messenger": [
            "victimAccountUrl",
            "fraudEvidence",
            "fraudsterIdentifier"
        ],
        "Facebook": [
            "victimAccountUrl",
            "fraudEvidence",
            "fraudsterIdentifier"
        ],
        "WhatsApp": [
            "phoneNumber",
            "fraudEvidence",
            "fraudsterIdentifier"
        ]
    }
}

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["INCIDENTS_TABLE"])

def extract_platforms(profile_urls):
    platforms = []
    for url in profile_urls:
        try:
            netloc = urlparse(url).netloc.lower()
            if "twitter.com" in netloc:
                platforms.append("Twitter")
            elif "instagram.com" in netloc:
                platforms.append("Instagram")
            elif "facebook.com" in netloc:
                platforms.append("Facebook")
            elif "tiktok.com" in netloc:
                platforms.append("TikTok")
            elif "messenger.com" in netloc:
                platforms.append("Messenger")
            elif "whatsapp.com" in netloc:
                platforms.append("WhatsApp")
            else:
                platforms.append("Other")
        except Exception:
            platforms.append("Unknown")
    return platforms

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))

        # Required general fields
        first_name = body.get("firstName")
        last_name = body.get("lastName")
        profile_urls = body.get("profileUrls")
        type_of_request = body.get("typeOfRequest")

        if not (first_name and last_name and profile_urls and type_of_request):
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing required fields: firstName, lastName, profileUrls, or typeOfRequest."})
            }

        platforms = extract_platforms(profile_urls)
        missing_fields = []

        for platform in platforms:
            required_fields = FIELD_REQUIREMENTS.get(type_of_request, {}).get(platform, [])
            for field in required_fields:
                if not body.get(field):
                    missing_fields.append(f"{field} (required for {platform})")

        if missing_fields:
            return {
                "statusCode": 400,
                "body": json.dumps({
                    "error": "Missing required platform-specific fields.",
                    "missingFields": missing_fields
                })
            }

        alias = body.get("alias", "")
        description = body.get("description", "")
        evidence_urls = body.get("evidenceUrls", [])
        timestamp = datetime.utcnow().isoformat()
        incident_id = str(uuid.uuid4())

        item = {
            "incidentId": incident_id,
            "firstName": first_name,
            "lastName": last_name,
            "alias": alias,
            "profileUrls": profile_urls,
            "platforms": platforms,
            "typeOfRequest": type_of_request,
            "description": description,
            "evidenceUrls": evidence_urls,
            "timestamp": timestamp,
            "status": "pending"
        }

        # Add dynamic fields
        for key in body:
            if key not in item:
                item[key] = body[key]

        table.put_item(Item=item)

        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Incident submitted successfully.",
                "incidentId": incident_id
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
