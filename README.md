# easycalcnow

React + TypeScript + Tailwind + Vite. Express server for Railway.

## Local dev
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Run locally (serve built app)
```bash
npm start
```

## Deploy to Railway
1. Push this repo to GitHub.
2. On Railway: New Project → Deploy from GitHub → select this repo.
3. Railway auto-detects Node. Set **Root Directory** to `/` and no Nixpacks config needed.
4. Default build command: `npm run build`
   Default start command: `npm start`
5. Add a domain in Railway once deployment is healthy.
