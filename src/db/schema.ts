import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * 모든 테이블 공통 컬럼.
 * - id: 기기에서 생성한 uuid → 오프라인에서 만들어도 서버와 충돌 없음
 * - userId: 로그인 전에는 null, 로그인 시 계정에 연결
 * - deletedAt: soft delete → 동기화로 삭제 전파
 * - dirty: 1이면 아직 서버에 push되지 않은 변경
 */
const syncColumns = {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  dirty: integer('dirty').notNull().default(1),
};

/**
 * 가계부(장부). 데이터 소유의 기본 단위.
 * - main: 나/부부 주 장부 (혼자 쓰면 멤버 1명, 부부가 쓰면 멤버 2명)
 * - party: 여행비·회비처럼 주 장부와 별개로 여럿이 공유하는 장부
 * - personal: 공유하지 않는 개인 전용 장부 (사업/여행 적립 등 목적별로 여러 개 가능, 무료)
 */
export const ledgers = sqliteTable('ledgers', {
  ...syncColumns,
  name: text('name').notNull(),
  kind: text('kind', { enum: ['main', 'party', 'personal'] }).notNull().default('main'),
});

export const ledgerMembers = sqliteTable('ledger_members', {
  ...syncColumns,
  ledgerId: text('ledger_id').notNull(),
  role: text('role', { enum: ['owner', 'member'] }).notNull().default('member'),
});

export const accounts = sqliteTable('accounts', {
  ...syncColumns,
  ledgerId: text('ledger_id').notNull(),
  name: text('name').notNull(),
  type: text('type', { enum: ['cash', 'card', 'bank'] }).notNull(),
  color: text('color').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const categories = sqliteTable('categories', {
  ...syncColumns,
  ledgerId: text('ledger_id').notNull(),
  name: text('name').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const transactions = sqliteTable(
  'transactions',
  {
    ...syncColumns,
    ledgerId: text('ledger_id').notNull(),
    type: text('type', { enum: ['income', 'expense', 'transfer'] }).notNull(),
    /** 원 단위 정수 (부동소수점 금지). 캡처 시 코멘트 파싱 실패로 아직 없으면 0 */
    amount: integer('amount').notNull(),
    categoryId: text('category_id'),
    accountId: text('account_id'),
    /** transfer일 때 입금 자산 */
    toAccountId: text('to_account_id'),
    memo: text('memo'),
    /** YYYY-MM-DD */
    occurredOn: text('occurred_on').notNull(),
    /** unsorted: 수집함에 캡처만 된 상태 · sorted: 장부/카테고리 배정 완료 */
    status: text('status', { enum: ['unsorted', 'sorted'] }).notNull().default('sorted'),
    /** 캡처 원본 — 로컬 파일 uri (기기 간 동기화되는 원격 저장소 업로드는 미구현, §11 열린 질문) */
    photoUrl: text('photo_url'),
    videoUrl: text('video_url'),
    /** 캡처 시 입력한 코멘트 원문 — amount는 여기서 파싱된 결과 */
    rawComment: text('raw_comment'),
  },
  (t) => [
    index('idx_transactions_occurred_on').on(t.occurredOn),
    index('idx_transactions_category').on(t.categoryId),
    index('idx_transactions_account').on(t.accountId),
    index('idx_transactions_status').on(t.status),
  ],
);

/** 월 목표 — MVP는 저축 목표액. 연간 목표로 확장 예정 */
export const goals = sqliteTable(
  'goals',
  {
    ...syncColumns,
    ledgerId: text('ledger_id').notNull(),
    /** YYYY-MM */
    month: text('month').notNull(),
    /** 이번 달 저축 목표액 (원). spending_cap일 때는 지출 상한액으로 쓰인다 */
    savingTarget: integer('saving_target').notNull(),
    /** saving: 부부/개인 저축 목표 · spending_cap: 파티 지출 상한형 목표 */
    kind: text('kind', { enum: ['saving', 'spending_cap'] }).notNull().default('saving'),
  },
  (t) => [index('idx_goals_month').on(t.month)],
);

/**
 * 반복/고정 거래 규칙. 앱 실행/포그라운드 시 로컬에서 due 항목을 거래로 생성한다.
 * 생성되는 거래의 id는 uuidv5(rule_id + occurred_on)로 결정적으로 만들어,
 * 부부 양쪽 기기가 동시에 생성해도 같은 id로 upsert되어 자연스럽게 dedup된다.
 */
export const recurringRules = sqliteTable('recurring_rules', {
  ...syncColumns,
  ledgerId: text('ledger_id').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  amount: integer('amount').notNull(),
  categoryId: text('category_id'),
  accountId: text('account_id'),
  memo: text('memo'),
  frequency: text('frequency', { enum: ['monthly', 'weekly'] }).notNull(),
  /** frequency='monthly'일 때: 1~31, 31=말일 처리 */
  dayOfMonth: integer('day_of_month'),
  /** frequency='weekly'일 때: 0(일)~6(토) */
  weekday: integer('weekday'),
  /** YYYY-MM-DD */
  startOn: text('start_on').notNull(),
  /** YYYY-MM-DD, null=무기한 */
  endOn: text('end_on'),
});

/** 2단계(제로베이스 예산)용 — 스키마만 예약 */
export const budgets = sqliteTable(
  'budgets',
  {
    ...syncColumns,
    ledgerId: text('ledger_id').notNull(),
    /** YYYY-MM */
    month: text('month').notNull(),
    categoryId: text('category_id').notNull(),
    amount: integer('amount').notNull(),
  },
  (t) => [index('idx_budgets_month').on(t.month)],
);

/** 로컬 전용 — 테이블별 pull 커서. 서버에는 존재하지 않는다. */
export const syncState = sqliteTable('sync_state', {
  tableName: text('table_name').primaryKey(),
  lastPulledAt: text('last_pulled_at').notNull(),
});

export type Goal = typeof goals.$inferSelect;
export type Ledger = typeof ledgers.$inferSelect;
export type LedgerMember = typeof ledgerMembers.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type RecurringRule = typeof recurringRules.$inferSelect;

export type TransactionType = Transaction['type'];
export type CategoryType = Category['type'];
export type AccountType = Account['type'];
export type LedgerKind = Ledger['kind'];
export type GoalKind = Goal['kind'];
export type TransactionStatus = Transaction['status'];
export type Frequency = RecurringRule['frequency'];
export type RecurringType = RecurringRule['type'];
