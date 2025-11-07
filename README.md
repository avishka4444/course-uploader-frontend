# Frontend File Manager

React + Vite frontend for the file management system. Provides upload UI, metadata table, and download links. Tailwind CSS for styling, React Query for data fetching.

## Getting Started

```bash
npm install
npm run dev
```

The dev server proxies API calls to `http://localhost:8080/api` by default. Adjust `vite.config.ts` if your backend runs elsewhere.

## Available Scripts

- `npm run dev` – start Vite dev server
- `npm run build` – type-check and build for production
- `npm run preview` – preview production build locally
- `npm run lint` – run ESLint

## Environment

Expected REST endpoints:

- `POST /api/files` – upload a file (multipart/form-data)
- `GET /api/files` – list file metadata
- `GET /api/files/:id` – download file

Tailwind scans `index.html` and files under `src/` for class names.
