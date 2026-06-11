---
name: productminds-engineering-standards
description: Apply Productminds engineering standards and review-derived coding wisdom before writing code. Use when changing GraphQL contracts, Effect services, ReScript or frontend code, Mastra tools, API boundaries, domain modeling, tests, or when addressing review feedback or contributing new standards.
metadata:
  short-description: Productminds engineering standards
---

# Productminds Engineering Standards

Use this skill while making changes and before asking for human review. Its main job is to help agents apply Productminds engineering standards so we do not repeat the same review feedback across projects, clients, or internal products.

It is especially relevant for PRs touching GraphQL contracts, Effect services, ReScript or frontend code, Mastra tools, API boundaries, domain modeling, tests, and recurring review feedback.

## Primary Workflow: Apply The Standards

1. Read `references/checklist.md` for the short pre-review pass.
2. Read `references/rules.md` for the standards that match the files being changed.
3. Apply the relevant rules while editing, not only after review.
4. Before asking for human review, check for repeated mistakes the skill already covers.
5. Report remaining tradeoffs, deferred issues, and checks run.

## Review Feedback Workflow

When responding to PR feedback:

- Fetch thread-aware review comments when resolution or outdated state matters. Use any tool that preserves `isResolved`, `isOutdated`, file path, line, and thread comments.
- Address actionable automated review before asking a human reviewer for another pass.
- Separate code changes from design responses and follow-up issues.
- For stacked PRs, identify downstack and upstack impact instead of reviewing the current PR in isolation.

## Contributing New Rules

Only update this skill when review feedback reveals a repeated or architectural pattern worth preserving.

Classify the feedback first:

- `rule-worthy`: repeated or architectural feedback that should become durable behavior.
- `architecture-decision`: design discussion that should shape a rule, ADR, or PR response.
- `already-encoded`: already covered by this skill or another Productminds rule.
- `one-off`: local implementation cleanup only.
- `stale-or-outdated`: no longer applies to the current diff.

Add or update a concise rule with source context. In normal repository work, propose that update as a draft PR to `https://github.com/pminds/skills`.
