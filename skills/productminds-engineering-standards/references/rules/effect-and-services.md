# Effect And Services

## Write Effect Programs As Happy Paths

Name resolver/service programs and prefer generator-style Effect. Keep the main body focused on the successful flow; catch, map, or log errors at the edge.

```ts
// Don't
return Effect.runPromise(service.resolve(id).pipe(Effect.mapError(toGraphQLError)));

// Do
const program = Effect.fn("ResolveSource")(function* () {
  return yield* service.resolve(id);
});

return runtime.runPromise(program().pipe(Effect.mapError(toGraphQLError)));
```

Sources: [bolius-ai-platform#897](https://github.com/pminds/bolius-ai-platform/pull/897) comments on `Effect.fn`, generator programs, and end-of-body error mapping.

## Model External Clients As Scoped Dependencies

External SDK clients and database/object-storage clients should be acquired through Effect services/layers and released when the scope closes. Avoid constructing clients inline inside business logic.

```ts
// Don't
const s3 = new S3Client(config);

// Do
const S3Live = Layer.scoped(
  S3,
  Effect.acquireRelease(
    Effect.sync(() => new S3Client(config)),
    (client) => Effect.sync(() => client.destroy()),
  ),
);
```

Sources: [bolius-ai-platform#897](https://github.com/pminds/bolius-ai-platform/pull/897) S3 `acquireRelease` comment; [bolius-ai-platform#882](https://github.com/pminds/bolius-ai-platform/pull/882) Mastra service/layer comments; [bolius-ai-platform#902](https://github.com/pminds/bolius-ai-platform/pull/902) resolver layer constructor feedback.

## Keep Tests Focused On Behavior

Prefer Effect Vitest and mocked layers for Effect services. Remove helpers or tests that add more code than the behavior they prove.

```ts
// Don't
const withTestConfig = (effect) => effect.pipe(Effect.provide(testConfigLayer));

// Do
it.layer(TestService.mock)("resolves the source", (it) =>
  it.effect(function* () {
    // assertion
  }),
);
```

Sources: [bolius-ai-platform#878](https://github.com/pminds/bolius-ai-platform/pull/878) effect-vitest comments; [bolius-ai-platform#882](https://github.com/pminds/bolius-ai-platform/pull/882) mocked-layer comments; [bolius-ai-platform#902](https://github.com/pminds/bolius-ai-platform/pull/902) low-value helper/test comments.
