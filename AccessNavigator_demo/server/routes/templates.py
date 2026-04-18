"""Template management endpoints (in-memory for demo)."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter(tags=["templates"])


class TemplateCreate(BaseModel):
    name: str
    description: str = ""
    query_config: dict  # Same structure as QueryRequest
    category: str = "General"


class Template(BaseModel):
    id: str
    name: str
    description: str
    query_config: dict
    category: str
    created_at: str
    updated_at: str


# In-memory store for demo
_templates: dict[str, Template] = {}

# Pre-populate with sample templates
_sample_templates = [
    {
        "name": "NYC Taxi 乗車分析",
        "description": "乗車ZIPコード別の平均運賃・平均距離・乗車回数を集計します（samples.nyctaxi.trips）",
        "category": "移動分析",
        "query_config": {
            "table": "samples.nyctaxi.trips",
            "columns": [],
            "aggregations": [
                {"func": "COUNT", "column": "*", "alias": "trip_count"},
                {"func": "AVG", "column": "fare_amount", "alias": "avg_fare"},
                {"func": "AVG", "column": "trip_distance", "alias": "avg_distance"},
            ],
            "group_by": ["pickup_zip"],
            "order_by": "trip_count",
            "order_dir": "DESC",
            "limit": 50,
        },
    },
    {
        "name": "受注サマリー（月次）",
        "description": "月別の受注合計金額・受注件数を集計します（samples.tpch.orders）",
        "category": "売上分析",
        "query_config": {
            "table": "samples.tpch.orders",
            "columns": [],
            "aggregations": [
                {"func": "COUNT", "column": "*", "alias": "order_count"},
                {"func": "SUM", "column": "o_totalprice", "alias": "total_revenue"},
                {"func": "AVG", "column": "o_totalprice", "alias": "avg_order_value"},
            ],
            "group_by": ["o_orderstatus"],
            "order_by": "total_revenue",
            "order_dir": "DESC",
            "limit": 100,
        },
    },
    {
        "name": "明細別売上TOP分析",
        "description": "出荷モード別の売上・数量・割引を集計します（samples.tpch.lineitem）",
        "category": "売上分析",
        "query_config": {
            "table": "samples.tpch.lineitem",
            "columns": [],
            "aggregations": [
                {"func": "COUNT", "column": "*", "alias": "line_count"},
                {"func": "SUM", "column": "l_extendedprice", "alias": "total_sales"},
                {"func": "AVG", "column": "l_discount", "alias": "avg_discount"},
                {"func": "SUM", "column": "l_quantity", "alias": "total_quantity"},
            ],
            "group_by": ["l_shipmode"],
            "order_by": "total_sales",
            "order_dir": "DESC",
            "limit": 50,
        },
    },
]

for t in _sample_templates:
    tid = str(uuid.uuid4())
    now = datetime.now().isoformat()
    _templates[tid] = Template(id=tid, created_at=now, updated_at=now, **t)


@router.get("/templates")
def list_templates(category: str | None = None):
    templates = list(_templates.values())
    if category:
        templates = [t for t in templates if t.category == category]
    return {"templates": [t.model_dump() for t in templates]}


@router.post("/templates")
def create_template(req: TemplateCreate):
    tid = str(uuid.uuid4())
    now = datetime.now().isoformat()
    template = Template(id=tid, created_at=now, updated_at=now, **req.model_dump())
    _templates[tid] = template
    return template.model_dump()


@router.delete("/templates/{template_id}")
def delete_template(template_id: str):
    if template_id not in _templates:
        raise HTTPException(status_code=404, detail="Template not found")
    del _templates[template_id]
    return {"status": "deleted"}
