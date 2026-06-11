# Pre-Review Checklist

Run this checklist while working and again before requesting human review.

## Review Hygiene

- Fetch thread-aware review comments; do not rely on flat PR comments when resolution or outdated state matters.
- Help the user decide how to handle actionable review comments before requesting another human review. Offer code-change, reply, defer, or follow-up options as appropriate; only post replies or resolve threads when the user explicitly asks. Automated coding-agent review can usually be addressed directly in code.
- Separate code changes from design responses and follow-up issues.
- Check whether the current PR is independently deployable inside its stack.

## Domain And Boundaries

- Decode external input at RPC, GraphQL, HTTP, or worker boundaries using shared domain schemas.
- Keep parsing and conversion in the service that owns the behavior, not in a shared types package just because both sides can import it.
- Preserve meaningful domain variants internally; flatten only at the app boundary that intentionally hides detail.
- Use constructors or `.make` helpers for tagged/domain classes in tests and fixtures.

## GraphQL

- Use unions for mutually exclusive result shapes; avoid status-plus-nullable-field bags that can represent illegal states.
- Default GraphQL fields to nullable unless a non-null contract is deliberate and failure should bubble.
- Use `ID` for identifiers and `URL` scalar for URLs when the field semantically carries those values.
- Reuse domain result classes where practical instead of making local parallel `Data.Class` wrappers.
- Put static conversion helpers on the GraphQL object that owns the conversion.

## Effect And Services

- Prefer named generator programs for resolver/service bodies.
- Keep happy-path Effect logic clean; map/catch/log errors near the boundary.
- Acquire and release external SDK clients through scoped layers or `acquireRelease`.
- Provide dependencies at runtime/layer boundaries, not inline at arbitrary call sites unless the layer is truly local to that concrete resolver.
- If a namespace/service is supported, require its infrastructure config; use domain unavailable results for unsupported data, not missing required infra.

## Frontend And ReScript

- Avoid one-use local variables when the call reads clearly inline.
- Let the lowest component own hooks, Relay fragments, and local display logic when possible.
- Avoid bespoke frontend parsing of opaque or domain IDs when backend/shared types can thread structured data.
- Use generated Relay types and `required` where it simplifies exhaustive pattern matching.
- Do not select `__typename` unless the query genuinely needs it.
- Use index keys when the reviewed list is stable and no better domain key exists; avoid invented concatenated keys.
