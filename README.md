# Productminds skills

Minimal agent skills repository for Productminds.

## Install

```bash
npx skills add pminds/skills
```

Or install a single skill directly:

```bash
npx skills add pminds/skills --skill quality-code
npx skills add pminds/skills --skill effect
npx skills add pminds/skills --skill unknown-data-boundary
```

## Skills

- **[effect](skills/effect/SKILL.md)** - umbrella skill for Effect-TS patterns: error handling with `Data.TaggedError` / `Schema.TaggedError`, services, runtimes, and GraphQL integration.
- **[quality-code](skills/quality-code/SKILL.md)** - principles for writing quality full-stack TypeScript: branded types, discriminated unions, end-to-end types, real tests over mocks, OpenTelemetry, and picking the right abstractions.
- **[unknown-data-boundary](skills/unknown-data-boundary/SKILL.md)** - one validation boundary for unknown TypeScript data: preserve typed SDK contracts or decode untrusted input with Effect Schema.
