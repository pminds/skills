import { Context, Data, Effect, Layer, Match, Schema } from "effect";

export const UserId = Schema.String.pipe(
  Schema.pattern(/^user_[a-z0-9]+$/),
  Schema.brand("UserId"),
);
export type UserId = typeof UserId.Type;

export const ChargeId = Schema.String.pipe(
  Schema.pattern(/^charge_[a-z0-9]+$/),
  Schema.brand("ChargeId"),
);
export type ChargeId = typeof ChargeId.Type;

class User extends Data.Class<{ readonly id: UserId; readonly name: string }> {}
class Charge extends Data.Class<{
  readonly id: ChargeId;
  readonly amount: number;
}> {}

class UserNotFound extends Schema.TaggedError<UserNotFound>("UserNotFound")(
  "UserNotFound",
  { userId: UserId },
) {
  get message() {
    return `User ${this.userId} not found`;
  }
}

class PaymentFailed extends Schema.TaggedError<PaymentFailed>("PaymentFailed")(
  "PaymentFailed",
  {
    chargeId: ChargeId,
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

class UserRepository extends Context.Tag("UserRepository")<
  UserRepository,
  { readonly findById: (id: UserId) => Effect.Effect<User, UserNotFound> }
>() {
  static readonly Ada = new User({
    id: UserId.make("user_123456"),
    name: "Ada Lovelace",
  });

  static readonly Byron = new User({
    id: UserId.make("user_000000"),
    name: "Lord Byron",
  });

  static mock = Layer.succeed(
    UserRepository,
    UserRepository.of({
      findById: (id) =>
        Effect.gen(function* () {
          if (id === UserRepository.Ada.id) {
            return UserRepository.Ada;
          }

          if (id === UserRepository.Byron.id) {
            return UserRepository.Byron;
          }

          return yield* new UserNotFound({ userId: id });
        }),
    }),
  );
}

class PaymentService extends Context.Tag("PaymentService")<
  PaymentService,
  {
    readonly charge: (input: {
      readonly user: User;
      readonly chargeId: ChargeId;
    }) => Effect.Effect<Charge, PaymentFailed>;
  }
>() {
  static mock = Layer.succeed(
    PaymentService,
    PaymentService.of({
      charge: ({ user, chargeId }) =>
        Effect.gen(function* () {
          if (user.id === UserRepository.Ada.id) {
            return new Charge({ id: chargeId, amount: 100 });
          }

          if (user.id === UserRepository.Byron.id) {
            return yield* new PaymentFailed({
              chargeId,
              reason: "card_declined",
            });
          }

          return yield* new PaymentFailed({
            chargeId,
            reason: "insufficient_funds",
          });
        }),
    }),
  );
}

const AppLayer = Layer.merge(UserRepository.mock, PaymentService.mock);

const program = Effect.gen(function* () {
  const repo = yield* UserRepository;
  const service = yield* PaymentService;

  const userId = yield* Schema.decode(UserId)("user_123456");
  const chargeId = yield* Schema.decode(ChargeId)("charge_123456");

  const user = yield* repo.findById(userId);
  const charge = yield* service.charge({ user, chargeId });

  return { ok: true as const, user, charge };
});

const handleWithCatchTags = program.pipe(
  Effect.catchTags({
    UserNotFound: (error) =>
      Effect.succeed({ ok: false as const, message: error.message }),
    PaymentFailed: (error) =>
      Effect.succeed({ ok: false as const, message: error.message }),
    ParseError: (error) =>
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
      Match.tag("ParseError", (e) =>
        Effect.succeed({ ok: false as const, message: e.message }),
      ),
      Match.exhaustive,
    ),
  ),
);

const runnableWithCatchTags = handleWithCatchTags.pipe(
  Effect.provide(AppLayer),
);
const runnableWithCatchAll = handleWithCatchAll.pipe(Effect.provide(AppLayer));
const runnableWithMatch = handleWithMatch.pipe(Effect.provide(AppLayer));

export const run = () => {
  Effect.runSync(runnableWithCatchTags);
  Effect.runSync(runnableWithCatchAll);
  Effect.runSync(runnableWithMatch);
};
