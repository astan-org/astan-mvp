import boto3
import json
import uuid
import os
from datetime import datetime
from urllib.parse import urlparse

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
            else:
                platforms.append("Other")
        except Exception:
            platforms.append("Unknown")
    return platforms

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))

        first_name = body.get("firstName")
        last_name = body.get("lastName")
        profile_urls = body.get("profileUrls")
        type_of_request = body.get("typeOfRequest")

        if not (first_name and last_name and profile_urls and type_of_request):
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing required fields."})
            }

        # Optional fields
        alias = body.get("alias", "")
        description = body.get("description", "")
        evidence_urls = body.get("evidenceUrls", [])

        incident_id = str(uuid.uuid4())
        platforms = extract_platforms(profile_urls)
        timestamp = datetime.utcnow().isoformat()

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