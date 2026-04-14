from flask import Flask, abort, jsonify, request
from flask_cors import CORS
from sqlalchemy import or_, select

from .db import Base, SessionLocal, engine
from .models import BrainRegion

app = Flask(__name__)
CORS(app)


# Minimal seed set — placeholder until M2 (Allen CCFv3 import).
# Content intentionally generic; real descriptions/disorders to be added in M6.
SEED_REGIONS = [
    {
        "id": "frontal_lobe",
        "name_en": "Frontal lobe",
        "name_ko": "전두엽",
        "parent_id": None,
        "mesh_name": "frontal_lobe",
        "color": "#4F8EF7",
    },
    {
        "id": "temporal_lobe",
        "name_en": "Temporal lobe",
        "name_ko": "측두엽",
        "parent_id": None,
        "mesh_name": "temporal_lobe",
        "color": "#F77F4F",
    },
    {
        "id": "parietal_lobe",
        "name_en": "Parietal lobe",
        "name_ko": "두정엽",
        "parent_id": None,
        "mesh_name": "parietal_lobe",
        "color": "#4FD1A1",
    },
    {
        "id": "occipital_lobe",
        "name_en": "Occipital lobe",
        "name_ko": "후두엽",
        "parent_id": None,
        "mesh_name": "occipital_lobe",
        "color": "#B94FF7",
    },
    {
        "id": "cerebellum",
        "name_en": "Cerebellum",
        "name_ko": "소뇌",
        "parent_id": None,
        "mesh_name": "cerebellum",
        "color": "#F7C64F",
    },
]


def seed_if_empty():
    with SessionLocal() as session:
        has_data = session.execute(select(BrainRegion.id).limit(1)).first()
        if has_data:
            return
        session.add_all([BrainRegion(**row) for row in SEED_REGIONS])
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
