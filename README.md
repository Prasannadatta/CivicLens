# CivicLens

An interactive dashboard for exploring NYC 311 service requests. CivicLens combines visual analytics with a CatBoost machine-learning view to help understand complaint patterns, service burden, and predicted response delays across New York City boroughs.

## Features

- **Dashboard** — KPIs, borough burden choropleth, complaint rankings, delay timeline, and cascading filters (borough, complaint type, agency, delay bucket, status)
- **Map** — Leaflet map of NYC requests with server-side filtering; markers colored by delay bucket or complaint type; click a marker for details and (for open requests) jump to the Model view
- **Model view** — Searchable case selector with SHAP waterfall explanation, feature table, and location preview for open/unresolved requests
- **Shared filter context** — Dashboard and Model views share global filters; the Map seeds from dashboard filters on first load, then maintains its own local filter state
- **Light / dark mode**

## Tech stack

- **Frontend:** React 19, Vite, Material UI, D3, Recharts, Leaflet
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **ML:** CatBoost via Python subprocess (`backend/ML/predict_batch.py`)

## Prerequisites

- **Node.js** 18+
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **Python 3.10+** with CatBoost — only required for live prediction endpoints; dashboard and map work without it if predictions are already stored in MongoDB

## Quick start

Run the backend and frontend in **two terminals**.

### 1. Backend

```bash
cd backend
npm install

# Configure environment (required for Atlas; optional for local MongoDB)
cp .env.example .env
# Edit .env — set MONGODB_URI, DB_NAME, and PORT

npm run dev
```

The API listens on [http://localhost:5001](http://localhost:5001).

Verify it is running:

```bash
curl http://localhost:5001/api/health
```

**One-off / production run:**

```bash
npm start
```

**Optional — ML inference (live predictions + SHAP):**

```bash
pip install -r ML/requirements.txt

# Place the trained model (if not already present):
# cp /path/to/catboost_model.pkl ML/catboost_model.pkl
```

On first startup the server connects to MongoDB, ensures indexes, and warms aggregation caches. If the database is empty, it may seed from frontend mock data.

### 2. Frontend

```bash
cd civic-lens-frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api/*` to `http://localhost:5001`.

**Production build:**

```bash
npm run build
npm run preview
```

Set `VITE_API_BASE_URL` when the API is hosted separately from the static frontend (e.g. `https://api.example.com`).

## Environment variables

Create `backend/.env` from `backend/.env.example`. The `.env` file is gitignored — never commit credentials.

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://127.0.0.1:27017` | MongoDB connection string (local or Atlas) |
| `DB_NAME` | `civic_lens` | Database name |
| `PORT` | `5001` | API port |
| `SHOWCASE_YEAR` | `2026` | Year filter for API data (`created_date` in this year) |
| `CATBOOST_MODEL_PATH` | `backend/ML/catboost_model.pkl` | Path to trained CatBoost model |
| `PYTHON_PATH` | `python3` | Python executable for inference |
| `PAGE_SIZE` | `5000` | Default page size for `GET /api/requests` |
| `MAX_PAGE_SIZE` | `10000` | Max `limit` per page |
| `CASE_LIST_PAGE_SIZE` | `50` | Page size for model case selector |
| `AGG_CACHE_TTL_MS` | `300000` | Dashboard/map aggregation cache TTL (ms) |

### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | *(empty — use Vite proxy)* | API base URL for production builds |
| `VITE_REQUEST_PAGE_SIZE` | `5000` | Client pagination batch size |

## Data model notes

- The API serves **2026** records from the `requests_clean` collection.
- **Open / unresolved** requests (`is_unresolved = 1`) include CatBoost predictions and SHAP explanations.
- **Closed** requests appear in analytics and on the map using **actual** response-time buckets; open requests use **predicted** buckets.
- Map delay-bucket filtering and coloring are status-aware: `predicted_bucket` for open requests, `actual_bucket` (from `response_hours`) for closed requests.

## API reference

### Health & predictions

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check, dataset counts |
| `GET /api/predict/status` | CatBoost model availability |
| `POST /api/predict` | Batch predict raw request records |

### Requests

| Endpoint | Description |
|----------|-------------|
| `GET /api/requests` | Paginated requests with optional filters |
| `GET /api/requests/:id` | Single request by `unique_key` or `_id` |
| `GET /api/requests/facets` | Static facet lists |
| `GET /api/requests/stats` | Request-level stats |
| `POST /api/requests/import/bulk` | Bulk import |

**Common query parameters** (requests, dashboard, map, facets):

| Param | Values | Description |
|-------|--------|-------------|
| `borough` | e.g. `Manhattan` | Borough filter |
| `complaint_type` | e.g. `Noise` | Complaint type |
| `agency` | e.g. `NYPD` | Agency code |
| `delay_bucket` | `Same Day`, `1–3 Days`, `3–7 Days`, `More than 1 Week` | Delay bucket |
| `status` | `Open`, `Closed`, `All` | `Open` → `is_unresolved=1`; `Closed` → `is_unresolved=0` |
| `highDelayOnly` | `1` | Map: predicted delay ≥ 72h |
| `mapBuckets` | `1` | Map: status-aware bucket filtering |
| `mlOnly` | `1` | Open/unresolved only (model case list) |
| `caseList` | `1` | Compact rows for case selector |
| `search` | string | Case selector text search |
| `sort` | `predicted_delay_desc`, etc. | Case list sort order |

### Aggregations (dashboard & map)

| Endpoint | Description |
|----------|-------------|
| `GET /api/facets` | Cascading facet options |
| `GET /api/dashboard` | Dashboard bundle (stats, borough burden, complaints, timeline) |
| `GET /api/map-bundle` | Map bundle (stats + map points) |
| `GET /api/map-points` | Map markers only |
| `GET /api/stats` | KPI stats |
| `GET /api/borough-burden` | Borough aggregation |
| `GET /api/complaint-drivers` | Top complaint types |
| `GET /api/delay-trend` | Monthly delay trend |

## Project structure

```
CivicLens/
├── backend/
│   ├── .env.example       # Template for backend/.env
│   ├── controllers/       # Express route handlers
│   ├── ML/                # CatBoost Python predictor + feature medians
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes (requests, stats, predict)
│   ├── services/          # Aggregations, predictions, facets, seeding
│   └── utils/             # Query filters, delay buckets, normalization
└── civic-lens-frontend/
    ├── src/
    │   ├── api/           # Fetch helpers (dashboard, requests)
    │   ├── components/    # Charts, map, filters, model panels
    │   ├── context/       # Shared filter context
    │   ├── hooks/         # useMapData, useDashboardData, useCaseList, …
    │   └── pages/         # Home, Dashboard, Map, Model
    └── vite.config.js     # Dev proxy → localhost:5001
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `EADDRINUSE` on port 5001 | Stop the other process or set `PORT=5002` in `backend/.env` |
| `Failed to start server` / MongoDB errors | Check `MONGODB_URI` in `backend/.env`; confirm Atlas IP allowlist or local MongoDB is running |
| Frontend shows fetch errors | Ensure the backend is running on the port Vite proxies to (5001) |
| Empty map / dashboard | Confirm data exists for `SHOWCASE_YEAR` (default 2026) in the configured database |
| Model view missing SHAP | Install Python deps and place `catboost_model.pkl`; predictions must exist for open cases |
| Slow first load | Normal — aggregation cache warms on backend startup (~10–15s for large datasets) |

## Course

Built for ECS 273 at UC Davis.
