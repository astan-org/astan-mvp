import boto3
import json
import os
import uuid

s3 = boto3.client("s3")
BUCKET_NAME = os.environ["BUCKET_NAME"]

def lambda_handler(event, context):
    filename = f"evidence/{str(uuid.uuid4())}.pdf"

    presigned_url = s3.generate_presigned_url(
        ClientMethod='put_object',
        Params={
            'Bucket': BUCKET_NAME,
            'Key': filename,
            'ContentType': 'application/pdf'
        },
        ExpiresIn=300
    )

    return {
        "statusCode": 200,
        "body": json.dumps({
            "uploadUrl": presigned_url,
            "filename": filename
        })
    }