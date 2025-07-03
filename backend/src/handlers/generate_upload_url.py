# backend/src/handlers/generate_upload_url.py

import json, os, uuid, boto3

s3 = boto3.client("s3")
BUCKET = os.environ["UPLOAD_BUCKET_NAME"]   # set in template.yaml

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


def _resp(status: int, body: dict):
    return {
        "statusCode": status,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps(body),
    }
