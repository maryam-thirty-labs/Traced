# 🩺 Traced

> An anatomy-first medical learning platform with RAG-grounded explanations, mystery cases, gamification, multiplayer, and a community layer.

![Demo](DEMO_GIF_PLACEHOLDER)

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?logo=spring-boot)](https://spring.io/projects/spring-boot)

## What it does

Traced lets you click any part of a body model to learn the anatomy, the diseases that affect it, and the mechanisms behind those diseases. Every disease card breaks the name down into its word roots so you actually understand what "cholecystitis" or "cholangitis" mean instead of just memorising them. Once you have learned a topic, mystery cases test whether you can reason through a presentation without being told the answer up front.

## Demo

![Demo](DEMO_GIF_PLACEHOLDER)

- Click any organ to explore diseases and mechanisms
- Solve mystery cases to earn XP
- Read grounded explanations with source citations
- Compete in multiplayer anatomy challenges

## Why I built this

I was at a crossroads after my CS degree -- medicine was on the table as a 
possible path, and I wanted to know if I actually cared about the space or 
was just romanticising it. Building Traced was partly the test. If I enjoyed 
building an anatomy learning app I would learn something about whether I 
genuinely cared. I did enjoy it - and the further I got the more I noticed 
what was missing. Nobody breaks down the terminology. Every medical term is 
built from Greek and Latin roots, and once you can break them down the 
vocabulary stops feeling arbitrary. No resource I found did this - they all 
just listed disease names and expected memorisation.

The other gaps were just as clear. Most anatomy tools are encyclopaedias - 
you look things up passively. Traced is progression-based, closer to Duolingo 
than a textbook. The RAG pipeline surfaces uncertainty explicitly rather than 
presenting everything with equal confidence, which felt important for a medical 
context where overconfidence is genuinely dangerous. And connecting anatomy 
exploration directly to clinical reasoning cases creates a loop - explore, 
understand, apply - that makes learning stick rather than just accumulate.

## Architecture

```
Next.js (frontend)
    |
Spring Boot (authority service) - canonical IDs, case engine, progression
    |                    |
FastAPI              Redis
(RAG pipeline)    (explanation + recommendation cache)
    |
PostgreSQL 16 + pgvector
```

Key architectural decisions:

- AnatomogramAdapter is the only place anatomy IDs are translated - nothing outside the adapter ever sees raw ontology IDs
- Spring Boot owns all canonical IDs - FastAPI never mints new ones
- Frontend calls Spring Boot only - never FastAPI directly
- FastAPI proposes evidence claims, Spring Boot approves - CANDIDATE claims never reach the product UI
- currentLevel is derived by LevelService from totalXp - never persisted, never trusted from client

## Key engineering challenges

- Canonical ID isolation - AnatomogramAdapter as single translation point means the rest of the app is completely decoupled from the anatomy library
- Evidence approval pipeline - CANDIDATE claims filtered at service layer before any explanation is generated. No freeform LLM answers without approved evidence
- LevelService pure computation - calculateLevel(totalXp) has zero repository interactions. Deterministic, testable, never stored
- Case title invariant - mystery case titles must not contain the linked disease name. Validated on every CREATE and UPDATE, not just seeding
- Hybrid retrieval - pgvector cosine similarity combined with BM25 scoring. Combined score = 0.6 semantic + 0.4 BM25
- Confidence scoring - single-chunk support reduces confidence score as a policy. Multi-source HIGH confidence requires 3 or more approved claims

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Authority service | Spring Boot 3.x, Java 21, JPA, Flyway |
| Intelligence service | FastAPI, Python 3.12 |
| Database | PostgreSQL 16 + pgvector |
| Cache | Redis 7 |
| AI/ML | OpenAI text-embedding-3-small, NICE + MedlinePlus + PubMed RAG pipeline |

## Features

- Interactive body model with clickable organs across 7 systems
- Etymology breakdowns on every disease card - word roots explained
- Mystery cases in Easy, Medium, and Hard difficulty
- XP, levels, streaks, badges, and mastery tracking per system
- RAG-grounded explanations with source citations and confidence labels
- Uncertainty surfaced clearly when evidence is limited or conflicting
- Global and university leaderboards with weekly resets
- Discord-style community chat with user-created topic channels
- Multiplayer - Name that Structure, Trace the System, Mystery Diagnosis

## Running locally

```bash
# Start infrastructure
docker compose up

# Start Spring Boot
cd backend/core-service
./mvnw spring-boot:run

# Start FastAPI
cd backend/intelligence-service
uvicorn app.main:app --reload

# Start Next.js
cd frontend
npm install
npm run dev
```

## Roadmap

- [ ] Speciality mapping - anatomy through the lens of each clinical speciality
- [ ] Mobile app
- [ ] A-level biology curriculum alignment
- [ ] Institution licensing for schools and universities

## License

Apache 2.0

---

*Built by [Maryam Yousuf](https://github.com/maryam-ai-dev)*
