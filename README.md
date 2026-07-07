# 영원가계부 (zero_budget)

> **목표를 향해 잘 가고 있는지 알려주는 나침반 같은 가계부.**
> 절약 → 저축 → 자산 증식이 목적이고, 기록은 수단이다.
> 잘 가고 있으면 안도감을, 벗어나면 교정 신호를 준다.

이름의 뜻: **영원 = 0원**. 무지출의 날(0원)이 쌓여 평생(영원)의 습관이 된다.
결혼을 계기로 태어난, 부부가 영원히 함께 쓰는 가계부.

- **가볍게 여러 번 입력** — 3초 만에 금액+카테고리만 툭 기록
- **부부 공동 가계부** — 각자 입력해도 하나의 장부로 합쳐진다 (초대 코드)
- **목표가 제일 위** — 이번 달 저축 목표 진행률과 페이스 메시지가 홈 최상단
- **동기부여 피드** — 무지출/절약/기록 스트릭 같은 내 이야기 + 다른 사람들의 자랑
- **오프라인 우선** — 카카오톡처럼 기기에서 즉시 동작, 로그인하면 서버와 동기화

## 기술 스택

- **Expo SDK 57 (React Native) + TypeScript** — expo-router 파일 기반 라우팅
- **expo-sqlite + Drizzle ORM** — 로컬 DB가 진실의 원천, `useLiveQuery`로 반응형 UI
- **Supabase** — 계정(카카오/이메일) + Postgres(RLS) + 동기화/피드. 키가 없으면 로컬 전용 모드
- **TanStack Query** — 서버 상태(피드) 관리

## 구조

```
app/                  # expo-router 화면
  (tabs)/             # 홈(목표+피드) / 내역(리스트↔캘린더) / 통계 / 설정
  (auth)/sign-in      # 카카오/이메일 로그인 (모달)
  transaction/        # 거래 입력·상세 (모달)
  goal/edit           # 이번 달 저축 목표 (모달)
  accounts/           # 자산 관리 (목록/추가/수정)
  post/new            # 피드 자랑하기 (모달)
  share               # 부부 가계부 초대/합류
src/
  db/                 # Drizzle 스키마·마이그레이션·시드·DatabaseProvider
  sync/               # push/pull 엔진(LWW), SyncProvider, 매핑
  features/           # transactions, categories, accounts, goals, ledgers, feed, stats, auth
  components/         # Chip, MonthSwitcher, DatePickerModal 등
  lib/                # supabase 클라이언트, 날짜/금액 유틸, uuid
  constants/          # 기본 카테고리/자산 시드
supabase/migrations/  # 서버 스키마 + RLS + 초대 RPC + 피드
```

## 데이터 모델 핵심

- 모든 데이터는 **ledger(장부)** 소속 — 혼자면 멤버 1명, 부부면 2명이 한 장부를 공유
- 행 id는 기기에서 uuid 생성 → 오프라인에서 만들어도 서버와 충돌 없음
- soft delete(`deleted_at`) + `dirty` 플래그 → push/pull 동기화, 충돌은 last-write-wins
- 금액은 원 단위 정수

## 개발

```bash
npm install            # postinstall이 expo-sqlite 웹 패치 적용
cp .env.example .env   # Supabase 키 입력(선택 — 없으면 로컬 전용 모드)
npm start              # Expo 개발 서버 (i=iOS, a=Android, w=웹)
npm run typecheck
npm test               # jest 38개
```

웹에서 실행할 때는 SQLite(wasm) 때문에 COOP/COEP 헤더가 필요하다
(개발 중에는 헤더를 추가하는 리버스 프록시를 앞에 두면 된다).

Supabase를 쓰려면 대시보드 SQL 편집기에서 `supabase/migrations/*.sql`을
순서대로 실행하고, Auth → Providers에서 Kakao를 켠다.

## 로드맵

- [x] 기록: 거래 CRUD, 카테고리, 내역 리스트/캘린더
- [x] 월별 통계 (도넛/6개월 추이)
- [x] 자산별 잔액
- [x] 이번 달 저축 목표 + 페이스 표시
- [x] 계정/동기화, 부부 장부 초대
- [x] 동기부여 피드 기본형 (내 이야기 + 공유 포스트)
- [ ] 카테고리 관리 화면
- [ ] 알림 → 바로 입력 (리마인더 딥링크)
- [ ] 연간 목표 → 월 목표 연결
- [ ] 제로베이스 예산 (카테고리별 배정, budgets 테이블 예약됨)
- [ ] 피드 확장 (팔로우, 반응)
