# k6 portfolio project

Load testing scripts written for [Grafana k6](https://k6.io), run against the public [REQ|RES](https://reqres.in) test API. Built as practice and as a portfolio piece for performance testing work.

## The three scenarios

| Script | What it does | Target |
|---|---|---|
| `scripts/smoke.js` | Confirms the main endpoints work with 1 virtual user | p95 under 1 s, error rate under 5% |
| `scripts/load.js` | Simulates normal traffic: ramp to 10 users, steady, ramp down | p95 under 800 ms, error rate under 1% |
| `scripts/stress.js` | Pushes to 80 users to find the breaking point | error rate under 10% (relaxed on purpose) |

Failures against the thresholds show up in the end-of-test summary with a red mark, so a run is easy to read at a glance.

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

## Notes

- REQ|RES serves real responses for user list, single user, and create endpoints, but POST data is fake and nothing is stored. That makes it safe to hammer with a stress test.
- The stress script is read-only, so a heavy run does not pile up test data.
When you attach results to a bug report or a portfolio write-up, include the error rate plus p95 and p99, not just the average.
