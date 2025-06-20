import boto3
import os
import json
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["INCIDENTS_TABLE"])

def lambda_handler(event, context):
    try:
        query_params = event.get("queryStringParameters", {}) or {}
        incident_id = query_params.get("incidentId")

        if not incident_id:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing incidentId in query parameters."})
            }

        response = table.get_item(Key={"incidentId": incident_id})

        if "Item" not in response:
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "Incident not found."})
            }

        return {
            "statusCode": 200,
            "body": json.dumps({
                "incident": response["Item"]
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }