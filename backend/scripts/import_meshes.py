"""Merge per-region OBJ files into a single GLB for the frontend viewer.

Usage (from repo root):
    pip install -r backend/scripts/requirements-import.txt
    python backend/scripts/import_meshes.py

Inputs:
    backend/data/raw_meshes/*.obj  — one OBJ per region; filename stem must
    match a `mesh_name` in backend/data/regions.json.

Output:
    public/models/brain_regions.glb — one GLB node per OBJ, named after the
    file stem. The frontend's mapNodeNameToRegion matches node names to
    region ids via the mesh_name field.

The script normalizes all meshes into a shared bounding box (recenter to
origin, uniform scale to fit within ~2 units) so the camera defaults in
BrainScene work without per-atlas tuning.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import trimesh


REPO_ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = REPO_ROOT / "backend" / "data" / "raw_meshes"
REGIONS_JSON = REPO_ROOT / "backend" / "data" / "regions.json"
OUTPUT_GLB = REPO_ROOT / "public" / "models" / "brain_regions.glb"

TARGET_EXTENT = 2.0  # final model fits within a ~2-unit cube


def load_region_mesh_names() -> set[str]:
    with REGIONS_JSON.open(encoding="utf-8") as fp:
        regions = json.load(fp)
    return {r["mesh_name"] for r in regions if r.get("mesh_name")}


def collect_objs() -> list[Path]:
    if not RAW_DIR.exists():
        return []
    return sorted(p for p in RAW_DIR.iterdir() if p.suffix.lower() == ".obj")


def compute_global_transform(meshes: list[trimesh.Trimesh]) -> tuple[np.ndarray, float]:
    """Return (center, scale) that normalize the union of meshes."""
    bounds = np.vstack([m.bounds for m in meshes])
    mins = bounds[0::2].min(axis=0)
    maxs = bounds[1::2].max(axis=0)
    center = (mins + maxs) / 2.0
    extent = float((maxs - mins).max())
    if extent == 0:
        return center, 1.0
    return center, TARGET_EXTENT / extent


def main() -> int:
    objs = collect_objs()
    if not objs:
        print(f"[import_meshes] No OBJ files found in {RAW_DIR}")
        print("[import_meshes] See backend/data/raw_meshes/README.md for sources.")
        return 1

    expected = load_region_mesh_names()
    scene = trimesh.Scene()
    loaded: list[trimesh.Trimesh] = []
    node_names: list[str] = []

    for obj_path in objs:
        name = obj_path.stem
        mesh = trimesh.load(obj_path, force="mesh")
        if not isinstance(mesh, trimesh.Trimesh):
            print(f"[import_meshes] Skipping {obj_path.name}: not a single mesh")
            continue
        if name not in expected:
            print(f"[import_meshes] WARNING: {name} not in regions.json (will still export)")
        loaded.append(mesh)
        node_names.append(name)

    if not loaded:
        print("[import_meshes] No usable meshes.")
        return 1

    center, scale = compute_global_transform(loaded)
    for mesh, name in zip(loaded, node_names):
        mesh.apply_translation(-center)
        mesh.apply_scale(scale)
        scene.add_geometry(mesh, node_name=name, geom_name=name)

    OUTPUT_GLB.parent.mkdir(parents=True, exist_ok=True)
    scene.export(OUTPUT_GLB.as_posix())

    missing = expected - set(node_names)
    print(f"[import_meshes] Wrote {OUTPUT_GLB} with {len(node_names)} meshes")
    if missing:
        print(f"[import_meshes] regions.json expects meshes not provided: {sorted(missing)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
