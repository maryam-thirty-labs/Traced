# Chat Realtime (Supabase)

## How it works

1. Spring Boot owns all chat writes (`POST /api/chat/channels/{id}/messages`).
2. The write commits to Postgres.
3. Supabase Realtime watches `chat_messages` via logical replication and broadcasts INSERT events.
4. The frontend subscribes per-channel via `subscribeToChannel(channelUuid, onInsert)`.
5. When a Realtime event arrives, the new message is appended to the feed without a refresh.

## Why not WebSockets in Spring Boot?

Phase 11 uses STOMP for multiplayer game state — tightly coupled, low-latency. Chat is
loose and fanout-heavy, so Supabase Realtime (Postgres CDC) is a better fit.

## Keys

| Key | Where | Safe to expose? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend env | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend env | Yes (RLS protects DB) |
| `SUPABASE_SERVICE_ROLE_KEY` | NEVER frontend | No — backend only, not used in v1 |

## Channel scoping

Subscriptions use `filter: channel_id=eq.{uuid}`. A client subscribed to `general`
will not receive events from `cardio`, enforced by Postgres row filters before
broadcast.

## Graceful fallback

If `NEXT_PUBLIC_SUPABASE_URL` is unset, `getSupabaseClient()` returns null and
`subscribeToChannel()` is a no-op. The feed still loads via `GET /messages`.

## Deployment steps (not part of v1 code)

1. Create a Supabase project pointing at the same Postgres database.
2. Enable Realtime on `chat_messages`.
3. Add Row Level Security: SELECT allowed when `status = 'VISIBLE'`.
4. Populate the env vars above.
