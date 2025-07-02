"""
Centralised enumerations + helpers shared by multiple handlers
"""

# ── Enumerations (sync with FE constants) ────────────────────────────────── #
HARM_TYPES = {
    "Hacked Account Take over",
    "Impersonation",
    "Fraud/Scam",
}

INCIDENT_CLASSIFICATIONS = {
    "Sale of illegal goods",
    "Harassment",
    "Hate Speech",
    "Spam",
    "Nudity",
    "Violence",
    "Scam",
    "False Information",
    "Something else",
}

PLATFORM_ENUM = {
    "Instagram",
    "Facebook",
    "Messenger",
    "WhatsApp",
    "Twitter",
    "LinkedIn",
    "Reddit",
    "Tumblr",
    "WeChat",
    "TikTok",
    "Other",
}

DYNAMIC_PLATFORMS = {"Instagram", "Facebook", "Messenger", "WhatsApp"}


# ── Utility helpers ──────────────────────────────────────────────────────── #
def extract_platforms(affected_platforms: list[dict]) -> list[str]:
    """
    Deduplicate platform names from the affectedPlatforms array.

    >>> extract_platforms([{"platform":"Instagram",...},{"platform":"Facebook"}])
    ['Facebook', 'Instagram']
    """
    return sorted({p.get("platform") for p in affected_platforms if p.get("platform")})
