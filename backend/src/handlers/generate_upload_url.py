# backend/src/handlers/generate_upload_url.py

import json, os, uuid, boto3

s3 = boto3.client("s3")
BUCKET = os.environ["EVIDENCE_BUCKET"]

def handler(event, _context):
    try:
        body = json.loads(event.get("body") or "{}")
        filename     = body["filename"]
        content_type = body["contentType"]

        # make key unique & keep a neat folder
        key = f"uploads/{uuid.uuid4()}-{filename}"

        presigned_url = s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": BUCKET,
                "Key": key,
                "ContentType": content_type,
            },
            ExpiresIn=3600,
        )

        return _resp(200, {"url": presigned_url, "key": key})
    except Exception as exc:
        return _resp(400, {"error": str(exc)})


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
