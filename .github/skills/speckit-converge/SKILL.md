---
name: "speckit-converge"
description: "Assess the current codebase against the feature's spec, plan, and tasks, then append any remaining unbuilt work as new tasks to tasks.md so implement can complete it."
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "github-spec-kit"
  source: "templates/commands/converge.md"
---


## User Input



You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Check for extension hooks (before convergence)**:

- Check if  exists in the project root.
- If it exists, read it and look for entries under the  key
- If the YAML cannot be parsed or is invalid, do not skip silently: tell the user that  could not be read (include the parser error) and that no hooks were checked, including any mandatory () hooks registered there, then continue normally
- Filter out hooks where  is explicitly . Treat hooks without an  field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook  expressions:
  - If the hook has no  field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty , skip the hook and leave condition evaluation to the HookExecutor implementation
- When constructing command invocations from hook command names, replace dots () with hyphens (). For example,  → .
- For each executable hook, output the following based on its  flag:
  - **Optional hook** ():

    /{command}/{command}

  - **Mandatory hook** ():

    /{command}
    After emitting the block above you MUST actually invoke the hook and wait for it to finish before continuing. Run it the same way you would run the command yourself in this agent/session (the invocation may differ from the literal  id shown above, e.g. a skills-mode agent runs it as  or ). Emitting the block alone does not run the hook.

- If no hooks are registered or  does not exist, skip silently

## Goal

Close the gap between what a feature's specification, plan, and tasks call for and what the
codebase currently implements. Read , , and  as the **sole
source of intent** (with the constitution as governing constraints), assess the current
state of the code, determine which requirements, acceptance criteria, plan decisions, and
existing tasks are unmet, incomplete, or only partially satisfied, and **append each piece
of remaining work as a new, traceable task** at the bottom of  so that
 can complete it. This command MUST run only after
 has run on the current , and after  has produced a complete .

This is **not** a diff tool and does **not** track changes. It assesses the present state
of the code relative to the feature's artifacts — no git, no branch comparison, no history.

## Operating Constraints

**APPEND-ONLY, NEVER REWRITE**: The command's **only** write is appending a new
 section to . It MUST NOT:

- modify  or  in any way;
- rewrite, renumber, reorder, or delete any existing task (including tasks from a prior
  Convergence phase);
- modify, create, or delete any application code — completing the appended tasks is the
  job of .

When the codebase already satisfies everything, the command MUST leave 
**byte-for-byte unchanged** (no empty Convergence header) and report a clean result.

**Constitution Authority**: The project constitution () is
**non-negotiable**. Code that violates a MUST principle is the highest-severity finding and
produces a corresponding remediation task. If the constitution is an unfilled template,
skip constitution checks gracefully rather than failing.

## Execution Steps

### 1. Initialize Convergence Context

Run  once from repo root and parse JSON for FEATURE_DIR and AVAILABLE_DOCS. Derive absolute paths:

- SPEC = FEATURE_DIR/spec.md
- PLAN = FEATURE_DIR/plan.md
- TASKS = FEATURE_DIR/tasks.md
- CONSTITUTION =  (if present)
If , , or  is missing, STOP with a clear, actionable message naming the
prerequisite command to run ( for a missing spec,  for a missing plan,
 for missing tasks). Do not produce partial output.
For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

### 2. Load Artifacts (Progressive Disclosure)

Load only the minimal necessary context from each artifact:

**From spec.md:**

