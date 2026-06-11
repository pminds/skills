# Review And Stacks

## Keep Deployable Slices Small

If a change can be spun out downstack without breaking deployability, prefer a tiny preparatory PR. Stack shape is part of review quality.

```md
Don't:
PR 3: feature code + generated schema + shared config setup

Do:
PR 1: shared config setup
PR 2: generated schema/types
PR 3: feature code
```

Sources: [bolius-ai-platform#878](https://github.com/pminds/bolius-ai-platform/pull/878) comments on lint-staged/Vite config being tiny downstack candidates; stack discussion in the same feature series.

## Contribute New Standards Deliberately

Only add rules for repeated or architectural patterns. Preserve one-off comments as evidence or examples, not broad standards. Updates to this skill should be proposed as draft PRs to `pminds/skills`.

```md
Don't:
Rule: Always clamp source hover cards.

Do:
Rule: Default GraphQL fields to nullable unless non-null failure is intentional.
```

Sources: [bolius-ai-platform#897](https://github.com/pminds/bolius-ai-platform/pull/897) request to make review rules; [bolius-ai-platform#898](https://github.com/pminds/bolius-ai-platform/pull/898) repeated-feedback reminder; Productminds review of this skill.
