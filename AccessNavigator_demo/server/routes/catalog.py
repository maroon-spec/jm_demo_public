"""Unity Catalog browsing endpoints."""
import logging
import traceback
from fastapi import APIRouter, HTTPException, Request
from server.sql_client import get_catalogs, get_schemas, get_tables, get_columns, get_table_preview
from server.auth import get_user_token

logger = logging.getLogger(__name__)

router = APIRouter(tags=["catalog"])


@router.get("/catalogs")
def list_catalogs(request: Request):
    try:
        return {"catalogs": get_catalogs(user_token=get_user_token(request))}
    except Exception as e:
        logger.error(f"Error listing catalogs: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/catalogs/{catalog}/schemas")
def list_schemas(catalog: str, request: Request):
    try:
        return {"schemas": get_schemas(catalog, user_token=get_user_token(request))}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/catalogs/{catalog}/schemas/{schema}/tables")
def list_tables(catalog: str, schema: str, request: Request):
    try:
        return {"tables": get_tables(catalog, schema, user_token=get_user_token(request))}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/catalogs/{catalog}/schemas/{schema}/tables/{table}/columns")
def list_columns(catalog: str, schema: str, table: str, request: Request):
    try:
        return {"columns": get_columns(catalog, schema, table, user_token=get_user_token(request))}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/catalogs/{catalog}/schemas/{schema}/tables/{table}/preview")
def preview_table(catalog: str, schema: str, table: str, request: Request, limit: int = 100):
    try:
        return get_table_preview(catalog, schema, table, min(limit, 1000), user_token=get_user_token(request))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