- Functional Requirements (FR-###)
- Success Criteria (SC-###) — include only items requiring buildable work; exclude
  post-launch outcome metrics and business KPIs
- User Stories and their Acceptance Scenarios
- Edge Cases (if present)

**From plan.md:**

- Architecture/stack choices and technical decisions
- Data Model references
- Phases and named touch-points (files/components the plan says will be created or edited)
- Technical constraints

**From tasks.md:**

- Task IDs (to compute the next ID and next phase number)
- Descriptions, phase grouping, and referenced file paths

**From constitution (if not an unfilled template):**

- Principle names and MUST/SHOULD normative statements

### 3. Build the Intent Inventory

Create an internal model (do not echo raw artifacts):

- **Requirements inventory**: one stable key per FR-### / SC-### / user-story acceptance
  scenario (e.g. ), plus the plan decisions and constitution principles that
  impose buildable obligations.
- **Code-scope map**: from the file paths named in  and , plus a keyword
  search for the concepts each requirement describes, derive the set of source files and
  components in scope for assessment. Bound the assessment to these — do **not** infer
  scope beyond what the artifacts define.

### 4. Assess the Codebase and Classify Findings

Include every existing task in the intent inventory, regardless of checkbox state or
Convergence phase: completion claims are not evidence. Verify current behavior against
the spec, plan, tasks, and constitution; for corrective task chains, assess the resulting
behavior, not superseded implementation details. Check both unmet obligations and
implementation that contradicts, exceeds, or falls outside the stated intent.

For each item in the intent inventory, inspect the current code in scope and produce a
 only where there is a gap. Classify every finding by **gap type**:

- ****: the required work is absent from the code entirely.
- ****: the work exists but does not yet fully satisfy the requirement /
  acceptance criterion / plan decision.
- ****: the code does something that conflicts with stated intent or a
  constitution MUST principle.
- ****: the code contains work not called for by the spec, plan, or tasks
  (surfaced for awareness — converge does **not** delete code, it only appends a task to
  review/justify or remove it).

Each  records: a stable id, the  it traces to, the , a
severity, and a short human-readable description with the evidence (the file/area observed).

**Edge cases:**

- **Little or no code yet**: treat the entire specified scope as  remaining work
  rather than failing.
- **Nothing remains**: produce zero findings and follow the converged branch in Step 7.

### 5. Assign Severity

- **CRITICAL**: violates a constitution MUST principle, or a / gap
  that blocks baseline functionality of a P1 user story.
- **HIGH**: a  or  gap on a core functional requirement or acceptance
  criterion.
- **MEDIUM**: a  gap on a secondary requirement, or an  addition with
  unclear justification.
- **LOW**: minor partial gaps, polish, or low-risk  additions.

### 6. Present the In-Session Findings Summary

Before appending anything, output a compact, severity-graded summary (no file writes yet):

## Convergence Findings

| ID | Gap Type | Severity | Source | Evidence | Remaining Work |
|----|----------|----------|--------|----------|----------------|
| F1 | missing  | HIGH     | FR-008 | Example: no append-only guard detected in path/to/module.py when writing tasks.md | Add append-only enforcement |

**Summary metrics:**

- Requirements / acceptance criteria checked
- Plan decisions checked
- Constitution principles checked (or "skipped — template")
- Findings by gap type (missing / partial / contradicts / unrequested)
- Findings by severity

### 7. Append Convergence Tasks (or report converged)

**If there are one or more actionable findings** ( outcome):

Append to the **end** of , per the append contract:

1. Scan all existing task IDs; let  be the maximum. Determine the next phase number 
   (highest existing phase + 1).
2. Write a single new section header .
3. Emit one checklist item per actionable finding, ordered CRITICAL/HIGH first, assigning
   zero-padded IDs :

   

    traces the task to its origin: e.g. , ,
   , , .

    is one of , , , .

   Constitution-violation tasks MUST be emitted first and described as
   .
4. Never reuse or renumber existing IDs. If a prior Convergence phase exists, add a new,
   separately-numbered one below it — do not touch the old one.

**If there are no actionable findings** ( outcome):

- Do **not** modify  at all — no empty phase header.
- Report: **"✅ Converged — the implementation satisfies the spec, plan, and tasks."**
- Include the summary counts of what was checked.

### 8. Provide Next Actions (Handoff)

- On : state how many tasks were appended under which phase, and recommend
  running  to complete them; note that a follow-up converge
  run will find fewer or no remaining items.
- On : recommend proceeding to review / opening a PR. No further implement pass
  is needed for this feature's specified scope.

### 9. Check for extension hooks

After producing the result, check if  exists in the project root.

- If it exists, read it and look for entries under the  key
- If the YAML cannot be parsed or is invalid, do not skip silently: tell the user that  could not be read (include the parser error) and that no hooks were checked, including any mandatory () hooks registered there, then continue normally
- Filter out hooks where  is explicitly . Treat hooks without an  field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook  expressions:
  - If the hook has no  field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty , skip the hook and leave condition evaluation to the HookExecutor implementation
- Report the convergence outcome ( or ) in-session before listing
  any hooks, so users can decide whether to run optional follow-up commands.
- When constructing command invocations from hook command names, replace dots () with hyphens (). For example,  → .
- For each executable hook, output the following based on its  flag:
  - **Optional hook** ():

    /{command}/{command}

  - **Mandatory hook** ():

    /{command}
    After emitting the block above you MUST actually invoke the hook and wait for it to finish before continuing. Run it the same way you would run the command yourself in this agent/session (the invocation may differ from the literal  id shown above, e.g. a skills-mode agent runs it as  or ). Emitting the block alone does not run the hook.

- If no hooks are registered or  does not exist, skip silently
