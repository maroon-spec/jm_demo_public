"""Unity Catalog table metadata retrieval."""

import os
from typing import Any

from server.config import (
    CATALOG, SCHEMA, TABLES,
    get_workspace_client, get_oauth_token, get_workspace_host,
)


async def get_tables_info() -> list[dict[str, Any]]:
    """Fetch table and column metadata from Unity Catalog INFORMATION_SCHEMA."""
    try:
        return await _query_information_schema()
    except Exception as e:
        print(f"INFORMATION_SCHEMA query failed ({e}), using fallback metadata")
        return _fallback_metadata()


async def _query_information_schema() -> list[dict]:
    """Query INFORMATION_SCHEMA via Databricks SQL Statement API."""
    import aiohttp

    host = get_workspace_host()
    token = get_oauth_token()

    sql = f"""
    SELECT table_name, column_name, data_type, ordinal_position, is_nullable
    FROM {CATALOG}.information_schema.columns
    WHERE table_catalog = '{CATALOG}'
      AND table_schema = '{SCHEMA}'
      AND table_name IN ({','.join(f"'{t}'" for t in TABLES)})
    ORDER BY table_name, ordinal_position
    """

    url = f"{host}/api/2.0/sql/statements"
    payload = {
        "statement": sql,
        "warehouse_id": _get_warehouse_id(),
        "wait_timeout": "30s",
        "disposition": "INLINE",
    }
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, headers=headers) as resp:
            if resp.status != 200:
                raise Exception(f"SQL API returned {resp.status}: {await resp.text()}")
            data = await resp.json()

    status = data.get("status", {}).get("state", "")
    if status == "FAILED":
        raise Exception(data.get("status", {}).get("error", {}).get("message", "Query failed"))
    if status != "SUCCEEDED":
        raise Exception(f"Query status: {status}")

    rows = data.get("result", {}).get("data_array", [])

    tables_map: dict[str, dict] = {}
    for row in rows:
        tname = row[0]
        if tname not in tables_map:
            tables_map[tname] = {"name": tname, "columns": []}
        tables_map[tname]["columns"].append({
            "name": row[1],
            "type": row[2],
            "position": int(row[3]),
            "nullable": row[4] == "YES",
        })

    return list(tables_map.values())


def _get_warehouse_id() -> str:
    wh_id = os.environ.get("DATABRICKS_WAREHOUSE_ID", "")
    if wh_id:
        return wh_id
    try:
        warehouses = list(get_workspace_client().warehouses.list())
        for wh in warehouses:
            if wh.state and wh.state.value in ("RUNNING", "STARTING"):
                return wh.id
        if warehouses:
            return warehouses[0].id
    except Exception:
        pass
    return ""


async def load_table_sample(table_name: str, limit: int = 500) -> "pd.DataFrame":
    """Load a sample of a table as a pandas DataFrame."""
    import pandas as pd
    import aiohttp

    host = get_workspace_host()
    token = get_oauth_token()
    wh_id = _get_warehouse_id()

    if not wh_id:
        return _mock_dataframe(table_name, limit)

    sql = f"SELECT * FROM {CATALOG}.{SCHEMA}.{table_name} LIMIT {limit}"
    url = f"{host}/api/2.0/sql/statements"
    payload = {
        "statement": sql,
        "warehouse_id": wh_id,
        "wait_timeout": "60s",
        "disposition": "INLINE",
    }
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers) as resp:
                data = await resp.json()

        if data.get("status", {}).get("state") != "SUCCEEDED":
            return _mock_dataframe(table_name, limit)

        cols = [c["name"] for c in data["manifest"]["schema"]["columns"]]
        rows = data["result"]["data_array"]
        return pd.DataFrame(rows, columns=cols)
    except Exception as e:
        print(f"Failed to load {table_name}: {e}")
        return _mock_dataframe(table_name, limit)


