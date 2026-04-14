# Raw meshes

이 디렉토리에 OBJ 파일을 넣으면 `backend/scripts/import_meshes.py` 가
각 OBJ를 하나의 GLB 노드로 묶어 `public/models/brain_regions.glb` 로
출력합니다.

**이 프로젝트는 인간 뇌 기준입니다.** `backend/data/regions.json` 의
영역 정의도 인간 뇌 해부학에 맞춰져 있습니다.

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

## 소스 후보 (인간 뇌)

### FreeSurfer `fsaverage` — 권장
- 출처: https://surfer.nmr.mgh.harvard.edu/
- `?h.pial` 표면에 Desikan-Killiany 파셀레이션(`aparc.annot`)을 적용한 뒤
  영역 단위로 분리해 OBJ/STL 로 export.
  - Python 도구: `nibabel` 로 surface + annot 로딩, `trimesh` 로 OBJ 쓰기.
- 라이선스: FreeSurfer Software License (비상업/연구 목적).
- 주의: 본 프로젝트 `regions.json` 은 lobe 단위 큰 영역이므로,
  Desikan-Killiany 세부 영역들을 lobe 기준으로 병합해야 합니다.

### BodyParts3D (상업 사용이 필요한 경우)
- 출처: https://lifesciencedb.jp/bp3d/
- 라이선스: CC-BY-SA 2.1 JP.
- 해상도는 낮지만 상업 배포 가능.

### Allen Human Brain Atlas
- 출처: https://portal.brain-map.org/
- 파셀레이션 라벨은 풍부하나 즉시 쓸 수 있는 3D surface mesh 는 제한적.
- 유전자 발현 데이터를 함께 쓰려 할 때 고려.

### Allen CCFv3 — **해당 없음**
- CCFv3는 **생쥐 뇌** 아틀라스입니다. 본 프로젝트(인간 뇌)에는 부적합.

## 주의

- `*.obj` / `*.stl` / `*.ply` / `*.glb` 는 `.gitignore` 로 커밋되지 않습니다.
- 본인이 사용할 소스의 라이선스를 반드시 확인하세요.
