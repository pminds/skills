import { Data, Effect, Match, Schema } from "effect";

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

class PlainUserNotFound extends Data.TaggedError("PlainUserNotFound")<{
  readonly userId: string;
}> {}

const db = {
  user: {
    findById: (id: string): Promise<{ id: string; name: string } | null> =>
      Promise.resolve(null),
  },
};

const getUser = (
  userId: string,
): Effect.Effect<{ id: string; name: string }, UserNotFound> =>
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

const chargePayment = (
  user: { id: string; name: string },
): Effect.Effect<{ id: string; amount: number }, PaymentFailed> =>
  Effect.fail(
    new PaymentFailed({
      chargeId: "charge_123",
      reason: "insufficient_funds",
    }),
  );

const program = Effect.gen(function* () {
  const user = yield* getUser("user_123");
  const charge = yield* chargePayment(user);
  return { ok: true as const, user, charge };
});

const handleWithCatchTags = program.pipe(
  Effect.catchTags({
    UserNotFound: (error) =>
      Effect.succeed({ ok: false as const, message: error.message }),
    PaymentFailed: (error) =>
      Effect.succeed({ ok: false as const, message: error.message }),
  }),
);

const handleWithCatchAll = program.pipe(
  Effect.catchAll((error) =>
    Effect.succeed({ ok: false as const, message: error.message }),
  ),
);

const handleWithMatch = program.pipe(
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

const handleError = (error: UserNotFound | PaymentFailed) =>
  Match.value(error).pipe(
    Match.tag("UserNotFound", (e) => e.message),
    Match.tag("PaymentFailed", (e) => e.message),
    Match.exhaustive,
  );

export const run = () => Effect.runSync(handleWithCatchTags);
