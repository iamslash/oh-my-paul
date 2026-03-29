# Security Rules

- 사용자 입력은 항상 검증/이스케이프
- SQL 쿼리에 파라미터 바인딩 사용 (문자열 연결 금지)
- 비밀번호/토큰을 코드에 하드코딩 금지
- 환경변수 또는 시크릿 매니저 사용
- eval(), Function() 사용 금지
- HTTP → HTTPS 강제
- CORS 설정 최소 권한 원칙
- 의존성 보안 취약점 정기 점검 (npm audit)
