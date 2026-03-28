# oh-my-paul 아키텍처

## Claude Code 플러그인 시스템 구조

Claude Code는 플러그인을 다음 구조로 인식한다.

### plugin.json

플러그인 메타데이터. `.claude-plugin/plugin.json`에 위치.

```json
{
  "name": "oh-my-paul",
  "version": "0.1.0",
  "description": "...",
  "skills": "./skills/",
  "mcpServers": "./.mcp.json"
}
```

### Commands (슬래시 커맨드)

`commands/` 디렉토리의 markdown 파일. 파일명 = 커맨드명.

```markdown
---
allowed-tools: Bash(git:*), Read, Glob
description: Create a git commit
---

## Context
- Current git status: !`git status`

## Your task
Based on the above changes, create a commit.
```

**핵심 메커니즘**:
- frontmatter: `allowed-tools`로 이 커맨드에서 사용 가능한 도구 제한
- `` !` `` backtick: 커맨드 실행 시 동적으로 셸 명령 결과를 주입 (예: `` !`git status` ``)
- 본문: LLM에 전달되는 프롬프트

### Agents (에이전트 정의)

`agents/` 디렉토리의 markdown 파일. frontmatter에 name, description, model 지정.

```markdown
---
name: reviewer
description: Code review agent
model: claude-sonnet-4-6
---
You are a code review agent. Analyze code for bugs...
```

**핵심 메커니즘**:
- `model`: 에이전트가 사용할 모델 지정 (비용 최적화)
- 본문: 에이전트의 system prompt
- `level`: 에이전트 복잡도 (oh-my-claudecode 전용)

### Hooks (이벤트 핸들러)

`hooks/hooks.json`에서 이벤트 → 스크립트 매핑.

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "node \"$CLAUDE_PLUGIN_ROOT\"/scripts/safety-check.mjs",
        "timeout": 5
      }]
    }]
  }
}
```

**핵심 메커니즘**:
- `$CLAUDE_PLUGIN_ROOT`: 플러그인 루트 경로 (런타임 치환)
- `matcher`: 이벤트 필터 (`"*"` = 모든 도구, `"Bash"` = Bash만)
- stdin으로 JSON 이벤트 데이터 수신, stdout으로 JSON 결과 반환
- 반환값으로 approve/deny/modify 결정 가능

### MCP 서버

`.mcp.json`에서 플러그인 내장 MCP 서버 정의.

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

**핵심 메커니즘**:
- stdio transport (stdin/stdout JSON-RPC 2.0)
- 플러그인이 자체 도구를 LLM에 노출
- tools/list로 도구 목록 제공, tools/call로 실행

## oh-my-paul 디렉토리 구조

```
oh-my-paul/
├── .claude-plugin/
│   └── plugin.json              # 메타데이터
├── commands/
│   ├── commit.md                # /commit 커맨드
│   └── review.md                # /review 커맨드
├── agents/
│   ├── reviewer.md              # 코드 리뷰 에이전트
│   └── planner.md               # 계획 에이전트
├── hooks/
│   └── hooks.json               # PreToolUse 훅 등록
├── scripts/
│   └── safety-check.mjs         # 위험 명령 감지 스크립트
├── mcp/
│   └── server.mjs               # project-info MCP 서버
├── .mcp.json                    # MCP 서버 설정
├── docs/                        # 문서
└── README.md
```

## 데이터 흐름

### /commit 흐름

```
사용자 입력: /commit
  → commands/commit.md 로드
  → frontmatter 파싱 (allowed-tools)
  → 동적 컨텍스트 수집 (git status, git diff)
  → LLM에 프롬프트 전달
  → LLM이 커밋 메시지 생성
  → Bash 도구로 git commit 실행
  → 결과 출력
```

### Hook 흐름

```
LLM이 Bash 도구 호출 시도
  → PreToolUse 이벤트 발생
  → hooks.json에서 매칭 훅 찾기
  → safety-check.mjs 실행 (stdin: JSON 이벤트)
  → 위험 패턴 검사
  → deny 시: LLM에 차단 메시지 전달
  → approve 시: 도구 실행 진행
```

### MCP 흐름

```
LLM이 project-info 도구 호출
  → MCP 클라이언트가 tools/call 요청 (JSON-RPC)
  → server.mjs가 프로젝트 정보 수집
  → JSON 결과 반환
  → LLM이 결과를 컨텍스트로 활용
```

## oh-my-claudecode와의 비교

| 항목 | oh-my-claudecode | oh-my-paul |
|---|---|---|
| Commands | ~10 | 2 (/commit, /review) |
| Agents | 19 | 2 (reviewer, planner) |
| Skills | ~40 | 0 (commands로 대체) |
| Hooks | 5+ 스크립트 | 1 (safety-check) |
| MCP 서버 | 1 (28 도구) | 1 (1 도구) |
| Orchestration | 8+ 모드 | 없음 |
| State 관리 | .omc/state/ | 없음 |
| 목적 | 프로덕션 | 학습 |

## 설계 결정

1. **commands로 skill 대체**: Claude Code의 skill은 내부적으로 command와 유사. 학습 목적으로는 command만으로 충분
2. **단일 hook 스크립트**: 여러 이벤트를 다룰 필요 없이, PreToolUse 하나로 핵심 메커니즘 학습
3. **최소 MCP 도구**: 1개 도구(project-info)로 MCP 프로토콜의 전체 흐름 체험
4. **Node.js 스크립트**: hook과 MCP 서버는 Node.js로 작성. 별도 빌드 불필요
