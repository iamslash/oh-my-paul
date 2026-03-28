---
allowed-tools: Read, Glob, Grep, Bash(git diff:*), Bash(git log:*), Bash(git status:*)
description: Review changed files for bugs, style issues, and security concerns
---

## Context

- Changed files: !`git diff --name-only HEAD~1 2>/dev/null || git diff --name-only`
- Current diff: !`git diff HEAD`
- Recent commits: !`git log --oneline -5`

## Your task

Review the changed files listed above. For each issue found, report:

### Format

For each issue:
```
**[severity]** file:line — description
```

Severity levels:
- **HIGH** — Bugs, security vulnerabilities, data loss risks
- **MEDIUM** — Logic errors, missing error handling, performance issues
- **LOW** — Style, naming, minor improvements

### Focus areas

1. **Bugs**: Logic errors, off-by-one, null/undefined access
2. **Security**: Injection, XSS, hardcoded secrets, unsafe eval
3. **Error handling**: Missing try/catch, unhandled promises, silent failures
4. **Performance**: N+1 queries, unnecessary loops, memory leaks
5. **Style**: Naming, consistency, dead code

### Output

Start with a summary line:
```
Review: X files, Y issues (Z high, W medium)
```

Then list all issues grouped by file. If no issues found, say "No issues found."

Do NOT modify any files. This is a read-only review.
