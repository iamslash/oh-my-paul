# oh-my-paul

Claude Code 플러그인 개발을 학습하기 위한 미니 플러그인. Claude Code와 Paul 양쪽에 설치 가능.

## Status

**v0.1.0** — 구현 완료

## Quick Start

```bash
# 마켓플레이스 등록 + 설치
claude plugin marketplace add https://github.com/iamslash/oh-my-paul
claude plugin install oh-my-paul

# Claude Code 재시작 후 사용
/oh-my-paul:commit     # git commit 자동화
/oh-my-paul:review     # 코드 리뷰
```

## Features

| 범주 | 기능 |
|---|---|
| Commands | `/commit` (git commit), `/review` (코드 리뷰) |
| Agents | reviewer (코드 리뷰), planner (계획 수립) |
| Skills | explain (코드 설명), refactor (리팩토링 가이드) |
| Hooks | PreToolUse (위험 명령 차단: rm -rf, fork bomb 등) |
| MCP | project-info (프로젝트 메타데이터) |
| Templates | coding-style, git-workflow, testing, security 규칙 |

## Documents

| 문서 | 설명 |
|---|---|
| [Getting Started](docs/guide/01-getting-started-kr.md) | 설치 및 사용 가이드 |
| [Vision](docs/vision/vision-kr.md) | 왜 만드는가 |
| [PRD](docs/prd/01-prd-kr.md) | 범위, 시나리오 |
| [Design](docs/design/01-architecture-kr.md) | 아키텍처 |
| [Spec](docs/spec/01-plugin-structure-kr.md) | 구현 스펙 |

## License

MIT
