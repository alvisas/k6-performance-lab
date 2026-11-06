import http from "k6/http";
import { check } from "k6";
import { BASE_URL, HEADERS } from "../lib/config.js";

// Load test: steady expected traffic, mix of reads and writes.
// Acceptance target: p95 under 800 ms and error rate under 1%.

export const options = {
  stages: [
    { duration: "30s", target: 5 },   // ramp up
    { duration: "1m", target: 10 },   // stay at normal load
    { duration: "30s", target: 10 },
    { duration: "30s", target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800"],
  },
};

export default function () {
  const responses = http.batch([
    { method: "GET", url: `${BASE_URL}/users?page=1`, params: { headers: HEADERS } },
    { method: "GET", url: `${BASE_URL}/users?page=2`, params: { headers: HEADERS } },
    { method: "GET", url: `${BASE_URL}/users/2`, params: { headers: HEADERS } },
  ]);

  check(responses[0], { "page 1 status is 200": (r) => r.status === 200 });
  check(responses[1], { "page 2 status is 200": (r) => r.status === 200 });
  check(responses[2], { "user 2 status is 200": (r) => r.status === 200 });

  const created = http.post(
    `${BASE_URL}/users`,
    JSON.stringify({ name: "nebula", job: "portfolio tester" }),
    { headers: HEADERS }
  );
  check(created, {
    "create status is 201": (r) => r.status === 201,
  });
}
