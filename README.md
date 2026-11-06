# k6-performance-lab

Load testing scripts for [Grafana k6](https://k6.io), run against the public [REQ|RES](https://reqres.in) test API. Three scenarios, each with checks and thresholds, plus a CI workflow and an optional Grafana stack.

## The three scenarios

| Script | What it does | Target |
|---|---|---|
| `scripts/smoke.js` | Confirms the main endpoints work with 1 virtual user | p95 under 1 s, error rate under 5% |
| `scripts/load.js` | Simulates normal traffic: ramp to 10 users, steady, ramp down | p95 under 800 ms, error rate under 1% |
| `scripts/stress.js` | Pushes to 80 users to find the breaking point | error rate under 10% (relaxed on purpose) |

When a threshold fails, the end-of-test summary marks it red.

## Running

```bash
brew install k6   # or see https://k6.io/docs/get-started/installing
```

```bash
k6 run scripts/smoke.js
k6 run scripts/load.js
k6 run scripts/stress.js
```

To save the summary JSON:

```bash
mkdir -p results
k6 run --summary-export=results/load.json scripts/load.js
```

Both the target URL and the REQ|RES API key can be overridden with env vars:

```bash
BASE_URL="https://other-api.example.com" REQRES_API_KEY="my-key" k6 run scripts/smoke.js
```

## Watching a run live

k6 ships a web dashboard you open in the browser while the test runs.

```bash
k6 run --out web-dashboard scripts/load.js
# open http://localhost:5665/dashboard
```

For numbers that persist after the test ends, the same data can go to Prometheus and Grafana through the compose stack:

```bash
docker compose up -d
K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write \
  k6 run --out experimental-prometheus-rw scripts/load.js
# Grafana at http://localhost:3000 (admin/admin), import dashboard ID 19665
```

## Continuous integration

The `k6 smoke` workflow runs the smoke script on every push, every pull request, and on a weekly schedule so the part that depends on a public API does not rot silently. Results land in the run's GitHub summary as a markdown table, and the full JSON goes to an artifact named `smoke-summary`. Since k6 does not create the output directory itself, the workflow makes one first.

## Notes

- REQ|RES serves real responses for user list, single user, and create endpoints, but POST data is fake and nothing is stored. That makes it safe to hammer with a stress test.
- Every request carries a `name` tag, so per-endpoint latency shows up as `http_req_duration{name=...}` in the metrics instead of one blended number.
- The stress script is read-only, so a heavy run does not pile up test data.
- The anonymous demo key allows 40 requests per day per IP, so a couple of runs can burn through it and everything starts returning 429. Register at reqres.in for a free personal key (250 requests per day) and set it as `REQRES_API_KEY` locally and as a GitHub Actions secret to keep runs clean.
- When you attach results to a bug report, include the error rate plus p95 and p99, not just the average.
