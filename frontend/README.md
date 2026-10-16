# CloudWatchX frontend

React and Vite client for the CloudWatchX monitoring dashboard.

## Local development

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

When `VITE_API_BASE_URL` is unset during development, API requests use
`http://localhost:5000`.

## Deploying the frontend to Vercel

1. Import the repository into Vercel.
2. Set the project root directory to `frontend`.
3. Vercel uses `vercel.json` to build with `npm run build` and publish `dist`.
4. Set the Vercel environment variable `VITE_API_BASE_URL` to the public origin
   of the deployed backend, for example `https://api.example.com` (no trailing
   slash and no `/api` path).
5. Redeploy after setting or changing the environment variable.

The backend must be deployed and reachable over HTTPS for login, monitoring,
and endpoint API requests to work from the hosted site. Configure the backend
to allow browser requests from the Vercel site's origin. Prometheus must also
be reachable by the backend; the frontend does not connect to Prometheus
directly.

Patch Management and Software Deployment currently use illustrative data and
simulated actions. They do not scan endpoints or install patches/software.
