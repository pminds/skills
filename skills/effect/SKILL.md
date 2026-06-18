---
name: effect
description: Use this skill whenever the user is working with Effect-TS — error handling, typed errors, Data.TaggedError, Schema.TaggedError, catching errors, services, Context, Tag, Layer, ManagedRuntime, runtimes, GraphQL, Pothos, streams, or testing. This is the umbrella skill for Effect-TS patterns. Prefer it over generic TypeScript advice whenever Effect-TS, Effect, Layer, ManagedRuntime, Effect.fail, catchTag, catchAll, or Data.TaggedError appear in the conversation, even if the user does not explicitly ask for an "Effect skill".
---

# Effect-TS

This skill covers common Effect-TS patterns. Identify the topic the user is asking about, then read the relevant reference file before answering or writing code.

## Reference topics

- **errors** — `Data.TaggedError`, `Schema.TaggedError`, catching with `catchTag`/`catchTags`, matching, and exhaustiveness. Read `references/errors.md`.
- **graphql** — `ManagedRuntime` with GraphQL/Pothos, context, thin resolvers. Read `references/graphql.md`.

More references will be added as the skill grows (services, runtime, streams, testing, etc.).

## How to use this skill

1. Read the reference file for the user's topic.
2. Apply the patterns there to the user's specific code.
3. If the topic spans multiple references, read each one.
4. Keep answers concise and grounded in the user's code.
