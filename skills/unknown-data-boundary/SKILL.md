---
name: unknown-data-boundary
description: "Boundary: Use when TypeScript receives unknown data, parses third-party or SDK responses, accesses JSON, HTTP, queues, database values, or writes runtime shape checks."
---

# Unknown Data Boundary

Every unknown value crosses a visible **boundary**. Decide which boundary it is before application code reads its fields:

1. **Typed source**: inspect the installed dependency's types and use its documented fields directly.
2. **Untrusted source**: define an Effect Schema and decode once where the value enters the application.

Completion criterion: every value introduced as `unknown` or received from an external source has exactly one documented boundary, and downstream code receives a proven type.

## Typed sources

Keep a typed SDK response typed. Inspect the pinned dependency version rather than widening its result to `unknown` or guessing alternate field names.

```ts
import type { WorkflowExecutionInfo } from "@temporalio/client"

type ActiveFactCheckWorkflow = {
  workflowId: string
  workflowType: string
}

const toActiveFactCheckWorkflow = (
  workflow: WorkflowExecutionInfo,
): ActiveFactCheckWorkflow => ({
  workflowId: workflow.execution.workflowId,
  workflowType: workflow.type.name,
})
```

## Untrusted sources

Decode JSON, HTTP responses, queue messages, database values, and unknown SDK boundaries before application logic uses them. Derive the TypeScript type from the schema.

```ts
import { Schema } from "effect"

class SavedSearch extends Schema.Class<SavedSearch>("SavedSearch")({
  query: Schema.String,
  resultLimit: Schema.Number,
}) {}

const decodeSavedSearch = (fileContents: string) =>
  Schema.decodeUnknownEffect(Schema.fromJsonString(SavedSearch))(fileContents)
```

The decoded value is safe to pass into application logic:

```ts
const runSavedSearch = (savedSearch: SavedSearch) => {
  // application logic
  return savedSearch.query
}
```

Model genuinely supported upstream variants as an explicit schema union. A parse failure is the boundary reporting that its upstream contract changed; handle it there with the context needed to diagnose it.

## Boundary rules

- Preserve documented SDK types; inspect them before adding runtime parsing.
- Decode untrusted values once with an Effect Schema at the boundary.
- Let schema-derived types flow downstream without repeated property checks.
- Model documented variants as schema unions.
- Reject unchecked shape assertions and speculative fallback trees; they create an undocumented contract and conceal upstream changes.
