---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git diff:*), Bash(git log:*)
description: Create a git commit with auto-generated message
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Your task

Based on the above changes, create a single git commit.

1. Analyze all staged and unstaged changes
2. Draft a concise commit message following conventional commits format (feat/fix/chore/docs/test/refactor)
3. The commit message should focus on "why" not "what"
4. Stage relevant files with `git add` (prefer specific files over `git add -A`)
5. Create the commit

Do not push to remote. Do not use --no-verify. Do not amend existing commits unless explicitly asked.
