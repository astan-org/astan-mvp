import boto3
import json
import os

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["INCIDENTS_TABLE"])

def lambda_handler(event, context):
    # Get the user claims from the Cognito authorizer
    claims = event["requestContext"]["authorizer"]["claims"]

    # Optional: log email or user info
    email = claims.get("email")
    groups = claims.get("cognito:groups", [])

    # ✅ Enforce admin-only access
    if "admins" not in groups:
        return {
            "statusCode": 403,
            "body": json.dumps({"error": "Forbidden: Admins only"})
        }

    # Scan and return all incidents
    response = table.scan()
    return {
        "statusCode": 200,
        "body": json.dumps({"incidents": response.get("Items", [])})
    }
