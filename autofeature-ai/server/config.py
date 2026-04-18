"""Configuration and authentication helpers."""

import functools
import os

from databricks.sdk import WorkspaceClient

IS_DATABRICKS_APP = bool(os.environ.get("DATABRICKS_APP_NAME"))

CATALOG = os.environ.get("CATALOG", "classic_stable_nud6b0")
SCHEMA = os.environ.get("SCHEMA", "credit_scoring")
TABLES = ["customers", "transactions", "payments", "credit_applications"]


@functools.lru_cache(maxsize=1)
def get_workspace_client() -> WorkspaceClient:
    if IS_DATABRICKS_APP:
        return WorkspaceClient()
    profile = os.environ.get("DATABRICKS_CONFIG_PROFILE", "DEFAULT")
    return WorkspaceClient(profile=profile)


def get_oauth_token() -> str:
    w = get_workspace_client()
    if w.config.token:
        return w.config.token
    headers = w.config.authenticate()
    if headers and "Authorization" in headers:
        return headers["Authorization"].replace("Bearer ", "")
    raise RuntimeError("Failed to obtain OAuth token")


def get_workspace_host() -> str:
    if IS_DATABRICKS_APP:
        host = os.environ.get("DATABRICKS_HOST", "")
        if host and not host.startswith("http"):
            return f"https://{host}"
        return host
    return get_workspace_client().config.host
