# oh-my-paul 시작 가이드

> **대상**: oh-my-paul 플러그인을 처음 사용하는 개발자
> **전제**: Claude Code 설치됨

---

## 1. 설치

### 1.1 마켓플레이스 등록 + 설치 (권장)

```bash
# GitHub에서 마켓플레이스 등록
claude plugin marketplace add https://github.com/iamslash/oh-my-paul

# 플러그인 설치
claude plugin install oh-my-paul
```

### 1.2 로컬 경로에서 설치

```bash
# 저장소 클론
git clone https://github.com/iamslash/oh-my-paul.git

# 로컬 경로로 마켓플레이스 등록
claude plugin marketplace add /path/to/oh-my-paul

# 플러그인 설치
claude plugin install oh-my-paul
```

### 1.3 설치 확인

```bash
claude plugin list
```

예상 출력:

```
oh-my-paul@oh-my-paul (user, enabled)
```

### 1.4 Claude Code 재시작

설치 후 Claude Code를 재시작해야 플러그인이 활성화된다.

---

## 2. Commands (슬래시 커맨드)

### 2.1 /oh-my-paul:commit — Git Commit 자동화

```
> /oh-my-paul:commit
```

**동작**:
1. `git status`, `git diff`, `git log`를 자동 수집
2. 변경사항을 분석하여 conventional commit 메시지 생성
3. 파일 staging + commit 실행

**예시 출력**:

```
Based on the changes, I'll create a commit:

  ● Bash git add src/utils/cost.ts
  ● Bash git commit -m "fix: correct decimal precision in formatCost"

Committed: fix: correct decimal precision in formatCost
```

**주의**: push는 하지 않는다. 확인 후 직접 `git push`.

### 2.2 /oh-my-paul:review — 코드 리뷰

```
> /oh-my-paul:review
```

**동작**:
1. `git diff`로 변경된 파일 목록 수집
2. 각 파일을 읽고 분석
3. 버그, 보안, 스타일 이슈 리포트

**예시 출력**:

```
Review: 3 files, 2 issues (1 high, 1 medium)

src/auth.ts:
  🔴 HIGH src/auth.ts:42 — SQL injection: user input directly in query string
  🟡 MEDIUM src/auth.ts:15 — Missing error handling for token validation

src/utils.ts:
  No issues found.
```

**심각도**:
- 🔴 **HIGH**: 버그, 보안 취약점, 데이터 손실
- 🟡 **MEDIUM**: 로직 에러, 에러 핸들링 누락
- 🟢 **LOW**: 스타일, 네이밍

---

## 3. Agents (에이전트)

에이전트는 LLM이 Agent 도구를 통해 자동으로 선택한다. 직접 호출할 필요 없이, 요청에 맞는 에이전트가 자동 활성화된다.

### 3.1 reviewer — 코드 리뷰 전문가

**활성화 조건**: 코드 리뷰, PR 리뷰, 코드 품질 분석 요청

```
> 이 PR을 리뷰해줘
> src/auth.ts의 보안 이슈를 찾아줘
```

- Read, Glob, Grep만 사용 (읽기 전용)
- 파일을 수정하지 않음
- 심각도별 이슈 리포트

### 3.2 planner — 구현 계획 전문가

**활성화 조건**: 복잡한 구현 요청, 계획 수립 필요

```
> 인증 시스템을 리팩토링할 계획을 세워줘
> 이 기능을 어떻게 구현하면 좋을까?
```

- Read, Glob, Grep만 사용 (읽기 전용)
- 코드를 작성하지 않음
- 구조화된 계획 출력: Goal → Files → Steps → Risks

---

## 4. Skills (스킬)

스킬은 특정 패턴의 요청 시 자동으로 활성화되는 가이드라인이다.

### 4.1 explain — 코드 설명

**트리거**: "설명해줘", "이해하고 싶어", "walk through"

