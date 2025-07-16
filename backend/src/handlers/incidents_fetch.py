import json
import boto3
from jose import jwt
import urllib.request
from boto3.dynamodb.conditions import Key

REGION = "us-east-1"
USER_POOL_ID = "us-east-1_eC0YPqY93"
CLIENT_ID = "51nedkfr5lb3odi1obfdi0n6vj"

def get_cognito_jwk():
    url = f"https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}/.well-known/jwks.json"
    with urllib.request.urlopen(url) as f:
        return json.load(f)["keys"]

def handler(event, _):
    auth_header = event.get("headers", {}).get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return _resp(401, {"error": "Missing or invalid Authorization header"})

    token = auth_header.split(" ")[1]
    try:
        jwks = get_cognito_jwk()
        headers = jwt.get_unverified_headers(token)
        kid = headers["kid"]
        key = next(k for k in jwks if k["kid"] == kid)
        claims = jwt.decode(token, key, algorithms=["RS256"], audience=CLIENT_ID)
        user_id = claims["sub"]
    except Exception as e:
        return _resp(401, {"error": f"Token validation failed: {str(e)}"})

    db = boto3.resource("dynamodb")
    table = db.Table("IncidentsTable")

    try:
        response = table.query(
            IndexName="userId-index",
            KeyConditionExpression=Key("userId").eq(user_id)
        )
        return _resp(200, {"items": response.get("Items", [])})
    except Exception as e:
        return _resp(500, {"error": f"DynamoDB query failed: {str(e)}"})

def _resp(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,GET"
        },
        "body": json.dumps(body),
    }
