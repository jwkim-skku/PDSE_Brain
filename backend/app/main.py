import json
from pathlib import Path

from flask import Flask, abort, jsonify, request
from flask_cors import CORS
from sqlalchemy import or_, select

from .db import Base, SessionLocal, engine
from .models import BrainRegion

app = Flask(__name__)
CORS(app)


REGIONS_JSON = Path(__file__).resolve().parents[1] / "data" / "regions.json"

# Fallback seed used if regions.json is missing (e.g. fresh checkout without
# data files). The canonical source is backend/data/regions.json; edits should
# go there so the import pipeline and the DB stay in sync.
FALLBACK_SEED = [
    {
        "id": "frontal_lobe",
        "name_en": "Frontal lobe",
        "name_ko": "전두엽",
        "parent_id": None,
        "mesh_name": "frontal_lobe",
        "color": "#4F8EF7",
        "description": None,
    },
    {
        "id": "cerebellum",
        "name_en": "Cerebellum",
        "name_ko": "소뇌",
        "parent_id": None,
        "mesh_name": "cerebellum",
        "color": "#F7C64F",
        "description": None,
    },
]


def load_seed_rows() -> list[dict]:
    if REGIONS_JSON.exists():
        with REGIONS_JSON.open(encoding="utf-8") as fp:
            return json.load(fp)
    return FALLBACK_SEED


def seed_if_empty():
    with SessionLocal() as session:
        has_data = session.execute(select(BrainRegion.id).limit(1)).first()
        if has_data:
            return
        rows = load_seed_rows()
        # Parents must land before children (FK is not deferred). Sort by
        # depth: roots (parent_id is None) first, then anything referencing
        # an already-inserted id, iteratively.
        inserted: set[str] = set()
        ordered: list[dict] = []
        remaining = list(rows)
        while remaining:
            progressed = False
            for row in list(remaining):
                parent = row.get("parent_id")
                if parent is None or parent in inserted:
                    ordered.append(row)
                    inserted.add(row["id"])
                    remaining.remove(row)
                    progressed = True
            if not progressed:
                # Dangling parent references — insert the rest anyway and let
                # the DB surface the error rather than looping forever.
                ordered.extend(remaining)
                break
        session.add_all([BrainRegion(**row) for row in ordered])
        session.commit()


def region_to_dict(row: BrainRegion) -> dict:
    return {
        "id": row.id,
        "name_en": row.name_en,
        "name_ko": row.name_ko,
        "parent_id": row.parent_id,
        "mesh_name": row.mesh_name,
        "color": row.color,
        "description": row.description,
        "functions": row.functions or [],
        "disorders": row.disorders or [],
    }


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/api/regions")
def list_regions():
    with SessionLocal() as session:
        rows = session.execute(select(BrainRegion)).scalars().all()
        return jsonify({"regions": [region_to_dict(row) for row in rows]})


@app.get("/api/regions/search")
def search_regions():
    q = (request.args.get("q") or "").strip()
    if not q:
        return jsonify({"regions": []})
    pattern = f"%{q}%"
    with SessionLocal() as session:
        rows = (
            session.execute(
                select(BrainRegion).where(
                    or_(
                        BrainRegion.name_en.ilike(pattern),
                        BrainRegion.name_ko.ilike(pattern),
                        BrainRegion.id.ilike(pattern),
                    )
                )
            )
            .scalars()
            .all()
        )
        return jsonify({"regions": [region_to_dict(row) for row in rows]})


@app.get("/api/regions/<region_id>")
def get_region(region_id: str):
    with SessionLocal() as session:
        row = session.get(BrainRegion, region_id)
        if row is None:
            abort(404)
        return jsonify(region_to_dict(row))


def init_db():
    Base.metadata.create_all(bind=engine)
    seed_if_empty()


init_db()
