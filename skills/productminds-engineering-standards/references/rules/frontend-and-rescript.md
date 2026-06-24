# Frontend And ReScript

## Keep ReScript Render Code Local And Direct

Avoid one-use locals, over-annotations, and helper functions that make readers jump away from the place of use. Move reusable display behavior into a standalone module when it earns a name.

```rescript
// Don't
let label = source->Reference.label
<span>{label->React.string}</span>

// Do
<span>{source->Reference.label->React.string}</span>
```

Sources: [bolius-ai-platform#878](https://github.com/pminds/bolius-ai-platform/pull/878) ReScript inline comments; [bolius-ai-platform#891](https://github.com/pminds/bolius-ai-platform/pull/891) local-variable and `Reference` module comments; [bolius-ai-platform#898](https://github.com/pminds/bolius-ai-platform/pull/898) overannotation comments.

## Let Components Own Their Data Needs

Place hooks, fragments, and query logic in the lowest component that owns the interaction when doing so avoids prop drilling and keeps the parent simpler.

```rescript
// Don't
<Parent resolvedSource onOpenSource>

// Do
<SourceButton source>
```

Sources: [bolius-ai-platform#898](https://github.com/pminds/bolius-ai-platform/pull/898) query/component feedback; [bolius-ai-platform#891](https://github.com/pminds/bolius-ai-platform/pull/891) source-summary module discussion.

## Prefer Structured Backend Data Over Frontend ID Parsing

Frontend code should not parse display information out of opaque IDs when the backend/shared contract can provide structured fields. If frontend parsing is temporarily accepted, treat it as a local compromise and avoid spreading it.

```rescript
// Don't
let title = citationId->String.split(":")->Array.get(0)

// Do
let title = source.documentTitle
```

Sources: [bolius-ai-platform#890](https://github.com/pminds/bolius-ai-platform/pull/890) bespoke ID parsing note; [bolius-ai-platform#898](https://github.com/pminds/bolius-ai-platform/pull/898) source-button query feedback; [bolius-ai-platform#902](https://github.com/pminds/bolius-ai-platform/pull/902) boundary discussion.

## Use Simple Stable Keys

If a reviewed list is stable enough that adding `index` is needed to construct a key, using `index` directly is usually clearer than inventing a concatenated pseudo-identity.

```rescript
// Don't
items->Array.mapWithIndex((item, index) => <Row key={`${item.label}-${index}`} item />)

// Do
items->Array.mapWithIndex((item, index) => <Row key={index->Int.toString} item />)
```

Sources: [bolius-ai-platform#889](https://github.com/pminds/bolius-ai-platform/pull/889) key comments and approval summary.
