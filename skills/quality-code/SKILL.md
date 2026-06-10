---
name: quality-code
description: Use when writing or reviewing TypeScript/full-stack code. Encodes principles for type safety (branded types, discriminated unions, end-to-end types), real tests over mocks, OpenTelemetry observability, and picking the right abstractions instead of premature ones.
---

# Writing quality full-stack TypeScript

Apply these principles when writing or reviewing TypeScript code.

## Make impossible states unrepresentable

Use the type system to make invalid states fail at compile time. Fewer reachable states = easier code to read and change.

### Branded types

Brand primitives so they can't be mixed up. Validate once at the boundary; downstream code trusts the type.

Use Effect's `Schema.brand` instead of rolling your own branded-type helper. Follow the real example in [`examples/effect-branded-types.ts`](examples/effect-branded-types.ts).

### Discriminated unions over flag bags

When one field controls which other fields are valid, model that as a union. Don't use nullable fields that allow contradictory states. For a real Effect Schema example where `completed` statements must have a verdict and verdict reason, see [`examples/effect-discriminated-unions.ts`](examples/effect-discriminated-unions.ts).

```ts
// Don't - invalid combos representable
type State = { loading: boolean; user?: User; error?: string };

// Do - only valid states exist
type State =
  | { status: "loading" }
  | { status: "success"; user: User }
  | { status: "error"; error: string };
```

## Let the types flow end-to-end

DB schema -> server -> client should share types without manual duplication. Use whatever end-to-end type tool the project already has (tRPC, oRPC, Elysia, TanStack Start). A `users.email` branded as `Email` should arrive on the client still branded.

Don't restate types you can derive. Reach for `Pick`, `Omit`, `Parameters`, `ReturnType`, `Awaited`, `typeof` etc. before writing a new interface. Named aliases are good when they derive from the source of truth, e.g. `type User = ...`. For function arguments, infer from the source instead of typing them by hand:

```ts
// Don't - duplicate shape, drifts when the row changes
type UserSummary = { id: string; email: Email };
function renderUser(u: UserSummary) {
  /* ... */
}

// Do - derive from the source of truth
type User = Awaited<ReturnType<typeof db.query.users.findFirst>>;
function renderUser(u: Pick<User, "id" | "email">) {
  /* ... */
}
```

## Pass objects, not positional args

```ts
// Don't - swap two args, still compiles
sendEmail("Welcome!", "Hi there");
// Do - order-independent, self-documenting
sendEmail({ to: "alice@x.com", body: "Hi there" });
```

Do this by default, even for functions with only 2-3 args. If the function is really low-level and called in tight loops, it's ok to use positional args for performance, but prefer objects in most cases.

## Effect Schema for shared validation

Use `Schema` from Effect for shared validation and type derivation.

## Writing Effects

Use `Effect.gen` or `Effect.fn` when composing Effects. Prefer them over deeply nested `pipe(..., Effect.flatMap(...))` chains when the logic has multiple dependent steps.

Keep the effect body focused on the happy path. Add control logic like retries, error mapping/catching, timeouts, and instrumentation by piping the resulting Effect, or by using the second argument to `Effect.fn`.

Example files should not execute Effects at module load time. Keep `program` as an Effect value, and export a small `run` function to define a sane execution boundary while keeping the run path type-checked.

Follow the real example in [`examples/effect-gen-fn.ts`](examples/effect-gen-fn.ts).

```ts
const loadUserProfile = Effect.fn("loadUserProfile")(
  function* (input: { userId: UserId }) {
    const user = yield* getUser({ id: input.userId });
    const profile = yield* getProfile({ userId: user.id });

    return { user, profile };
  },
  (effect) =>
    effect.pipe(
      Effect.retry({ times: 2 }),
      Effect.mapError((cause) => new UserProfileLoadFailed({ cause })),
    ),
);
```

For local composition, use `Effect.gen` and pipe control logic around the composed program:

```ts
const program = Effect.gen(function* () {
  const user = yield* getUser({ id });
  const profile = yield* getProfile({ userId: user.id });

  return { user, profile };
}).pipe(Effect.withSpan("loadUserProfile"));

export const run = () => Effect.runSync(program);
```

## Tests as real as possible

Write tests with `@effect/vitest`.

Don't mock things you can run. Spin up real services:

- LocalStack for AWS
- Miniflare for Cloudflare Workers
- Real Postgres/SQLite (e.g. `bun:sqlite`), not a mock DB

Mock only third-party services that have no test environment.

## OpenTelemetry, not print logging

When adding observability, instrument with OTel spans. The setup cost pays back the first time a user sends a request ID and you can answer instead of guess.
