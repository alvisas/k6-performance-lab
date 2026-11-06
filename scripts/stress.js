import { sleep } from "k6";
import { listUsers, getUser } from "../lib/api.js";

// Stress test: keep pushing past normal load to find where
// the service starts to break down. Read-only so the spike
// does not create garbage data.

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "30s", target: 20 },
    { duration: "30s", target: 40 },
    { duration: "30s", target: 80 },
    { duration: "1m", target: 80 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.10"], // relaxed: we expect to find the limit
    "http_req_duration{name:GET /users}": ["p(95)<1500"],
  },
};

export default function () {
  const page = Math.floor(Math.random() * 2) + 1;
  listUsers(page);

  const user = Math.floor(Math.random() * 10) + 1;
  getUser(user);

  sleep(0.5);
}
