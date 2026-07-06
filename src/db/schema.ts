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
 * 가계부(장부). 데이터 소유의 기본 단위 — 혼자 쓰면 멤버 1명,
 * 부부가 쓰면 멤버 2명이 같은 ledger를 공유한다.
 */
export const ledgers = sqliteTable('ledgers', {
  ...syncColumns,
  name: text('name').notNull(),
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
    /** 원 단위 정수 (부동소수점 금지) */
    amount: integer('amount').notNull(),
    categoryId: text('category_id'),
    accountId: text('account_id'),
    /** transfer일 때 입금 자산 */
    toAccountId: text('to_account_id'),
    memo: text('memo'),
    /** YYYY-MM-DD */
    occurredOn: text('occurred_on').notNull(),
  },
  (t) => [
    index('idx_transactions_occurred_on').on(t.occurredOn),
    index('idx_transactions_category').on(t.categoryId),
    index('idx_transactions_account').on(t.accountId),
  ],
);

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

export type Ledger = typeof ledgers.$inferSelect;
export type LedgerMember = typeof ledgerMembers.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Budget = typeof budgets.$inferSelect;

export type TransactionType = Transaction['type'];
export type CategoryType = Category['type'];
export type AccountType = Account['type'];
