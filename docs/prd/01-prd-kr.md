# oh-my-paul PRD

## 개요

oh-my-paul은 Claude Code 플러그인 개발을 학습하기 위한 미니 플러그인이다.
플러그인의 4가지 핵심 요소(command, agent, hook, MCP)를 각각 최소 단위로 구현한다.

## 범위

| 요소 | 수량 | 설명 |
|---|---|---|
| Commands | 2 | /commit, /review |
| Agents | 2 | reviewer, planner |
| Hooks | 1 | PreToolUse (위험 명령 경고) |
| MCP 서버 | 1 | project-info 도구 |

## 시나리오

### 시나리오 1: /commit

사용자가 `/commit` 입력 → 플러그인이 git status/diff를 수집 → LLM이 커밋 메시지 작성 → git commit 실행

**상세 흐름**:
1. 사용자가 `/commit` 입력
2. 커맨드가 `git status`, `git diff HEAD`, `git log --oneline -10` 결과를 동적으로 수집
3. LLM이 변경 사항을 분석하여 conventional commit 메시지 생성
4. `git add` + `git commit` 실행
5. 커밋 결과 출력

**허용 도구**: `Bash(git:*)`

### 시나리오 2: /review

사용자가 `/review` 입력 → reviewer 에이전트가 변경된 파일을 분석 → 버그/스타일/보안 이슈 리포트

**상세 흐름**:
1. 사용자가 `/review` 입력
2. `git diff --name-only`로 변경된 파일 목록 수집
3. `git diff`로 전체 diff 수집
4. LLM이 변경 사항을 분석
5. 이슈를 심각도(high/medium/low)로 분류하여 리포트

**허용 도구**: `Read`, `Glob`, `Grep`, `Bash(git diff:*)`

### 시나리오 3: 위험 명령 경고 (Hook)

사용자가 rm -rf 등 위험 명령 실행 시도 → PreToolUse hook이 감지 → 경고 메시지 주입

**상세 흐름**:
1. LLM이 Bash 도구로 명령 실행 시도
2. PreToolUse hook이 트리거
3. safety-check.mjs가 stdin에서 JSON 이벤트 읽기
4. tool_input.command에 위험 패턴 검사
5. 위험 시: `{ "decision": "deny", "reason": "..." }` 반환
6. 안전 시: exit 0 (출력 없음 = 허용)

**감지 패턴**:
- `rm -rf /`
- `rm -rf ~`
- `:(){ :|:& };:` (fork bomb)
- `> /dev/sda`
- `dd if=/dev/zero`
- `chmod -R 777 /`

### 시나리오 4: 프로젝트 정보 (MCP)

LLM이 project-info 도구 호출 → MCP 서버가 package.json, git 상태 등 프로젝트 메타데이터 반환

**상세 흐름**:
1. LLM이 `project-info` 도구 호출
2. MCP 서버가 현재 디렉토리의 프로젝트 정보 수집
3. JSON 형태로 메타데이터 반환:
   - name, version, description (package.json)
   - dependencies 수
   - git branch, git status (clean/dirty)
   - file count
   - language (주요 파일 확장자)

## 비범위

- Multi-agent orchestration (autopilot, ralph 등)
- HUD / statusline
- 복잡한 skill 시스템
- Analytics / cost tracking
- npm 패키지 배포
- CI/CD 파이프라인

## 설치 방법

### Claude Code

```bash
claude /plugin install https://github.com/iamslash/oh-my-paul
```

### Paul

Paul의 플러그인 시스템이 Claude Code 표준 구조를 인식하도록 확장 필요. 초기에는 심볼릭 링크로 연결:

```bash
ln -s /path/to/oh-my-paul ~/.paul/plugins/oh-my-paul
```

## 기술 스택

- Node.js (MCP 서버, hook 스크립트)
- Markdown (commands, agents)
- JSON (plugin.json, hooks.json, .mcp.json)

## Acceptance Criteria

- [ ] /commit → git commit 메시지 자동 생성 + 실행
- [ ] /review → 변경 파일 분석 + 리포트
- [ ] rm -rf 시도 시 경고 메시지 표시
- [ ] project-info MCP 도구 호출 → 프로젝트 메타데이터 반환
- [ ] Claude Code에 설치 후 /commit, /review 동작
- [ ] Paul에 설치 후 동작 (플러그인 로딩 확장 필요)
