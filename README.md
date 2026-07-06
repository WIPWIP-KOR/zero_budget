# 제로가계부 (zero_budget)

오프라인 우선 가계부 모바일 앱. 카카오톡처럼 기기에 저장된 데이터로 즉시 동작하고, 계정으로 서버 동기화합니다.

## 기술 스택

- **Expo (React Native) + TypeScript** — expo-router 파일 기반 라우팅
- **expo-sqlite + Drizzle ORM** — 로컬 DB가 진실의 원천 (오프라인 우선)
- **Supabase** — 계정(카카오/이메일) + Postgres 동기화
- **TanStack Query** — 비동기 상태 관리

## 구조

```
app/                  # expo-router 화면
  (tabs)/             # 홈 / 내역 / 통계 / 설정 탭
  transaction/        # 거래 입력(모달), 상세/수정
src/
  db/                 # Drizzle 스키마, 마이그레이션, 클라이언트
  sync/               # Supabase push/pull 동기화 엔진
  features/           # transactions, categories, accounts, stats
  components/         # 공용 UI
  lib/                # supabase 클라이언트, 포맷 유틸
  constants/          # 기본 카테고리/자산 시드
supabase/migrations/  # 서버 스키마 + RLS
```

## 개발

```bash
npm install
npm start          # Expo 개발 서버
npm run typecheck  # tsc --noEmit
npm test           # jest
```
