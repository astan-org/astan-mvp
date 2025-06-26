import boto3
import json
import os

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["INCIDENTS_TABLE"])

def lambda_handler(event, context):
    claims = event["requestContext"]["authorizer"]["claims"]

    email = claims.get("email")
    group_string = claims.get("cognito:groups", "")
    groups = group_string.split(",") if group_string else []

    if "admins" not in groups:
        return {
            "statusCode": 403,
            "body": json.dumps({"error": "Forbidden: Admins only"})
        }

    response = table.scan()
    return {
        "statusCode": 200,
        "body": json.dumps({"incidents": response.get("Items", [])})
    }
