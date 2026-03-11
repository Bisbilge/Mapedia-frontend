# Mapedia — Frontend

> React/Vite frontend for [mapedia.org](https://mapedia.org) — the free, open encyclopedia of physical places.

**[mapedia.org](https://mapedia.org)** · [Backend repo](https://github.com/Bisbilge/Mapedia) · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

---

## Overview

This repository contains the frontend for Mapedia. It communicates with the Mapedia backend via a public REST API and renders venue pages, category browsing, interactive maps, user contributions, and moderation tools.

---

## Tech Stack

| | |
|---|---|
| Framework | React 18 |
| Build tool | Vite |
| Routing | React Router v6 |
| Maps | Leaflet + react-leaflet |
| HTTP client | Axios |
| SEO | react-helmet-async |
| Styling | CSS |

---

## Getting Started

```bash
git clone https://github.com/Bisbilge/Mapedia-frontend.git
cd Mapedia-frontend

npm install
cp .env.example .env   # set VITE_API_BASE_URL
npm run dev
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the Mapedia API — e.g. `https://mapedia.org/api/v1` |

---

## Project Structure

```
src/
├── api/           # Axios client and endpoint wrappers
├── components/    # Shared UI components (Navbar, etc.)
├── pages/         # Route-level page components
│   ├── VenuePage.jsx
│   ├── CategoryPage.jsx
│   ├── HomePage.jsx
│   └── ...
├── styles/        # Global and component CSS
└── main.jsx
```

---

## Features

- **Venue pages** — structured metadata, Leaflet map, ratings, programmatic SEO
- **Category browsing** — filterable venue lists with field-based filters
- **Contribution flow** — add venues, propose categories, submit field values
- **Moderation UI** — approve/reject contributions (for category moderators)
- **SEO** — JSON-LD schema (LocalBusiness, BreadcrumbList, FAQPage), canonical URLs, Open Graph
- **Open data** — ODbL and CC BY-SA 4.0 attribution throughout

---

## Related

- **Backend:** [github.com/Bisbilge/Mapedia](https://github.com/Bisbilge/Mapedia)
- **Live:** [mapedia.org](https://mapedia.org)
- **API:** [mapedia.org/api/v1/](https://mapedia.org/api/v1/)
- **Data license:** [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

---

## License

MIT