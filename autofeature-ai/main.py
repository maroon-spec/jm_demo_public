"""AutoFeature AI - Automated Feature Engineering for Credit Scoring."""

import asyncio
import random
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from server.catalog import get_tables_info
from server.features import run_featuretools
from server.llm import generate_llm_features, generate_summary_report

feature_cache: dict = {}

app = FastAPI(title="AutoFeature AI")


class GenerateRequest(BaseModel):
    tables: list[str]
    target_table: str
    target_column: str


@app.get("/api/tables")
async def list_tables():
    try:
        return {"tables": await get_tables_info()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-features")
async def generate_features(req: GenerateRequest):
    global feature_cache
    try:
        tables_info = await get_tables_info()
        schema_summary = _build_schema_summary(tables_info, req.tables)

        llm_features, ft_features = await asyncio.gather(
            generate_llm_features(schema_summary, req),
            run_featuretools(req),
        )

        ranked = _rank_features(llm_features, ft_features)
        result = {
            "llm_features": llm_features,
            "featuretools_features": ft_features,
            "ranked_features": ranked,
            "summary": (
                f"LLMが{len(llm_features)}個、Featuretoolsが{len(ft_features)}個の特徴量を生成しました。"
                f"合計{len(ranked)}個の特徴量を重要度順にランキングしました。"
            ),
        }
        feature_cache = result
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/feature-importance")
async def feature_importance():
    if not feature_cache:
        raise HTTPException(status_code=404, detail="まだ特徴量が生成されていません。先に生成を実行してください。")
    return {
        "ranked_features": feature_cache.get("ranked_features", []),
        "summary": feature_cache.get("summary", ""),
    }


@app.post("/api/summary-report")
async def summary_report():
    if not feature_cache:
        raise HTTPException(status_code=404, detail="まだ特徴量が生成されていません。先に生成を実行してください。")
    try:
        return {"report": await generate_summary_report(feature_cache)}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


def _build_schema_summary(tables_info: list[dict], selected: list[str]) -> str:
    lines = []
    for t in tables_info:
        if t["name"] in selected:
            cols = ", ".join(f'{c["name"]} ({c["type"]})' for c in t["columns"])
            lines.append(f"テーブル: {t['name']}\n  カラム: {cols}")
    return "\n\n".join(lines)


def _rank_features(llm_features: list[dict], ft_features: list[dict]) -> list[dict]:
    ranked = []
    for f in llm_features:
        ranked.append({
            "name": f["name"],
            "importance": f.get("importance", 0.0),
            "source": "LLM",
            "description": f.get("explanation", ""),
        })
    for f in ft_features:
        ranked.append({
            "name": f["name"],
            "importance": f.get("importance", 0.0),
            "source": "Featuretools",
            "description": f.get("type", ""),
        })
    ranked.sort(key=lambda x: x["importance"], reverse=True)
    return ranked


frontend_dist = Path(__file__).parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=frontend_dist / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
