import { Effect, Schema } from "effect";
import {
  getUser,
  UserId,
  type UserId as UserIdType,
} from "./effect-branded-types.js";

class UserProfileLoadFailed extends Schema.TaggedError<UserProfileLoadFailed>()(
  "UserProfileLoadFailed",
  {
    cause: Schema.Defect,
  },
) {}

const getProfile = (input: { userId: UserIdType }) =>
  Effect.succeed({
    userId: input.userId,
    bio: "First computer programmer",
  });

const loadUserProfile = Effect.fn("loadUserProfile")(
  function* (input: { userId: UserIdType }) {
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

const program = Effect.gen(function* () {
  const userId = yield* Schema.decodeUnknown(UserId)("user_jkfasjla131");

  return yield* loadUserProfile({ userId });
}).pipe(Effect.withSpan("loadUserProfileProgram"));

export const run = () => Effect.runSync(program);

// @ts-expect-error Raw strings must be validated and branded first.
loadUserProfile({ userId: "user_jkfasjla131" });
