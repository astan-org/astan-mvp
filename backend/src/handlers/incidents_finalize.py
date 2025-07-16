import json, os, datetime, hmac, hashlib, boto3
dynamo  = boto3.resource("dynamodb").Table(os.environ["INCIDENTS_TABLE"])
SECRET  = os.environ.get("HMAC_SECRET", "dev-secret")

def handler(event, _ctx):
    incident_id = event["pathParameters"]["id"]
    body = json.loads(event.get("body") or "{}")

    if not body.get("verificationId") or body.get("result") not in ("PASS", "FAIL"):
        return _resp(400, {"error": "verificationId & result=PASS|FAIL required"})

    now  = datetime.datetime.utcnow().isoformat()
    sig  = hmac.new(SECRET.encode(),
                    f"{incident_id}:{body['verificationId']}".encode(),
                    hashlib.sha256).hexdigest()

    dynamo.update_item(
        Key={"incidentId": incident_id},
        UpdateExpression="""
            SET #S = :s,
                verification = :v,
                updatedAt    = :t
        """,
        ExpressionAttributeNames={"#S": "status"},
        ExpressionAttributeValues={
            ":s": "VERIFIED" if body["result"] == "PASS" else "VERIF_FAILED",
            ":v": {
                "verificationId": body["verificationId"],
                "result"       : body["result"],
                "signedAt"     : now,
                "signature"    : sig,
            },
            ":t": now,
        },
    )
    return _resp(200, {"incidentId": incident_id, "status": "UPDATED"})

def _resp(code, body):
    return {
        "statusCode": code,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps(body),
    }
