# Redis Key Definitions — Traced

Exactly 2 active jobs. Do not add keys without updating this file and `CLAUDE.md`.

| Key pattern | Job | Written by | Read by | TTL | Lifecycle |
|---|---|---|---|---|---|
| `exp:cache:{canonicalId}` | Explanation cache | Spring Boot (after FastAPI grounding) | Spring Boot (read-through) | 10 min | Written on cache miss; evicted on TTL expiry |
| `exp:cache:spec:{anatomyId}:{specialityId}` | Speciality-framed explanation cache | Spring Boot (after FastAPI speciality grounding) | Spring Boot (read-through) | 10 min | Written on cache miss; evicted on TTL expiry |
| `rec:cache:{canonicalId}` | Recommendation cache | Reserved for future use | — | — | Not yet active |
