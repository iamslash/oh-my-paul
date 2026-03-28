# Spec: 플러그인 구조

## 1. plugin.json

`.claude-plugin/plugin.json`에 위치. Claude Code가 플러그인을 인식하는 진입점.

```json
{
  "name": "oh-my-paul",
  "version": "0.1.0",
  "description": "Claude Code plugin for learning — git commit, code review, safety hook",
  "author": { "name": "iamslash" },
  "repository": "https://github.com/iamslash/oh-my-paul",
  "license": "MIT",
  "mcpServers": "./.mcp.json"
}
```

**필드 설명**:
- `name`: 플러그인 식별자. `/plugin list`에 표시
- `version`: semver. 업데이트 감지에 사용
- `mcpServers`: MCP 서버 설정 파일 경로 (플러그인 루트 기준 상대경로)

## 2. /commit 커맨드 (commands/commit.md)

frontmatter:
- `allowed-tools`: `Bash(git add:*)`, `Bash(git status:*)`, `Bash(git commit:*)`, `Bash(git diff:*)`
- `description`: Create a git commit with auto-generated message

동적 컨텍스트:
- `git status`
- `git diff HEAD`
- `git branch --show-current`
- `git log --oneline -10`

프롬프트:
- 변경 사항을 분석하여 conventional commit 메시지 생성
- stage + commit 실행

### 예상 커맨드 파일

```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git diff:*)
description: Create a git commit with auto-generated message
---

## Context

- Current branch: !`git branch --show-current`
- Git status: !`git status`
- Recent commits: !`git log --oneline -10`
- Changes: !`git diff HEAD`

## Your task

1. Analyze the changes above
2. Create a conventional commit message (type: feat, fix, docs, refactor, test, chore)
3. Stage the relevant files with git add
4. Run git commit with the generated message
5. Show the commit result
```

## 3. /review 커맨드 (commands/review.md)

frontmatter:
- `allowed-tools`: `Read`, `Glob`, `Grep`, `Bash(git diff:*)`
- `description`: Review changed files for bugs, style, security

동적 컨텍스트:
- `git diff --name-only`
- `git diff`

프롬프트:
- 변경된 파일을 분석
- 버그, 보안, 스타일 이슈 리포트
- 심각도(high/medium/low) 분류

### 예상 커맨드 파일

```markdown
---
allowed-tools: Read, Glob, Grep, Bash(git diff:*)
description: Review changed files for bugs, style, security
---

## Context

- Changed files: !`git diff --name-only`
- Diff: !`git diff`

## Your task

Review the changes above. For each issue found, report:

1. **File**: path
2. **Line**: line number (if applicable)
3. **Severity**: high / medium / low
4. **Category**: bug / security / style / performance
5. **Description**: what the issue is and why it matters
6. **Suggestion**: how to fix it

Focus on:
- Logic errors and potential bugs
- Security vulnerabilities (injection, auth bypass, etc.)
- Style inconsistencies
- Performance concerns

Do NOT modify any files. Report only.
```

## 4. reviewer 에이전트 (agents/reviewer.md)

frontmatter:
- `name`: reviewer
- `description`: Code review specialist
- `model`: claude-sonnet-4-6

프롬프트:
- 코드 리뷰 전문 에이전트
- Read, Grep으로 코드 분석
- 파일 수정 금지 (읽기 전용)

### 예상 에이전트 파일

```markdown
---
name: reviewer
description: Code review specialist
model: claude-sonnet-4-6
---

You are a code review specialist. Your job is to analyze code for:

- Logic errors and bugs
- Security vulnerabilities
- Style and naming inconsistencies
- Performance issues
- Missing error handling

Rules:
- Use Read, Glob, Grep to explore code. Do NOT modify any files.
- Report issues with file path, line number, severity, and suggestion.
- Be specific and actionable. Avoid vague feedback.
- Classify severity as high (must fix), medium (should fix), low (nice to fix).
```

## 5. planner 에이전트 (agents/planner.md)

frontmatter:
- `name`: planner
- `description`: Implementation planning specialist
- `model`: claude-sonnet-4-6

프롬프트:
- 구현 계획 수립
- 파일/단계 식별
- 위험 요소 분석
- 코드 작성 금지 (계획만)

### 예상 에이전트 파일

```markdown
---
name: planner
description: Implementation planning specialist
model: claude-sonnet-4-6
---

You are an implementation planning specialist. Your job is to:

1. Analyze the requested feature or change
2. Identify which files need to be created or modified
3. Break the work into ordered steps
4. Identify risks and dependencies
5. Estimate complexity (small / medium / large)

Rules:
- Use Read, Glob, Grep to understand the codebase. Do NOT modify any files.
- Output a numbered plan with clear deliverables per step.
- Flag any risks or ambiguities that need clarification.
- Do NOT write code. Planning only.
```

## 6. PreToolUse 훅 (hooks/hooks.json + scripts/safety-check.mjs)

