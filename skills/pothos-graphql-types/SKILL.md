---
name: pothos-graphql-types
description: Pothos GraphQL Effect boundary patterns. Use when editing Pothos schema types, Relay Nodes, loadableNode loaders, GraphQL ID args, resolver fields, mutations, or Effect-backed GraphQL resolvers; also use when another skill needs Pothos type, dataloader, global ID, or Effect runtime guidance.
---

# Pothos GraphQL Boundary Types

Use this skill to keep Pothos schema code predictable at the boundary between GraphQL transport shapes, Pothos refs, dataloader keys, and Effect services.

Make every touched boundary explicit: where IDs are decoded, where objects become keys, where Effect services are called, and where Effect programs are run.

## Workflow

1. Calibrate the local schema boundary.

   Completion criterion: you have worked through this local calibration checklist for this project.

   - Match builder imports, scalar names, nullability defaults, plugin availability, error strategy, and auth behavior.
   - Identify exported object/loadable refs before adding new refs.
   - Find or add the GraphQL context runtime facade before writing resolver service calls.
   - Check whether generated client types, persisted Relay IDs, or external clients make ID-shape changes breaking.

2. Choose the Pothos type shape.

   Completion criterion: you have identified the correct Pothos type shape for every type being added or modified in this task.

3. Define the ID boundary once.

   Completion criterion: GraphQL global IDs are decoded at query/mutation boundaries, backing models carry domain ID types when available, `id.resolve` returns the raw stable node ID, and compound IDs have colocated encode/decode helpers.

4. Define the loader boundary deliberately.

   Completion criterion: loader key types match the raw ID returned by `id.resolve`; batch loaders return results in request order or declare a Pothos `sort`/`toKey` strategy; missing nullable records become `null`; authorization and tenant checks happen before returning data.

5. Keep resolver boundaries thin.

   Completion criterion: direct properties use `t.expose*`, small conversions use `t.field`, relationship fields return existing objects or declared loader keys where possible, and business rules stay in Effect services.

6. Run Effect through the GraphQL runtime boundary.

   Completion criterion: resolvers/loaders build one focused Effect program and execute it through the existing GraphQL context runtime or runtime facade; no resolver or loader creates its own runtime.

7. Verify every touched boundary.

   Completion criterion: every modified GraphQL boundary has been checked for ID decoding, loader key shape, resolver thinness, auth/tenant handling, and Effect runtime usage; TypeScript, schema generation, codegen, or the relevant project check has run, or you report why it could not run.

## Object Types

Use object types for values returned through another object that do not need Relay identity, refetching, or dataloader reuse.

Use unions or interfaces when the GraphQL shape is truly polymorphic. Prefer discriminated domain types over nullable flag bags before exposing them.

## Relay Nodes

Use Node types when clients need stable identity, Relay refetching, cache normalization, or global ID mutation inputs.

Implement Node types with `builder.loadableNode`. Export the ref and reuse it so other fields can return a key and let Pothos load/cache the object through the same definition. Replacing `type: Product` with a string name or a duplicate object ref can lose typed-key, dataloader, and global-ID behavior.

## Loader Boundary

Pothos dataloader `load` functions must return results in the same order as the requested IDs unless Pothos is given a sorting strategy.

Choose one ordering strategy:

- `toKey` plus `sort: true`: use when `sort` and `cacheResolved` should share the same key extractor.
- `sort: (item) => item.id`: use when loaded objects have a simple key extractor and you do not need `cacheResolved`.
- Manual ordering: return `ids.map((id) => byId.get(id) ?? null)` from `load` and do not also add `sort`. This is the least preferable, for when there is no simple key extractor.

When a field is typed as a loadable object or loadable Node, it may return either a loaded object or the key accepted by that type's `load`. Prefer returning the key when the field already has it. This becomes much more predictable when combined with branded ids.

Call `Ref.getDataloader(context).load(key)` manually only when the resolver needs loaded data to compute another field. Otherwise return the key and let Pothos handle loading.

## ID Boundary

Prefer Effect Schema for branded IDs. Decode once at GraphQL input boundaries and carry branded IDs through Effect services. The backing model is the type-safety seam: if a backing type has `id: ProductId`, fields returning a `Product` key should return `ProductId`, not an arbitrary string.

For global ID args, prefer Pothos' `for` validation when available.

Do not repeatedly re-validate IDs already carried by a branded backing model.

## Compound IDs

Keep compound ID encoding and decoding colocated with the Node type.

Use a delimiter that cannot appear in component IDs, or encode components safely before joining.

## Effect Boundary

Pothos resolvers should adapt GraphQL transport to Effect programs. If a project lacks a GraphQL context runtime facade, add that app-level integration first; do not create runtimes inside individual resolvers or loaders.

Keep Pothos resolvers as adapters: parse GraphQL transport values, build one focused Effect program, then run it through the context runtime. The canonical `Product` definition under Relay Nodes shows a loader doing exactly this. Prefer object parameters when calling Effect services so branded IDs cannot be positionally swapped.

For mutations, parse GraphQL input before calling Effect services inside the program. The `archiveProduct` example under ID Boundary shows the full adapter shape.

Preserve the project's runtime setup, Layer graph, logging, and OpenTelemetry conventions. Never create a per-request `ManagedRuntime` inside a resolver or loader. Derive GraphQL shapes from Effect service return types where practical rather than building duplicate GraphQL-specific types.

## References

Read [Pothos Boundary Patterns](references/patterns.md) when implementing code or when you need concrete examples for object types, loadable Nodes, loader keys, branded IDs, compound IDs, or Effect-backed mutations.
