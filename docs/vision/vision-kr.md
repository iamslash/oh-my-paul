# oh-my-paul Vision

## 왜 만드는가

Claude Code 플러그인 시스템을 이해하기 위해 직접 만들어보는 학습 프로젝트.

Claude Code는 플러그인을 통해 커맨드, 에이전트, 훅, MCP 서버를 확장할 수 있다.
oh-my-claudecode처럼 대규모 플러그인을 분석하는 것도 좋지만,
직접 최소 플러그인을 만들어보면 각 요소의 역할과 작동 방식을 더 깊이 이해할 수 있다.

oh-my-paul은 그 학습 과정의 결과물이다.

## 목표

1. **Claude Code 플러그인 구조 이해**: plugin.json, commands, agents, hooks, MCP 서버의 역할과 작동 방식을 실습
2. **최소 기능 구현**: 모든 플러그인 요소(command, agent, hook, MCP)를 각 1~2개씩 구현하여 전체 구조를 체험
3. **양쪽 설치**: Claude Code와 Paul 양쪽에 설치하여 호환성 확인

## 비목표

- oh-my-claudecode의 모든 기능 복제 (32 agents, orchestration 등)
- 프로덕션 품질
- npm 배포

## 핵심 원칙

1. **최소한의 코드**: 플러그인 구조를 보여주는 것이 목적. 기능은 단순하게
2. **문서 우선**: 각 요소가 왜 이렇게 생겼는지 설명
3. **양쪽 호환**: Claude Code 표준 플러그인 구조를 따르되, Paul에서도 인식 가능하게

## 학습 포인트

### Commands
- markdown 파일 기반 커맨드 정의
- frontmatter로 도구 권한 제어
- 동적 셸 명령 주입 (`!`backtick 문법)

### Agents
- markdown 파일 기반 에이전트 정의
- 모델 지정으로 비용 최적화
- system prompt로 역할 제한

### Hooks
- 이벤트 기반 스크립트 실행
- stdin/stdout JSON 프로토콜
- approve/deny/modify 결정 반환

### MCP 서버
- stdio JSON-RPC 2.0 프로토콜
- tools/list, tools/call 핸들링
- 플러그인 자체 도구 노출

## 타임라인

| 단계 | 설명 | 상태 |
|---|---|---|
| 1. 문서 작성 | vision, PRD, architecture, spec | 진행 중 |
| 2. 구현 | plugin.json, commands, agents, hooks, MCP | 미시작 |
| 3. 테스트 | Claude Code 설치 + Paul 설치 | 미시작 |
