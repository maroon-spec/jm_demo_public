"""User authentication for Databricks Apps.

When user authorization scopes are configured, the Databricks Apps proxy
forwards the user's OAuth token in the 'x-forwarded-access-token' header.
Queries then execute with the user's Unity Catalog permissions.
"""
import logging
from fastapi import Request

logger = logging.getLogger(__name__)


def get_user_email(request: Request) -> str | None:
    """Get the authenticated user's email."""
    return request.headers.get("X-Forwarded-Email")


def get_user_id(request: Request) -> str | None:
    """Get the authenticated user's Databricks ID."""
    forwarded = request.headers.get("X-Forwarded-User")
    if forwarded and "@" in forwarded:
        return forwarded.split("@")[0]
    return forwarded


def get_user_token(request: Request) -> str | None:
    """Get user's access token from Databricks Apps proxy.

    The proxy sets 'x-forwarded-access-token' when user authorization
    scopes are configured on the app. This token carries the user's
    Unity Catalog permissions.

    Falls back to None (SP token) if header is not present.
    """
    token = request.headers.get("X-Forwarded-Access-Token")
    if token:
        logger.info(f"Using user OBO token from x-forwarded-access-token")
        return token

    logger.info("No user token in x-forwarded-access-token, falling back to SP")
    return None
