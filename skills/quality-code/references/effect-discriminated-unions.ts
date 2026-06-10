import { Schema } from "effect";

export const Verdict = Schema.Literal("contradicted", "unverified", "supported");
export type Verdict = typeof Verdict.Type;

// Don't model this as one object with nullable fields:
// { status: "completed" | "failed" | "queued" | "running"; verdict: Verdict | null; verdictReason: string | null; failureReason: string | null }
// That permits completed statements with no verdict, and queued statements with one.
export const Statement = Schema.Union(
  Schema.Struct({
    status: Schema.Literal("queued"),
  }),
  Schema.Struct({
    status: Schema.Literal("running"),
    activeToolName: Schema.NullOr(Schema.String),
  }),
  Schema.Struct({
    status: Schema.Literal("failed"),
    failureReason: Schema.String,
  }),
  Schema.Struct({
    status: Schema.Literal("completed"),
    verdict: Verdict,
    verdictReason: Schema.String,
  }),
);

export type Statement = typeof Statement.Type;

export const summarizeStatement = (statement: Statement) => {
  switch (statement.status) {
    case "queued":
      return "Statement is queued";
    case "running":
      return `Statement is running with ${statement.activeToolName ?? "no tool"}`;
    case "failed":
      return `Statement failed: ${statement.failureReason}`;
    case "completed":
      return `${statement.verdict}: ${statement.verdictReason}`;
  }
};

summarizeStatement({
  status: "completed",
  verdict: "supported",
  verdictReason: "The cited source confirms the claim.",
});

// @ts-expect-error Completed statements must have a verdict reason.
summarizeStatement({ status: "completed", verdict: "supported" });

// @ts-expect-error Queued statements cannot carry completed-only fields.
summarizeStatement({ status: "queued", verdict: "supported" });
