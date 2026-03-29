# oh-my-claudecode vs oh-my-paul — 범주별 비교

> **마지막 업데이트**: 2026-03-29
> **비교 대상**: oh-my-claudecode 4.9.3 vs oh-my-paul 0.1.0
> **이 문서는 oh-my-paul 업데이트 시 반드시 갱신한다.**

---

## 1. 요약

oh-my-paul은 Claude Code 플러그인 제작법을 학습하기 위한 미니 플러그인이다. oh-my-claudecode의 모든 기능을 복제하지 않으며, 각 범주별 최소 1개씩 포함하여 플러그인 구조를 체험하는 것이 목적이다.

---

## 2. 범주별 상세 비교

### 2.1 Plugin Manifest

| 항목 | oh-my-claudecode | oh-my-paul | 동일 |
|---|---|---|---|
| plugin.json | ✅ | ✅ | ✅ |
| marketplace.json | ✅ | ✅ | ✅ |
| skills 경로 지정 | ✅ | ✅ | ✅ |
| mcpServers 경로 지정 | ✅ | ✅ | ✅ |

### 2.2 Commands

| 항목 | oh-my-claudecode | oh-my-paul |
|---|---|---|
| 방식 | Skills로 대체 (commands/ 없음) | commands/ 디렉토리 사용 |
| 수량 | 0 (skills로 통합) | 2 (/commit, /review) |

oh-my-claudecode는 commands 대신 skills를 사용한다. oh-my-paul은 Claude Code 공식 플러그인 구조(commands/)를 따른다.

### 2.3 Agents

| oh-my-claudecode (19개) | oh-my-paul (2개) |
|---|---|
| analyst, architect, code-reviewer, code-simplifier, critic, debugger, designer, document-specialist, executor, explore, git-master, planner, qa-tester, scientist, security-reviewer, test-engineer, tracer, verifier, writer | reviewer, planner |

**의도적 선택**: 학습 목적으로 2개만 포함. 코드 리뷰(reviewer)와 계획(planner)은 가장 보편적인 에이전트 유형.

### 2.4 Skills

| oh-my-claudecode (32개) | oh-my-paul (2개) |
|---|---|
| autopilot, plan, ralph, ultrawork, team, cancel, deepinit, ccg, sciomc, external-context, ultraqa, hud, learner, omc-setup, mcp-setup, omc-doctor, omc-teams, omc-reference, skill, project-session-manager, configure-notifications, release, trace, writer-memory, ai-slop-cleaner, ask, deep-dive, deep-interview, ralplan, setup, visual-verdict | explain, refactor |

**의도적 선택**: orchestration 관련 스킬(autopilot, ralph 등)은 복잡한 런타임이 필요하므로 제외. 단순 프롬프트 기반 스킬 2개만 포함.

### 2.5 Hooks

| 이벤트 | oh-my-claudecode | oh-my-paul |
|---|---|---|
| UserPromptSubmit | ✅ (keyword-detector, skill-injector) | ❌ |
| SessionStart | ✅ (session-start, project-memory-session) | ❌ |
| PreToolUse | ✅ (context-safety) | ✅ (safety-check) |
| PermissionRequest | ✅ (permission-handler) | ❌ |
| PostToolUse | ✅ | ❌ |
| PostToolUseFailure | ✅ | ❌ |
| SubagentStart | ✅ | ❌ |
| SubagentStop | ✅ | ❌ |
| PreCompact | ✅ | ❌ |
| Stop | ✅ (context-guard-stop) | ❌ |
| SessionEnd | ✅ | ❌ |

**oh-my-paul**: PreToolUse 1개만. 위험 명령 차단이라는 가장 실용적인 훅을 선택.

### 2.6 MCP 서버

| 항목 | oh-my-claudecode | oh-my-paul |
|---|---|---|
| 서버 수 | 1 (bridge/mcp-server.cjs) | 1 (mcp/server.mjs) |
| 도구 수 | 28 (AST grep, LSP, notepad, state 등) | 1 (project-info) |
| 런타임 | TypeScript 빌드 (bridge/) | 순수 Node.js (mjs) |

### 2.7 지시문 파일

| 항목 | oh-my-claudecode | oh-my-paul |
|---|---|---|
| CLAUDE.md / PAUL.md | CLAUDE.md (대형, orchestration 지시문) | PAUL.md (간결, 기능 목록) |
| AGENTS.md | ✅ (에이전트 선택 가이드) | ✅ |

### 2.8 Templates

| 항목 | oh-my-claudecode | oh-my-paul |
|---|---|---|
| rules/ | ✅ (coding-style, testing 등) | ✅ (4개) |
| hooks/ | ✅ | ❌ |
| deliverables.json | ✅ | ❌ |

### 2.9 Infrastructure

| 항목 | oh-my-claudecode | oh-my-paul |
|---|---|---|
| src/ (TypeScript) | ✅ (에이전트 정의, 빌드, 런타임) | ❌ 해당 없음 |
| bridge/ | ✅ (MCP 서버, CLI 런타임) | ❌ 해당 없음 |
| scripts/ | 20+ | 1 (safety-check) |
| tests/ | ✅ (vitest) | ❌ 학습용이므로 제외 |
| CHANGELOG.md | ✅ | ✅ |
| 다국어 README | 12개 언어 | 1개 (한국어) |
| CI/CD | ✅ (.github/) | ❌ |
| npm 배포 | ✅ (oh-my-claude-sisyphus) | ❌ |

---

## 3. 의도적 제외 항목

| 항목 | 제외 이유 |
|---|---|
| Orchestration skills (autopilot, ralph, ultrawork, team) | 복잡한 TypeScript 런타임 필요 |
| HUD statusline | 빌드 시스템 필요 |
| Analytics / cost tracking | 런타임 코드 필요 |
| Keyword detector hook | orchestration과 연동 |
| 다국어 README | 학습 프로젝트에 불필요 |
| npm 배포 | 학습 프로젝트 |
| tests/ | 학습 프로젝트에 과도 |

---

## 4. 업데이트 이력

| 날짜 | 변경 |
|---|---|
| 2026-03-29 | 최초 작성 (omc 4.9.3 vs omp 0.1.0) |
