---
name: "speckit-taskstoissues"
description: "Deprecated: Convert existing tasks into actionable, dependency-ordered GitHub issues for the feature based on available design artifacts."
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "github-spec-kit"
  source: "templates/commands/taskstoissues.md"
---


## Deprecation Notice

You **MUST display the following concise warning first**, as the first step of this command and before the User Input and Pre-Execution Checks sections below:

> ⚠️  is deprecated and will be removed in a future minor release. Use the bundled  extension instead: run , then invoke .

Continue with the existing workflow unchanged. Do not install or enable the extension automatically, do not stop, and do not run the replacement command.

## User Input



You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Check for extension hooks (before tasks-to-issues conversion)**:
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

## Outline

1. Run  from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").
1. **IF EXISTS**: Load  for project principles and governance constraints.
1. From the executed script, extract the path to **tasks**.
1. Get the Git remote by running:



> [!CAUTION]
> ONLY PROCEED TO NEXT STEPS IF THE REMOTE IS A GITHUB URL

1. **Fetch existing issues for deduplication**: Before creating anything, build the set of task IDs you are about to process from  (each is a  followed by **at least** three digits, e.g.  —  assigns new IDs with , which is a floor rather than a cap, so once a file has more than 999 tasks the IDs are four digits or longer). Then use the GitHub MCP server's  tool to look for issues that already cover those IDs. Do not pass a  value, since omitting it makes the tool return both open and closed issues. Request  to keep the number of calls down, and since the tool uses cursor-based pagination, request pages with the  parameter (using the  from the previous response). For each issue title, match it against the task ID pattern  (the  accepts four-digit and longer IDs — with  a title containing  would not match at all, because the trailing  cannot fall between two digits, so that task would be silently neither deduplicated nor created; word boundaries still stop a token like  from matching, and force the whole digit run to be consumed so  can never match inside ; this also recognises titles written as ,  or ) and, when it matches one of your task IDs, mark that ID as already having an issue. Stop paginating as soon as every task ID has been matched, or when there are no more pages, so you do not keep fetching the whole repository's issue history once all task IDs are accounted for. This bounds the number of calls on repos with large issue histories and still prevents duplicates when the command is re-run after  is regenerated or the skill is re-invoked.
1. For each task in the list, use the GitHub MCP server to create a new issue in the repository that is representative of the Git remote. Task lines in  start with a markdown checkbox, so first strip the leading  (and any  /  markers) to recover the task ID and its description. Create the issue with a single canonical title of the form , with the ID written once followed by the task description (for example, the line  becomes the title ).
   - **Skip** any task whose ID is already present in the set of existing issues from the previous step, and report it (for example, ).
   - Only create issues for tasks that do not yet have a matching issue.

> [!CAUTION]
> UNDER NO CIRCUMSTANCES EVER CREATE ISSUES IN REPOSITORIES THAT DO NOT MATCH THE REMOTE URL

## Post-Execution Checks

**Check for extension hooks (after tasks-to-issues conversion)**:
Check if  exists in the project root.
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
