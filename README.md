# Civic Lens

Civic Lens is an interactive visual analytics system for exploring NYC 311 service requests. It helps users understand where city service delays happen, which complaint types create the most burden, and why some requests are predicted to take longer.

## Features

- **Home:** Project overview and system introduction
- **Dashboard:** Borough burden, complaint drivers, and delay trends
- **NYC Map:** Request-level spatial exploration using latitude and longitude
- **Model View:** Predicted response delay with SHAP-style explanations
- **Filters:** Explore data by borough, agency, complaint type, status, and delay bucket
- **Light/Dark Mode:** Responsive interface with shared styling

## Tech Stack

- React + Vite
- Material UI
- D3.js / Recharts
- Leaflet / React-Leaflet
- Node.js + Express
- MongoDB / Mongoose
- CatBoost model through Python subprocess

## Prerequisites

Install the following before running the project:

- Node.js 18+
- MongoDB local instance or MongoDB Atlas
- Python 3.10+ only if using live CatBoost prediction endpoints

## Installation

From the project root:

```bash
npm install
npm run install:all
cp backend/.env.example backend/.env   # if not already done
```

Edit `backend/.env` and set your MongoDB connection string. The defaults work for a local MongoDB instance:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=civic_lens
PORT=5001
```

## Run the App

Start both the frontend and backend together:

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

- **Frontend:** Vite dev server on port 5173
- **Backend:** Express API on port 5001 (proxied through Vite during development)

Check that the backend is healthy:

```bash
curl http://localhost:5001/api/health
```

To debug one service at a time:

```bash
npm run dev:frontend
npm run dev:backend
```

## How It Works

The app reads NYC 311 request data from MongoDB. The Dashboard and Map show borough burden, complaint trends, and request locations. The Model View focuses on open requests with predicted response delays and explanation factors.

Large datasets are not stored in this repo. Data should be loaded into MongoDB separately. The API serves records from the `requests_clean` collection, filtered by year (default **2026**).

For live predictions and SHAP explanations, install Python dependencies and place the trained model:

```bash
cd backend
pip install -r ML/requirements.txt
# cp /path/to/catboost_model.pkl ML/catboost_model.pkl
```

## Project Structure

```
CivicLens/
├── civic-lens-frontend/   # React + Vite UI
├── backend/               # Express API, MongoDB models, ML scripts
├── package.json           # Root dev scripts
└── README.md
```

## Troubleshooting

**Frontend does not load** — Make sure port 5173 is free and Vite started without errors.

**Backend fails to start** — Check `backend/.env`, confirm MongoDB is running, and verify your Atlas IP allowlist if using Atlas.

**Fetch errors in the browser** — The backend must be running on port 5001.

**Empty dashboard or map** — Confirm data exists in MongoDB for the configured year (default 2026).

**Model view missing predictions** — Install Python deps, add `catboost_model.pkl`, and ensure open requests exist in the database.

**Port already in use** — Stop the other process or change `PORT` in `backend/.env`.

**Unclear startup failure** — Run `npm run dev:frontend` and `npm run dev:backend` separately to see which service fails.

## Course

Built for ECS 273 at UC Davis.
