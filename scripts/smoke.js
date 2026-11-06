import http from "k6/http";
import { check } from "k6";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.2/index.js";
import { BASE_URL, HEADERS } from "../lib/config.js";

// Smoke test: verify that the main endpoints respond correctly
// with minimal load. Run before anything else.

export const options = {
  vus: 1,
  iterations: 5,
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<1000"],
  },
};

export default function () {
  // GET list of users
  const list = http.get(`${BASE_URL}/users?page=2`, { headers: HEADERS });
  check(list, {
    "list status is 200": (r) => r.status === 200,
    "list has data array": (r) => Array.isArray(r.json("data")),
  });

  // GET single user
  const single = http.get(`${BASE_URL}/users/2`, { headers: HEADERS });
  check(single, {
    "single status is 200": (r) => r.status === 200,
    "single has email": (r) => r.json("data") && r.json("data").email,
  });

  // POST create user
  const created = http.post(
    `${BASE_URL}/users`,
    JSON.stringify({ name: "morpheus", job: "leader" }),
    { headers: HEADERS }
  );
  check(created, {
    "create status is 201": (r) => r.status === 201,
    "create returns id": (r) => r.json("id"),
  });
}

// Custom summary: markdown table in the GitHub Actions run,
// full JSON for the uploaded artifact, text summary on stdout locally.
export function handleSummary(data) {
  const m = data.metrics;
  const md = [
    "## k6 smoke test",
    "",
    "| Metric | Value |",
    "|---|---|",
    `| Checks | ${(m.checks.values.rate * 100).toFixed(1)}% |`,
    `| HTTP errors | ${(m.http_req_failed.values.rate * 100).toFixed(1)}% |`,
    `| p95 duration | ${(m.http_req_duration.values["p(95)"] / 1000).toFixed(2)} s |`,
    `| Total requests | ${m.http_reqs.values.count} |`,
  ].join("\n");

  const out = {
    "./results/smoke.json": JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
  if (process.env.GITHUB_STEP_SUMMARY) {
    out[process.env.GITHUB_STEP_SUMMARY] = { data: md };
  }
  return out;
}