def _mock_dataframe(table_name: str, n: int) -> "pd.DataFrame":
    """Generate mock data for demo purposes."""
    import pandas as pd
    import numpy as np

    rng = np.random.default_rng(42)

    if table_name == "customers":
        return pd.DataFrame({
            "customer_id": range(1, n + 1),
            "age": rng.integers(20, 70, n),
            "income": rng.integers(200, 2000, n) * 1000,
            "employment_years": rng.integers(0, 30, n),
            "credit_score": rng.integers(300, 850, n),
            "num_dependents": rng.integers(0, 5, n),
        })
    elif table_name == "transactions":
        return pd.DataFrame({
            "transaction_id": range(1, n + 1),
            "customer_id": rng.integers(1, 200, n),
            "amount": np.round(rng.uniform(10, 5000, n), 2),
            "transaction_type": rng.choice(["purchase", "withdrawal", "transfer", "deposit"], n),
            "merchant_category": rng.choice(["grocery", "electronics", "dining", "travel", "utilities"], n),
            "days_ago": rng.integers(0, 365, n),
        })
    elif table_name == "payments":
        return pd.DataFrame({
            "payment_id": range(1, n + 1),
            "customer_id": rng.integers(1, 200, n),
            "amount": np.round(rng.uniform(50, 3000, n), 2),
            "days_late": rng.choice([0, 0, 0, 0, 5, 10, 30, 60, 90], n),
            "payment_type": rng.choice(["credit_card", "loan", "mortgage"], n),
        })
    else:  # credit_applications
        return pd.DataFrame({
            "application_id": range(1, n + 1),
            "customer_id": range(1, n + 1),
            "requested_amount": rng.integers(1000, 50000, n),
            "loan_purpose": rng.choice(["home", "auto", "education", "personal", "business"], n),
            "approved": rng.choice([0, 1], n, p=[0.35, 0.65]),
        })


def _fallback_metadata() -> list[dict]:
    """Return hardcoded metadata when INFORMATION_SCHEMA is unavailable."""
    return [
        {
            "name": "customers",
            "columns": [
                {"name": "customer_id", "type": "INT", "position": 1, "nullable": False},
                {"name": "age", "type": "INT", "position": 2, "nullable": True},
                {"name": "income", "type": "BIGINT", "position": 3, "nullable": True},
                {"name": "employment_years", "type": "INT", "position": 4, "nullable": True},
                {"name": "credit_score", "type": "INT", "position": 5, "nullable": True},
                {"name": "num_dependents", "type": "INT", "position": 6, "nullable": True},
            ],
        },
        {
            "name": "transactions",
            "columns": [
                {"name": "transaction_id", "type": "INT", "position": 1, "nullable": False},
                {"name": "customer_id", "type": "INT", "position": 2, "nullable": False},
                {"name": "amount", "type": "DOUBLE", "position": 3, "nullable": True},
                {"name": "transaction_type", "type": "STRING", "position": 4, "nullable": True},
                {"name": "merchant_category", "type": "STRING", "position": 5, "nullable": True},
                {"name": "days_ago", "type": "INT", "position": 6, "nullable": True},
            ],
        },
        {
            "name": "payments",
            "columns": [
                {"name": "payment_id", "type": "INT", "position": 1, "nullable": False},
                {"name": "customer_id", "type": "INT", "position": 2, "nullable": False},
                {"name": "amount", "type": "DOUBLE", "position": 3, "nullable": True},
                {"name": "days_late", "type": "INT", "position": 4, "nullable": True},
                {"name": "payment_type", "type": "STRING", "position": 5, "nullable": True},
            ],
        },
        {
            "name": "credit_applications",
            "columns": [
                {"name": "application_id", "type": "INT", "position": 1, "nullable": False},
                {"name": "customer_id", "type": "INT", "position": 2, "nullable": False},
                {"name": "requested_amount", "type": "INT", "position": 3, "nullable": True},
                {"name": "loan_purpose", "type": "STRING", "position": 4, "nullable": True},
                {"name": "approved", "type": "INT", "position": 5, "nullable": True},
            ],
        },
    ]
