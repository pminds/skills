# GraphQL

## Default GraphQL To Evolvable Contracts

Default fields to nullable, use `ID` for identifiers, and use the `URL` scalar for URLs. Reach for non-null only when a field is genuinely required and bubbling failure through the whole selection is intended.

```ts
// Don't
t.exposeString("citationId", { nullable: false });

// Do
t.exposeID("citationId");
```

Sources: [bolius-ai-platform#897](https://github.com/pminds/bolius-ai-platform/pull/897) GraphQL comments on nullable defaults, `ID`, and `URL`; [bolius-ai-platform#898](https://github.com/pminds/bolius-ai-platform/pull/898) Relay query simplification comments.

## Use Unions For Mutually Exclusive Shapes

Use a GraphQL union when result shapes are mutually exclusive. Avoid status-plus-nullable-field bags that can represent illegal values.

```ts
// Don't
type SourceLink = { status: "AVAILABLE" | "UNAVAILABLE"; signedUrl?: string | null };

// Do
type SourceLink = AvailableSourceLink | UnavailableSourceLink;
```

Sources: [bolius-ai-platform#897](https://github.com/pminds/bolius-ai-platform/pull/897) result-shape feedback; [bolius-ai-platform#902](https://github.com/pminds/bolius-ai-platform/pull/902) unavailable-reason discussion.

## Reuse Domain Types At API Boundaries

When domain types already model a result, API layers should expose or map those types rather than recreating local parallel classes. If a conversion object is needed, put the static conversion on the object that owns the conversion.

```ts
// Don't
class ApiResolvedSource extends Data.Class<{ signedUrl: string }> {}

// Do
builder.objectType(FactCheckSourceReferenceWasResolved, {
  name: "AvailableSourceLink",
});
```

Sources: [bolius-ai-platform#897](https://github.com/pminds/bolius-ai-platform/pull/897) domain-type reuse comments; [bolius-ai-platform#902](https://github.com/pminds/bolius-ai-platform/pull/902) repeated local `Data.Class` feedback.
