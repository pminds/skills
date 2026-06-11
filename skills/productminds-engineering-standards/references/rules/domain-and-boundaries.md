# Domain And Boundaries

## Make Illegal States Unrepresentable

Use unions, tagged classes, variants, or domain data classes for mutually exclusive states. Avoid status bags with nullable fields when the bag can represent impossible combinations.

```ts
// Don't
type Link = { status: "available" | "unavailable"; signedUrl?: string | null };

// Do
type Link =
  | { _tag: "Available"; signedUrl: URL }
  | { _tag: "Unavailable" };
```

Sources: [bolius-ai-platform#897](https://github.com/pminds/bolius-ai-platform/pull/897) GraphQL result-shape/domain unavailable feedback; [bolius-ai-platform#902](https://github.com/pminds/bolius-ai-platform/pull/902) unavailable-reason discussion.

## Validate Once At The Boundary

Decode external IDs, URLs, and payloads at the RPC, API, HTTP, or worker boundary. Internal services should receive branded or parsed domain values instead of re-parsing raw strings deep in the call graph.

```ts
// Don't
resolver.resolve(input.id);

// Do
const id = yield* Schema.decode(CitationId)(input.id);
yield* resolver.resolve(id);
```

Sources: [bolius-ai-platform#897](https://github.com/pminds/bolius-ai-platform/pull/897) boundary validation comments; [bolius-ai-platform#902](https://github.com/pminds/bolius-ai-platform/pull/902) CitationId/InternalDocumentCitationIdParts discussion; [bolius-ai-platform#878](https://github.com/pminds/bolius-ai-platform/pull/878) parser ownership comments.

## Keep Domain Ownership Honest

Shared packages hold stable contracts and simple domain shapes. Application-specific parsing, persistence, lookup, or workflow behavior should live in the app or service that owns it.

```ts
// Don't
import { parseAgentReport } from "@product/shared-types";

// Do
import { SourceReference } from "@product/shared-types";
import { parseAgentReport } from "../articleStudio/parseAgentReport";
```

Sources: [bolius-ai-platform#880](https://github.com/pminds/bolius-ai-platform/pull/880) parse function ownership; [bolius-ai-platform#878](https://github.com/pminds/bolius-ai-platform/pull/878) separation of frontend conversion from shared type ownership; [bolius-ai-platform#897](https://github.com/pminds/bolius-ai-platform/pull/897) long-term type ownership question.

## Do Not Hide Missing Required Infrastructure

When an app declares support for a concrete integration, resolver, namespace, or service, its required infrastructure config should be present. Missing required config is an operational failure, not a normal domain result. Use ordinary domain results only for data the app intentionally cannot resolve or act on.

```ts
// Don't
const resolver = config ? makeResolver(config) : Resolver.unavailable;

// Do
const resolver = yield* makeResolver(yield* ResolverConfig);
```

Sources: [bolius-ai-platform#897](https://github.com/pminds/bolius-ai-platform/pull/897) optional resolver-layer question; [bolius-ai-platform#902](https://github.com/pminds/bolius-ai-platform/pull/902) namespace and unavailable-reason discussion.
