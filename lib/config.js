// Shared configuration for all scripts.
// Override with env vars, e.g.:
//   BASE_URL="https://reqres.in/api" k6 run scripts/smoke.js

export const BASE_URL = __ENV.BASE_URL || "https://reqres.in/api";

// REQ|RES requires a free API key header since 2025.
export const HEADERS = {
  "Content-Type": "application/json",
  "x-api-key": __ENV.REQRES_API_KEY || "reqres-free-v1",
};
