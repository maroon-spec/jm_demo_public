"""Databricks SQL connector wrapper for Unity Catalog access.

Uses OBO (On Behalf Of) token when available, so queries execute
with the logged-in user's Unity Catalog permissions.
"""
import os
import logging
from databricks.sdk import WorkspaceClient
from databricks import sql as dbsql
from .config import IS_DATABRICKS_APP

logger = logging.getLogger(__name__)

# Module-level singleton to avoid re-instantiating on every request
_workspace_client: WorkspaceClient | None = None


def _get_workspace_client() -> WorkspaceClient:
    global _workspace_client
    if _workspace_client is None:
        if IS_DATABRICKS_APP:
            _workspace_client = WorkspaceClient()
        else:
            profile = os.environ.get("DATABRICKS_PROFILE", "DEFAULT")
            _workspace_client = WorkspaceClient(profile=profile)
    return _workspace_client


def _get_host() -> str:
    host = _get_workspace_client().config.host
    return host.replace("https://", "") if host.startswith("https://") else host


def _get_sp_token() -> str:
    headers = _get_workspace_client().config.authenticate()
    if headers and "Authorization" in headers:
        return headers["Authorization"].replace("Bearer ", "")
    raise RuntimeError("Failed to obtain access token")


def _get_http_path() -> str:
    """Return SQL warehouse HTTP path.

    Uses DATABRICKS_SQL_WAREHOUSE_HTTP_PATH env var if set.
    Otherwise auto-discovers the first RUNNING warehouse via SDK.
    """
    http_path = os.environ.get("DATABRICKS_SQL_WAREHOUSE_HTTP_PATH", "").strip()
    if http_path:
        return http_path
    warehouses = list(_get_workspace_client().warehouses.list())
    for wh in warehouses:
        if wh.state and wh.state.value == "RUNNING":
            path = f"/sql/1.0/warehouses/{wh.id}"
            logger.info(f"Auto-selected warehouse: {wh.name} ({path})")
            return path
    if warehouses:
        path = f"/sql/1.0/warehouses/{warehouses[0].id}"
        logger.info(f"Auto-selected warehouse (not running): {warehouses[0].name} ({path})")
        return path
    raise RuntimeError("No SQL warehouses found in this workspace")


def get_connection(user_token: str | None = None):
    """Get a Databricks SQL connection.

    Uses the OBO user token when available so queries execute with the
    logged-in user's Unity Catalog permissions. Falls back to SP token
    when OBO is not configured or the header is absent.
    """
    host = _get_host()
    http_path = _get_http_path()
    token = user_token if user_token is not None else _get_sp_token()
    logger.info(f"SQL connect to {host} http_path={http_path} ({'OBO user token' if user_token is not None else 'SP token'})")
    return dbsql.connect(server_hostname=host, http_path=http_path, access_token=token)


def execute_query(query: str, max_rows: int = 1000, user_token: str | None = None) -> dict:
    conn = get_connection(user_token=user_token)
    try:
        cursor = conn.cursor()
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        rows = cursor.fetchmany(max_rows)
        return {
            "columns": columns,
            "rows": [list(row) for row in rows],
            "row_count": len(rows),
            "truncated": cursor.fetchone() is not None,
        }
    finally:
        conn.close()


def get_catalogs(user_token: str | None = None) -> list[str]:
    result = execute_query("SHOW CATALOGS", user_token=user_token)
    return [row[0] for row in result["rows"]]


def get_schemas(catalog: str, user_token: str | None = None) -> list[str]:
    result = execute_query(f"SHOW SCHEMAS IN `{catalog}`", user_token=user_token)
    return [row[0] for row in result["rows"]]


def get_tables(catalog: str, schema: str, user_token: str | None = None) -> list[dict]:
    result = execute_query(f"SHOW TABLES IN `{catalog}`.`{schema}`", user_token=user_token)
    return [{"name": row[1], "type": row[2] if len(row) > 2 else "TABLE"} for row in result["rows"]]


def get_columns(catalog: str, schema: str, table: str, user_token: str | None = None) -> list[dict]:
    result = execute_query(f"DESCRIBE TABLE `{catalog}`.`{schema}`.`{table}`", user_token=user_token)
    return [{"name": row[0], "type": row[1], "comment": row[2] if len(row) > 2 else ""} for row in result["rows"]
            if row[0] and not row[0].startswith("#")]


def get_table_preview(catalog: str, schema: str, table: str, limit: int = 100, user_token: str | None = None) -> dict:
    return execute_query(f"SELECT * FROM `{catalog}`.`{schema}`.`{table}` LIMIT {limit}", user_token=user_token)
