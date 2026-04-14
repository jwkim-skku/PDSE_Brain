# Raw meshes

이 디렉토리에 OBJ 파일을 넣으면 `backend/scripts/import_meshes.py` 가
각 OBJ를 하나의 GLB 노드로 묶어 `public/models/brain_regions.glb` 로
출력합니다.

## 파일명 규칙

파일명(확장자 제외)이 `backend/data/regions.json` 의 `mesh_name` 필드와
정확히 일치해야 매핑됩니다. 예:

```
frontal_lobe.obj    → regions.json: { "mesh_name": "frontal_lobe" }
temporal_lobe.obj   → regions.json: { "mesh_name": "temporal_lobe" }
...
```

대소문자는 무시되고(loading 시점에 소문자로 비교), 공백/언더스코어/
하이픈 변형은 `mapNodeNameToRegion` 에서 흡수합니다. 다만 명확한
매칭을 위해 snake_case 를 권장합니다.

## 소스 후보

### Allen CCFv3 (생쥐 뇌)
- 출처: http://download.alleninstitute.org/informatics-archive/current-release/mouse_ccf/annotation/
- 형식: NRRD 볼륨. 영역별 mesh 추출은 marching cubes(예: `scikit-image.measure.marching_cubes`)로 가공해야 함.
- 라이선스: Allen Institute Terms of Use (비상업/연구 목적 가능, 출처 표기 필수).
- 주의: **생쥐 뇌**입니다. G2C 복제(인간 뇌)를 원하면 아래 대안을 고려.

### Allen Human Brain Atlas
- 출처: https://portal.brain-map.org/
- 영역 파셀레이션 라벨은 제공되지만 사용 가능한 3D surface mesh는 제한적.
- 인간 뇌 기준 프로젝트라면 FreeSurfer `fsaverage` 쪽이 더 실용적.

### FreeSurfer `fsaverage` (인간 뇌 — 권장)
- 출처: https://surfer.nmr.mgh.harvard.edu/
- `?h.pial` + Desikan-Killiany 파셀레이션(`aparc.annot`)을 영역별로
  분리한 후 OBJ/STL 로 export (Python `nibabel` + `trimesh`).
- 라이선스: FreeSurfer Software License (비상업/연구 OK).

### BodyParts3D (인간 뇌, 상업 사용 가능)
- 출처: https://lifesciencedb.jp/bp3d/
- 라이선스: CC-BY-SA 2.1 JP.
- 해상도는 낮지만 상업 배포가 필요하면 우선 검토.

## 주의

- `*.obj` / `*.glb` 는 `.gitignore` 로 커밋되지 않습니다.
- 본인이 사용할 소스의 라이선스를 반드시 확인하세요.
