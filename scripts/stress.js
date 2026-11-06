import http from "k6/http";
import { sleep } from "k6";
import { BASE_URL, HEADERS } from "../lib/config.js";

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
  },
};

export default function () {
  const page = Math.floor(Math.random() * 2) + 1;
  http.get(`${BASE_URL}/users?page=${page}`, { headers: HEADERS });

  const user = Math.floor(Math.random() * 10) + 1;
  http.get(`${BASE_URL}/users/${user}`, { headers: HEADERS });

  sleep(0.5);
}
