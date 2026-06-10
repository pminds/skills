import { Effect, Schema } from "effect";

export const PhoneNumber = Schema.String.pipe(
  Schema.pattern(/^\+?\d{10,15}$/),
  Schema.brand("PhoneNumber"),
);

export type PhoneNumber = typeof PhoneNumber.Type;

export const UserId = Schema.String.pipe(
  Schema.pattern(/^user_[a-z0-9]+$/),
  Schema.brand("UserId"),
);

export type UserId = typeof UserId.Type;

export const sendSMS = (input: { to: PhoneNumber; body: string }) =>
  Effect.succeed({
    to: input.to,
    body: input.body,
  });

export const getUser = (input: { id: UserId }) =>
  Effect.succeed({
    id: input.id,
    name: "Ada Lovelace",
  });

const program = Effect.gen(function* () {
  const to = yield* Schema.decodeUnknown(PhoneNumber)("+15551234567");
  const userId = yield* Schema.decodeUnknown(UserId)("user_123456");

  yield* sendSMS({
    to,
    body: "Your login code is 123456",
  });

  return yield* getUser({ id: userId });
});

export const run = () => Effect.runSync(program);

// @ts-expect-error Validate and brand the string before sending.
sendSMS({ to: "+15551234567", body: "This should not compile" });

// @ts-expect-error Prefixed IDs still need to be validated and branded first.
getUser({ id: "user_123456" });
