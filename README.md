# CivicLens

An interactive dashboard for exploring NYC 311 service requests. CivicLens combines visual analytics with a machine-learning view to help understand complaint patterns, service burden, and predicted response delays across New York City boroughs.

## Features

- **Dashboard** — KPIs, service burden map, complaint treemap, delay timeline, and hotspot explorer
- **Model view** — Delay-risk predictions with SHAP-style feature explanations for individual requests
- **Filters** — Slice data by borough, complaint type, agency, date range, and more
- **Light / dark mode**

## Tech stack

React, Vite, Material UI, D3, Recharts, Framer Motion

## Getting started

**Prerequisites:** Node.js 18+

```bash
cd civic-lens-frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

Run these from `civic-lens-frontend`:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Project structure

```
CivicLens/
└── civic-lens-frontend/   # React app
    ├── src/
    │   ├── pages/         # Dashboard and Model views
    │   ├── components/    # Charts, filters, layout
    │   ├── data/          # Mock 311 request data
    │   └── utils/         # Analytics and ML helpers
    └── package.json
```

## Data

The app currently uses mock NYC 311 data in `civic-lens-frontend/src/data/mockRequests.js` for demos and development.

## Course

Built for ECS 273 at UC Davis.
