import os
import boto3
import json
import uuid
from datetime import datetime, timedelta

s3 = boto3.client("s3")
BUCKET_NAME = os.environ.get("EVIDENCE_BUCKET")

def handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        original_filename = body.get("filename")

        if not original_filename:
            return _resp(400, {"error": "Missing 'filename' in request body"})

        # Unique key with folders
        unique_key = f"uploads/{uuid.uuid4()}_{original_filename}"

        url = s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={"Bucket": BUCKET_NAME, "Key": unique_key},
            ExpiresIn=3600,
        )

        return _resp(200, {"uploadUrl": url, "fileKey": unique_key})
    except Exception as e:
        return _resp(500, {"error": str(e)})

def _resp(status, body):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }