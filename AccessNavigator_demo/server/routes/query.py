"""Query builder and execution endpoints."""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from server.sql_client import execute_query
from server.auth import get_user_token

router = APIRouter(tags=["query"])


class FilterCondition(BaseModel):
    column: str
    operator: str  # =, !=, >, <, >=, <=, LIKE, IN, IS NULL, IS NOT NULL
    value: str | None = None


class JoinConfig(BaseModel):
    table: str  # fully qualified: catalog.schema.table
    join_type: str = "INNER"  # INNER, LEFT, RIGHT, FULL
    left_column: str
    right_column: str


class QueryRequest(BaseModel):
    table: str  # fully qualified: catalog.schema.table
    columns: list[str] = []  # empty = SELECT *
    filters: list[FilterCondition] = []
    joins: list[JoinConfig] = []
    order_by: str | None = None
    order_dir: str = "ASC"
    limit: int = 1000
    group_by: list[str] = []
    aggregations: list[dict] = []  # [{"func": "COUNT", "column": "*", "alias": "cnt"}]


class RawQueryRequest(BaseModel):
    sql: str
    max_rows: int = 1000


def _build_safe_identifier(name: str) -> str:
    """Wrap identifier parts in backticks."""
    parts = name.split(".")
    return ".".join(f"`{p}`" for p in parts)


def build_query(req: QueryRequest) -> str:
    """Build SQL from structured query request."""
    # SELECT clause
    select_parts = []
    if req.aggregations:
        for agg in req.aggregations:
            col = agg["column"]
            func = agg["func"].upper()
            alias = agg.get("alias", f"{func}_{col}")
            select_parts.append(f"{func}({col}) AS `{alias}`")
        if req.group_by:
            for col in req.group_by:
                select_parts.insert(0, f"`{col}`")
    elif req.columns:
        select_parts = [f"t0.`{c}`" if req.joins else f"`{c}`" for c in req.columns]
    else:
        select_parts = ["t0.*" if req.joins else "*"]

    select_clause = ", ".join(select_parts)

    # FROM clause
    main_table = _build_safe_identifier(req.table)
    from_clause = f"{main_table}" + (" t0" if req.joins else "")

    # JOIN clause
    join_clauses = []
    for i, j in enumerate(req.joins):
        alias = f"t{i + 1}"
        jt = _build_safe_identifier(j.table)
        join_clauses.append(
            f"{j.join_type} JOIN {jt} {alias} ON t0.`{j.left_column}` = {alias}.`{j.right_column}`"
        )

    # WHERE clause
    where_parts = []
    for f in req.filters:
        col = f"`{f.column}`"
        if f.operator in ("IS NULL", "IS NOT NULL"):
            where_parts.append(f"{col} {f.operator}")
        elif f.operator == "IN":
            values = f.value.split(",")
            in_list = ", ".join(f"'{v.strip()}'" for v in values)
            where_parts.append(f"{col} IN ({in_list})")
        elif f.operator == "LIKE":
            where_parts.append(f"{col} LIKE '{f.value}'")
        else:
            where_parts.append(f"{col} {f.operator} '{f.value}'")

    # GROUP BY
    group_clause = ""
    if req.group_by:
        group_clause = "GROUP BY " + ", ".join(f"`{c}`" for c in req.group_by)

    # ORDER BY
    order_clause = ""
    if req.order_by:
        order_clause = f"ORDER BY `{req.order_by}` {req.order_dir}"

    # Assemble
    sql = f"SELECT {select_clause} FROM {from_clause}"
    if join_clauses:
        sql += " " + " ".join(join_clauses)
    if where_parts:
        sql += " WHERE " + " AND ".join(where_parts)
    if group_clause:
        sql += " " + group_clause
    if order_clause:
        sql += " " + order_clause
    sql += f" LIMIT {min(req.limit, 10000)}"

    return sql


@router.post("/query/build")
def build_and_execute(req: QueryRequest, request: Request):
    try:
        sql = build_query(req)
        result = execute_query(sql, max_rows=req.limit, user_token=get_user_token(request))
        result["sql"] = sql
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/query/raw")
def execute_raw(req: RawQueryRequest, request: Request):
    """Execute raw SQL (for ad-hoc queries)."""
    sql_upper = req.sql.strip().upper()
    if not sql_upper.startswith("SELECT") and not sql_upper.startswith("SHOW") and not sql_upper.startswith("DESCRIBE"):
        raise HTTPException(status_code=400, detail="Only SELECT/SHOW/DESCRIBE queries are allowed")
    try:
        return execute_query(req.sql, max_rows=req.max_rows, user_token=get_user_token(request))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/query/preview-sql")
def preview_sql(req: QueryRequest):
    """Return generated SQL without executing."""
    try:
        return {"sql": build_query(req)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
