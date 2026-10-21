# EC2 deployment

This deployment runs the backend and Prometheus on the same EC2 host. Prometheus
is only reachable on the private Docker network; Caddy exposes the API over
HTTPS. The Vercel frontend should use the Caddy API domain.

## Requirements

- An Ubuntu EC2 instance with Docker Engine and the Docker Compose plugin.
- A DNS name you control, with an `A` record pointing to the instance's Elastic
  IP (recommended) or current public IPv4 address.
- EC2 security-group inbound rules for HTTP `80` and HTTPS `443`. Do not expose
  Prometheus `9090` or the backend port `5000` publicly.
- Node Exporter running on each monitored Linux endpoint. For this EC2 host,
  register its private IPv4 address in the dashboard. Allow TCP `9100` only
  from this EC2 instance/security group, not from the whole internet.

## Configure and start

On the EC2 instance, clone the repository and enter its root directory. Create
the untracked configuration files from the examples:

```sh
cp .env.example .env
cp backend/.env.example backend/.env
```

Edit the root `.env` and set `API_DOMAIN` to the DNS name you control, for
example `api.example.com`. Edit `backend/.env` and set `MONGODB_URI` and
`JWT_SECRET` to valid values. Use a rotated MongoDB password and a newly
generated JWT secret; do not commit or share these files.

After DNS points to the EC2 instance and ports `80` and `443` are reachable,
start the stack from the repository root:

```sh
docker compose -f docker-compose.ec2.yml up -d --build
docker compose -f docker-compose.ec2.yml ps
docker compose -f docker-compose.ec2.yml logs --tail=100 backend caddy prometheus
```

Caddy automatically provisions HTTPS for `API_DOMAIN`. Check that the API is
responding:

```text
https://api.example.com/api/health
```

Set `VITE_API_BASE_URL` in Vercel to the same HTTPS origin, without a trailing
slash or `/api`, then redeploy the frontend.

## Prometheus and targets

The Compose configuration sets the backend's `PROMETHEUS_URL` to
`http://prometheus:9090` and shares `prometheus-targets/targets.json` with
Prometheus. Endpoint create, update, and delete actions refresh that file. For
endpoints already in MongoDB, edit and save each endpoint once after deploying
so it is added to the file-based target list.

Prometheus does not publish a host port. Do not add a public `9090` port mapping
or a public security-group rule for it. For a Linux EC2 target, use a private
address reachable from this EC2 host and permit TCP `9100` only from this
instance/security group. Confirm the target becomes healthy at Prometheus'
internal `/targets` page through a secure administrative tunnel if needed.

The backend's existing Kubernetes target provider remains the default for
local development. The shared-file provider is enabled in the EC2 Compose
configuration by `PROMETHEUS_TARGETS_FILE`.