```
> 이 프로젝트의 인증 흐름을 설명해줘
> src/core/agent-loop.ts를 설명해줘
```

**출력 구조**:
1. **Overview** — 한 줄 요약
2. **Key Components** — 주요 함수/클래스
3. **Data Flow** — 데이터 흐름 추적
4. **Dependencies** — 의존 관계
5. **Key Decisions** — 설계 의도

### 4.2 refactor — 리팩토링 가이드

**트리거**: "리팩토링", "정리", "단순화", "clean up"

```
> 이 함수를 리팩토링해줘
> src/utils/ 디렉토리를 정리해줘
```

**4단계 프로세스**:
1. **Analyze** — 현재 코드 분석, 코드 스멜 식별
2. **Plan** — 변경 계획 제시 (사용자 확인 대기)
3. **Execute** — 확인 후 최소 변경 실행
4. **Verify** — 테스트 통과 확인

---

## 5. MCP 도구 (project-info)

플러그인이 제공하는 MCP 도구. LLM이 프로젝트 메타데이터가 필요할 때 자동으로 호출한다.

```
> 이 프로젝트에 대해 알려줘
```

**반환 정보**:
- 프로젝트 이름, 버전, 설명 (package.json)
- 의존성 수
- Git 브랜치, 상태 (clean/dirty)
- 파일 수
- 주요 언어

---

## 6. Safety Hook (위험 명령 차단)

Bash 도구 실행 전 위험한 명령을 자동으로 차단한다. 설정 불필요 — 플러그인 설치 시 자동 활성화.

### 차단 패턴

| 패턴 | 설명 |
|---|---|
| `rm -rf /` | 파일시스템 파괴 |
| `rm -rf ~` | 홈 디렉토리 삭제 |
| `:(){ :\|:& };:` | fork bomb |
| `> /dev/sda` | 디스크 직접 쓰기 |
| `dd if=/dev/zero` | 디스크 초기화 |
| `chmod -R 777 /` | 루트 권한 변경 |
| `mkfs.*` | 파일시스템 포맷 |

차단 시 표시:

```
⚠️ Dangerous command blocked: rm -rf / — filesystem destruction
```

---

## 7. Templates (규칙 템플릿)

프로젝트에 복사하여 사용할 수 있는 코딩 규칙 템플릿.

### 7.1 전체 복사

```bash
mkdir -p .paul/rules
cp -r /path/to/oh-my-paul/templates/rules/*.md .paul/rules/
```

### 7.2 개별 복사

```bash
cp /path/to/oh-my-paul/templates/rules/coding-style.md .paul/rules/
```

### 7.3 제공 템플릿

| 파일 | 내용 |
|---|---|
| `coding-style.md` | TypeScript strict, 2-space indent, any 금지 등 |
| `git-workflow.md` | Conventional commits, WIP 금지, force push 금지 |
| `testing.md` | TDD, 80% 커버리지, 독립 테스트 |
| `security.md` | 입력 검증, SQL 파라미터 바인딩, 비밀번호 하드코딩 금지 |

---

## 8. 플러그인 관리

### 8.1 업데이트

```bash
claude plugin marketplace update oh-my-paul
claude plugin update oh-my-paul
```

### 8.2 비활성화 / 활성화

```bash
claude plugin disable oh-my-paul
claude plugin enable oh-my-paul
```

### 8.3 제거

```bash
claude plugin uninstall oh-my-paul
claude plugin marketplace remove oh-my-paul
```

---

## 9. 문제 해결

| 증상 | 원인 | 해결 |
|---|---|---|
| 커맨드가 인식 안 됨 | 재시작 안 함 | Claude Code 재시작 |
| plugin list에 안 보임 | 설치 안 됨 | `claude plugin install oh-my-paul` |
| MCP 도구 안 됨 | MCP 서버 시작 실패 | Node.js 20+ 확인 |
| hook이 작동 안 함 | 플러그인 비활성화 | `claude plugin enable oh-my-paul` |
