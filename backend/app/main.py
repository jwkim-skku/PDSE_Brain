from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import select

from .db import Base, SessionLocal, engine
from .models import ExpressionRecord

app = Flask(__name__)
CORS(app)


def seed_if_empty():
    with SessionLocal() as session:
        has_data = session.execute(select(ExpressionRecord.id).limit(1)).first()
        if has_data:
            return
        session.add_all(
            [
                ExpressionRecord(region="Frontal lobe", allen=542, gtex=494, hpa=338, mane=619, ncbi=455),
                ExpressionRecord(region="Temporal lobe", allen=417, gtex=402, hpa=291, mane=511, ncbi=389),
                ExpressionRecord(region="Parietal lobe", allen=309, gtex=287, hpa=251, mane=418, ncbi=300),
                ExpressionRecord(region="Occipital lobe", allen=288, gtex=264, hpa=244, mane=374, ncbi=278),
                ExpressionRecord(region="Cerebellum", allen=621, gtex=580, hpa=401, mane=690, ncbi=533),
            ]
        )
        session.commit()


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/api/expression")
def expression():
    _ = request.args.get("gene", "")
    with SessionLocal() as session:
        rows = session.execute(select(ExpressionRecord)).scalars().all()
        records = [
            {
                "region": row.region,
                "Allen": row.allen,
                "GTEx": row.gtex,
                "HPA": row.hpa,
                "MANE": row.mane,
                "NCBI": row.ncbi,
            }
            for row in rows
        ]
        return jsonify({"records": records})


@app.get("/api/sets")
def sets():
    return jsonify(
        {
            "sets": [
                {"sets": ["Allen"], "size": 1450},
                {"sets": ["GTEx"], "size": 1320},
                {"sets": ["HPA"], "size": 1170},
                {"sets": ["MANE"], "size": 1660},
                {"sets": ["NCBI"], "size": 1285},
                {"sets": ["Allen", "GTEx"], "size": 810},
                {"sets": ["Allen", "HPA"], "size": 694},
                {"sets": ["GTEx", "HPA"], "size": 676},
                {"sets": ["MANE", "NCBI"], "size": 902},
                {"sets": ["Allen", "GTEx", "MANE"], "size": 552},
                {"sets": ["Allen", "GTEx", "HPA", "MANE", "NCBI"], "size": 399},
            ],
            "venn": [
                {"sets": ["Allen"], "size": 1450},
                {"sets": ["GTEx"], "size": 1320},
                {"sets": ["HPA"], "size": 1170},
                {"sets": ["Allen", "GTEx"], "size": 810},
                {"sets": ["Allen", "HPA"], "size": 694},
                {"sets": ["GTEx", "HPA"], "size": 676},
                {"sets": ["Allen", "GTEx", "HPA"], "size": 552},
            ],
        }
    )


def init_db():
    Base.metadata.create_all(bind=engine)
    seed_if_empty()


init_db()
