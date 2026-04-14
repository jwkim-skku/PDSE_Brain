# 3D Brain Clone (B Plan)

`http://www.g2conline.org/3dbrain/`를 기준으로, 동일 콘셉트 UI와 생물정보 집합 분석 워크플로우를
재구현하는 프로젝트입니다.

## Stack

- Frontend: React, Vite, AntD, UpSetJS, VennDiagram, aminoAcidList
- Backend: Flask, SQLAlchemy, PostgreSQL, Biopython Entrez
- Orchestration: Docker Compose
- Analysis script: R

## Run (Docker Compose)

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api/health`

## Run (Local Frontend only)

```bash
npm install
npm run dev
```

API가 없으면 프론트는 mock 데이터로 동작합니다.

## 3D Brain GLB/GLTF model

- 모델 파일 위치: `public/models/brain_regions.glb`
- 파일 내부 mesh 이름은 아래 키워드 중 하나를 포함하면 자동 매핑됩니다.
  - frontal, temporal, parietal, occipital, cerebellum
- 매핑에 성공하면 클릭 시 영역 선택 + 상세 패널 동기화가 동작합니다.

## Backend ETL scripts

- NCBI batch(기본 50) 수집: `backend/scripts/fetch_ncbi.py`
- UpSet 전처리 R 스크립트: `backend/scripts/upset_prep.R`

환경변수 예시:

- `ENTREZ_EMAIL`
- `ENTREZ_TOOL`
- `NCBI_BATCH_SIZE=50`
