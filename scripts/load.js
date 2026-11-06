import { check, sleep } from "k6";
import { listUsers, getUser, createUser } from "../lib/api.js";

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
    "http_req_duration{name:GET /users}": ["p(95)<800"],
    "http_req_duration{name:POST /users}": ["p(95)<800"],
  },
};

export default function () {
  const pages = [listUsers(1), listUsers(2)];
  check(pages[0], { "page 1 status is 200": (r) => r.status === 200 });
  check(pages[1], { "page 2 status is 200": (r) => r.status === 200 });

  const single = getUser(2);
  check(single, { "user 2 status is 200": (r) => r.status === 200 });

  const created = createUser("nebula", "tester");
  check(created, {
    "create status is 201": (r) => r.status === 201,
  });

  sleep(0.2);
}
