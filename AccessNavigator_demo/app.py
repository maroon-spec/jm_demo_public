from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from server.routes import catalog, query, templates
from server.auth import get_user_email, get_user_token
from server.sql_client import _get_host


@asynccontextmanager
async def lifespan(app):
    yield

app = FastAPI(title="AccessNavigator", lifespan=lifespan)


@app.get("/api/me")
def get_current_user(request: Request):
    """Return the currently authenticated user's info and OBO status."""
    email = get_user_email(request)
    user_token = get_user_token(request)
    return {
        "email": email,
        "authenticated": email is not None,
        "obo_active": user_token is not None,
    }


@app.get("/api/debug/headers")
def debug_headers(request: Request):
    """Debug endpoint to inspect proxy headers."""
    relevant = {}
    for key, value in request.headers.items():
        k = key.lower()
        if k.startswith("x-") or k == "authorization" or k.startswith("gap-"):
            if "token" in k or k == "authorization":
                relevant[key] = value[:20] + "..." if len(value) > 20 else value
            else:
                relevant[key] = value
    return {"headers": relevant}


@app.get("/api/debug/config")
def debug_config():
    """Debug endpoint to inspect SQL connection config."""
    return {
        "host": _get_host(),
        "http_path": os.environ.get("DATABRICKS_SQL_WAREHOUSE_HTTP_PATH", ""),
        "databricks_host_env": os.environ.get("DATABRICKS_HOST", ""),
        "is_app": bool(os.environ.get("DATABRICKS_APP_NAME")),
    }


@app.get("/api/debug/sql-test")
def debug_sql_test(request: Request):
    """Debug endpoint: test SQL connection with SP token and OBO token."""
    import traceback
    from server.sql_client import execute_query, _get_sp_token
    from server.auth import get_user_token
    results = {}
    # SP token test
    try:
        sp_token = _get_sp_token()
        r = execute_query("SELECT 1", user_token=sp_token)
        results["sp_token"] = "OK"
    except Exception as e:
        results["sp_token"] = f"ERROR: {traceback.format_exc()}"
    # OBO token test
    try:
        obo_token = get_user_token(request)
        if obo_token:
            r = execute_query("SELECT 1", user_token=obo_token)
            results["obo_token"] = "OK"
        else:
            results["obo_token"] = "No OBO token in headers"
    except Exception as e:
        results["obo_token"] = f"ERROR: {traceback.format_exc()}"
    return results


app.include_router(catalog.router, prefix="/api")
app.include_router(query.router, prefix="/api")
app.include_router(templates.router, prefix="/api")

# Serve React frontend
frontend_dir = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.exists(frontend_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        return FileResponse(os.path.join(frontend_dir, "index.html"))
