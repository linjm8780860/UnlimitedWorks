# Unlimited Works frontend prototype

The Next.js home route serves the extracted compiled frontend from `reference/compiled-frontend` as the visual reference. `/studio` keeps the React Flow SaaS mock with mock project, skill, plugin, automation, and generation data.

## Run

```sh
npm install
npm run dev
```

Open http://127.0.0.1:4173. The compiled app still expects its desktop bridge on localhost ports 9466/9467 and 9476/9477; those APIs are not mocked yet. The `/studio` prototype has no authentication or production API integration; the shared BizyHome account system can be connected later.
