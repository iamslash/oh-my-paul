---
description: Guide safe code refactoring with before/after analysis. Use when the user asks to refactor, clean up, simplify, or reorganize code.
---

# Refactoring Skill

When refactoring code, follow this process:

## Step 1: Analyze Current State
- Read the target code with Read tool
- Identify code smells: duplication, long functions, deep nesting, unclear naming
- Check for existing tests with Glob and Grep

## Step 2: Plan the Refactoring
Before making changes, present a plan:

### Proposed Changes
| File | Change | Reason |
|------|--------|--------|
| path/to/file | What changes | Why |

### Risk Assessment
- What could break?
- Are there tests covering this code?
- Any callers that need updating?

## Step 3: Execute (only after user confirms)
- Make the smallest possible changes
- One refactoring at a time
- Preserve all existing behavior
- Do NOT change interfaces unless explicitly asked

## Step 4: Verify
- Run existing tests if available
- Check that all callers still work
- Verify no regressions

## Rules
- Never combine refactoring with feature changes
- Never delete code that might be used elsewhere without checking with Grep
- Always show before/after for significant changes
- If tests don't exist, suggest writing them BEFORE refactoring
