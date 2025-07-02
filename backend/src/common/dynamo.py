"""
Thin DynamoDB helpers
─────────────────────
• Table name is taken from env var INCIDENTS_TABLE (set in template.yaml)
• Keep helpers *tiny* so they can be unit-mocked easily.
"""

from __future__ import annotations
import os
import boto3
from boto3.dynamodb.conditions import Key  # pylint: disable=unused-import

_TABLE_NAME = os.environ.get("INCIDENTS_TABLE", "IncidentsTableDev")
_DDB = boto3.resource("dynamodb")
_TABLE = _DDB.Table(_TABLE_NAME)


# ---------- CRUD wrappers -------------------------------------------------- #
def put(item: dict) -> None:
    """Full item put (overwrite)."""
    _TABLE.put_item(Item=item)


def get(incident_id: str) -> dict | None:
    """Fetch by primary key."""
    resp = _TABLE.get_item(Key={"incidentId": incident_id})
    return resp.get("Item")


def update(incident_id: str, updates: dict) -> None:
    """
    Update only the provided keys.
    Example: update("123", {"status": "ID_VERIFIED", "reviewedAt": ts})
    """
    if not updates:
        return

    expr_parts, values = [], {}
    for k, v in updates.items():
        expr_parts.append(f"{k}=:{k}")
        values[f":{k}"] = v

    _TABLE.update_item(
        Key={"incidentId": incident_id},
        UpdateExpression="SET " + ", ".join(expr_parts),
        ExpressionAttributeValues=values,
    )