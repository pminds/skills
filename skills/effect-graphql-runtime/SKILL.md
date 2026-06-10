---
name: effect-graphql-runtime
description: Use this skill whenever wiring Effect into GraphQL, Pothos resolvers, GraphQL context, Effect services, ManagedRuntime, Layer composition, runtime.runPromise, or resolver adapters. It shows how to create one application runtime from the Layer graph, put a small runtime facade on GraphQL context, and keep resolvers thin while preserving config, logging, and OpenTelemetry conventions.
---

# Effect Runtimes With GraphQL

Use one application `ManagedRuntime` for GraphQL, built from the same Effect `Layer` graph as the rest of the app. Put the runtime on the GraphQL context, then keep Pothos resolvers as thin adapters that call `runtime.runPromise(...)`.

## Runtime Setup

Build service layers once, provide config through layers, then expose the runtime to GraphQL.

The examples below show logging and OpenTelemetry being provided near the runtime boundary because that is a common Effect setup pattern. Treat that placement as illustrative, not a hard rule; follow the application's existing observability setup when it differs.

```ts
import { Config, Effect, Layer, Logger, ManagedRuntime } from "effect";

const ApiConfigLayer = Layer.effect(
  ApiConfig,
  Effect.gen(function* () {
    const config = yield* Config.all({
      baseUrl: Config.string("API_URL"),
      apiToken: Config.redacted("API_TOKEN"),
    });

    return ApiConfig.of(config);
  }),
);

const ApiClientLayer = ApiClient.Default.pipe(Layer.provide(ApiConfigLayer));

const AppLayer = ApiClientLayer.pipe(
  Layer.annotateSpans({ main: "GraphQLContextRuntime" }),
  Layer.provide(Logger.replace(Logger.defaultLogger, Logger.jsonLogger)),
  Layer.orDie,
);

const runtime = ManagedRuntime.make(AppLayer);

export type GraphQLContextRuntime = Pick<
  typeof runtime,
  "runSync" | "runPromise" | "runPromiseExit" | "runFork" | "runCallback" | "dispose"
>;

export const GraphQLContextRuntime: GraphQLContextRuntime = {
  runSync: (effect) => runtime.runSync(effect),
  runPromise: (effect, options) => runtime.runPromise(effect, options),
  runPromiseExit: (effect, options) => runtime.runPromiseExit(effect, options),
  runFork: (effect) => runtime.runFork(effect),
  runCallback: (effect) => runtime.runCallback(effect),
  dispose: () => runtime.dispose(),
};
```

## GraphQL Context

Attach the facade to the request context. Do not rebuild the runtime per request.

```ts
export type GraphQLContext = {
  runtime: GraphQLContextRuntime;
};

export const createContext = (): GraphQLContext => ({
  runtime: GraphQLContextRuntime,
});
```

## Pothos Resolvers

Resolvers should translate GraphQL inputs into Effect calls. Fetch services inside `Effect.gen`, then run the Effect through the context runtime.

```ts
import { Effect } from "effect";

builder.queryField("user", (t) =>
  t.field({
    type: User,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_parent, { id }, { runtime }) =>
      runtime.runPromise(
        Effect.gen(function* () {
          const client = yield* UserClient;

          return yield* client.getUser({ id });
        }),
      ),
  }),
);
```

## Rules

- Create the `ManagedRuntime` once at module scope.
- If the project already uses Effect config, provide service config through `Config` and `Layer` instead of ad-hoc environment reads in resolvers.
- If logging or OpenTelemetry is provided near the runtime boundary, preserve the project's existing layering conventions.
- Keep resolvers thin: parse GraphQL args, call Effect services, return the result.
