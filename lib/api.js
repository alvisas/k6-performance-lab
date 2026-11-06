import http from "k6/http";
import { BASE_URL, HEADERS } from "./config.js";

// Every request carries a `name` tag so k6 reports latency per
// endpoint instead of one blended number.

export function listUsers(page) {
  return http.get(`${BASE_URL}/users?page=${page}`, {
    headers: HEADERS,
    tags: { name: "GET /users" },
  });
}

export function getUser(id) {
  return http.get(`${BASE_URL}/users/${id}`, {
    headers: HEADERS,
    tags: { name: "GET /users/:id" },
  });
}

export function createUser(name, job) {
  return http.post(
    `${BASE_URL}/users`,
    JSON.stringify({ name, job }),
    { headers: HEADERS, tags: { name: "POST /users" } }
  );
}
