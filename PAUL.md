# oh-my-paul

Claude Code / Paul 플러그인. 코딩 작업을 도와주는 커맨드, 에이전트, 스킬을 제공한다.

## Commands

| 커맨드 | 설명 |
|---|---|
| `/commit` | git 변경사항을 분석하여 conventional commit 생성 |
| `/review` | 변경된 파일의 버그, 보안, 스타일 이슈 리뷰 |

## Agents

| 에이전트 | 설명 | 사용 시점 |
|---|---|---|
| `reviewer` | 코드 리뷰 전문가 (읽기 전용) | 코드 품질 분석, PR 리뷰 |
| `planner` | 구현 계획 전문가 (읽기 전용) | 복잡한 작업 전 계획 수립 |

에이전트는 Agent 도구로 자동 선택되거나 명시적으로 지정할 수 있다.

## Skills

| 스킬 | 트리거 | 설명 |
|---|---|---|
| `explain` | "설명해줘", "이해하고 싶어" | 코드 구조/로직/데이터 흐름 상세 설명 |
| `refactor` | "리팩토링", "정리", "단순화" | 안전한 리팩토링 가이드 (분석→계획→확인→실행) |

## MCP 도구

| 도구 | 설명 |
|---|---|
| `project-info` | 프로젝트 메타데이터 반환 (name, version, git status, 파일 수, 언어) |

## Safety Hook

Bash 명령 실행 전 위험 패턴을 감지하여 차단한다:
- `rm -rf /`, `rm -rf ~`
- fork bomb, disk zeroing
- 루트 권한 변경

## Rules

`templates/rules/` 디렉토리에 프로젝트에 복사하여 사용할 수 있는 규칙 템플릿이 있다:

```bash
cp -r /path/to/oh-my-paul/templates/rules/ .paul/rules/
```
