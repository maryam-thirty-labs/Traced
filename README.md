# Traced

An anatomy-first medical learning platform that connects body structures to disease, mechanism, and treatment — then makes learners prove their understanding through mystery cases.

## Stack

- **Frontend:** Next.js 14+ (App Router)
- **Core API:** Spring Boot 3.x (Java 21)
- **Intelligence API:** FastAPI (Python 3.12)
- **Database:** PostgreSQL 16 + pgvector
- **Cache:** Redis

## Layer map

```
frontend/                  Next.js — UI shell, anatomy explorer, case player, progress
backend/core-service/      Spring Boot — canonical knowledge graph, cases, progression, auth
backend/intelligence-service/  FastAPI — RAG ingestion, retrieval, grounding, claim extraction
infra/                     Docker Compose, Postgres, Redis
contracts/openapi/         Shared OpenAPI specs
docs/                      Architecture and domain documentation
scripts/                   Seed data and utilities
```

## Running locally

```bash
# Infrastructure
docker compose -f infra/docker-compose.yml up

# Spring Boot
cd backend/core-service && ./mvnw spring-boot:run

# FastAPI
cd backend/intelligence-service && uvicorn app.main:app --reload --port 8000

# Next.js
cd frontend && npm run dev

# Seed demo data
psql -U postgres -d traced -f scripts/seed_demo.sql
```

## Environment variables

```
# Next.js (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8080

# FastAPI
SPRING_BASE_URL=http://localhost:8080
OPENAI_API_KEY=...
```
