# Effect Errors

Prefer `Schema.TaggedError` for domain errors so payloads are validated and serializable. Define the error message inside the class with `get message()` so callers only pass data. Use `Data.TaggedError` when you do not need validation or serialization. Prefer one distinct error class per failure case instead of overloading a single error with a status field.

For a complete, type-checked example, see [`errors.example.ts`](./errors.example.ts).

## Creating errors

Use `Schema.TaggedError` as the default. The first argument is the tag; the second is the schema for the payload. The self-type argument is required for recursive schemas but is harmless otherwise.

```ts
import { Schema } from "effect";

class UserNotFound extends Schema.TaggedError<UserNotFound>("UserNotFound")(
  "UserNotFound",
  { userId: Schema.String },
) {
  get message() {
    return `User ${this.userId} not found`;
  }
}

class PaymentFailed extends Schema.TaggedError<PaymentFailed>("PaymentFailed")(
  "PaymentFailed",
  {
    chargeId: Schema.String,
    reason: Schema.Literal(
      "insufficient_funds",
      "card_declined",
      "network_error",
    ),
  },
) {
  get message() {
    return `Payment ${this.chargeId} failed: ${this.reason}`;
  }
}
```

Use `Data.TaggedError` when you do not need validation or serialization.

```ts
import { Data } from "effect";

class UserNotFound extends Data.TaggedError("UserNotFound")<{
  readonly userId: string;
}> {}
```

## Failing with errors

Construct the error with data only; the message is owned by the class.

```ts
import { Effect } from "effect";

const getUser = (userId: string): Effect.Effect<User, UserNotFound> =>
  Effect.gen(function* () {
    const user = yield* Effect.tryPromise({
      try: () => db.user.findById(userId),
      catch: () => new UserNotFound({ userId }),
    });

    if (user === null) {
      return yield* new UserNotFound({ userId });
    }

    return user;
  });
```

## Catching errors

Use `catchTags` for per-error handling, `catchAll` when every error is handled the same way, and `Match.value` inside `catchAll` for exhaustive branching.

```ts
import { Effect } from "effect";

const handled = program.pipe(
  Effect.catchTags({
    UserNotFound: (error) =>
      Effect.succeed({ ok: false as const, message: error.message }),
    PaymentFailed: (error) =>
      Effect.succeed({ ok: false as const, message: error.message }),
  }),
);
```

```ts
import { Effect } from "effect";

const handled = program.pipe(
  Effect.catchAll((error) =>
    Effect.succeed({ ok: false as const, message: error.message }),
  ),
);
```

```ts
import { Effect, Match } from "effect";

const handled = program.pipe(
  Effect.catchAll((error) =>
    Match.value(error).pipe(
      Match.tag("UserNotFound", (e) =>
        Effect.succeed({ ok: false as const, message: e.message }),
      ),
      Match.tag("PaymentFailed", (e) =>
        Effect.succeed({ ok: false as const, message: e.message }),
      ),
      Match.exhaustive,
    ),
  ),
);
```

## Matching error types

Match on a union of errors directly with `Match.value`.

```ts
import { Match } from "effect";

const handleError = (error: UserNotFound | PaymentFailed) =>
  Match.value(error).pipe(
    Match.tag("UserNotFound", (e) => e.message),
    Match.tag("PaymentFailed", (e) => e.message),
    Match.exhaustive,
  );
```

## Rules

- Default to `Schema.TaggedError`. Use `Data.TaggedError` only when you do not need validation or serialization.
- Define the error message with `get message()` inside the class, not at the call site.
- Create one `TaggedError` class per failure case, not one generic error with many status codes.
- Prefer `catchTags` for per-error handling. Use `catchAll` when all errors are handled the same way.
- Use `Match.value` for exhaustive branching on error types or error unions.
- Keep error fields readonly and avoid optional fields when possible.
- When an error type is added or changed, update every `catchTags` / `Match` site so TypeScript catches misses.