### hooks.json 구조

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "node \"$CLAUDE_PLUGIN_ROOT\"/scripts/safety-check.mjs",
        "timeout": 5
      }]
    }]
  }
}
```

**필드 설명**:
- `matcher`: `"Bash"` -- Bash 도구 호출 시에만 트리거
- `type`: `"command"` -- 외부 명령 실행
- `command`: 실행할 스크립트. `$CLAUDE_PLUGIN_ROOT`는 런타임에 플러그인 루트로 치환
- `timeout`: 최대 실행 시간 (초). 초과 시 허용 처리

### safety-check.mjs 동작

1. stdin에서 JSON 이벤트 읽기 (`tool_name`, `tool_input`)
2. `tool_input.command`에 위험 패턴 검사:
   - `rm -rf /`
   - `rm -rf ~`
   - `:(){ :|:& };:` (fork bomb)
   - `> /dev/sda`
   - `dd if=/dev/zero`
   - `chmod -R 777 /`
3. 매칭 시: `{ "decision": "deny", "reason": "Dangerous command blocked: ..." }` 출력
4. 안전 시: exit 0 (출력 없음 = 허용)

### 예상 스크립트 구조

```javascript
// scripts/safety-check.mjs
import { readFileSync } from 'fs';

const input = JSON.parse(readFileSync('/dev/stdin', 'utf-8'));
const command = input.tool_input?.command || '';

const dangerousPatterns = [
  { pattern: /rm\s+-rf\s+\/(?!\w)/, label: 'rm -rf /' },
  { pattern: /rm\s+-rf\s+~/, label: 'rm -rf ~' },
  { pattern: /:\(\)\s*\{.*\|.*&\s*\}\s*;?\s*:/, label: 'fork bomb' },
  { pattern: />\s*\/dev\/sda/, label: 'write to /dev/sda' },
  { pattern: /dd\s+if=\/dev\/zero/, label: 'dd if=/dev/zero' },
  { pattern: /chmod\s+-R\s+777\s+\/(?!\w)/, label: 'chmod -R 777 /' },
];

for (const { pattern, label } of dangerousPatterns) {
  if (pattern.test(command)) {
    console.log(JSON.stringify({
      decision: 'deny',
      reason: `Dangerous command blocked: ${label}`,
    }));
    process.exit(0);
  }
}

// 안전 -- 출력 없이 종료 = 허용
process.exit(0);
```

## 7. MCP 서버 (mcp/server.mjs)

### .mcp.json

```json
{
  "mcpServers": {
    "paul-tools": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/mcp/server.mjs"]
    }
  }
}
```

### server.mjs 동작

stdio JSON-RPC 2.0 서버. 1개 도구 제공:

**project-info 도구**:
- 입력: 없음 (또는 optional `cwd`)
- 출력: 프로젝트 메타데이터 JSON
  - `name` (package.json에서)
  - `version`
  - `description`
  - `dependencies` 수
  - `git_branch`
  - `git_status` (clean/dirty)
  - `file_count`
  - `language` (주요 파일 확장자)

### 프로토콜

- `initialize` → serverInfo 반환
- `tools/list` → `[project-info]` 반환
- `tools/call(project-info)` → 메타데이터 JSON 반환

### 메시지 예시

**initialize 요청**:
```json
{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"capabilities": {}}}
```

**initialize 응답**:
```json
{"jsonrpc": "2.0", "id": 1, "result": {"serverInfo": {"name": "paul-tools", "version": "0.1.0"}, "capabilities": {"tools": {}}}}
```

**tools/list 응답**:
```json
{"jsonrpc": "2.0", "id": 2, "result": {"tools": [{"name": "project-info", "description": "Get project metadata", "inputSchema": {"type": "object", "properties": {"cwd": {"type": "string", "description": "Working directory (optional)"}}}}]}}
```

**tools/call 응답**:
```json
{"jsonrpc": "2.0", "id": 3, "result": {"content": [{"type": "text", "text": "{\"name\": \"oh-my-paul\", \"version\": \"0.1.0\", ...}"}]}}
```

## 8. 구현 순서

1. `.claude-plugin/plugin.json`
2. `commands/commit.md`, `commands/review.md`
3. `agents/reviewer.md`, `agents/planner.md`
4. `hooks/hooks.json` + `scripts/safety-check.mjs`
5. `.mcp.json` + `mcp/server.mjs`
6. Claude Code에 설치 테스트
7. Paul에 설치 테스트

## 9. Acceptance Criteria

- [ ] plugin.json이 Claude Code 표준 구조를 따름
- [ ] /commit → git diff 기반 커밋 메시지 생성 + 실행
- [ ] /review → 변경 파일 분석 리포트
- [ ] Bash `rm -rf /` 시도 시 hook이 차단
- [ ] project-info MCP 도구가 프로젝트 메타데이터 반환
- [ ] Claude Code에서 `/plugin install`로 설치 가능
- [ ] 설치 후 /commit, /review 커맨드 인식
