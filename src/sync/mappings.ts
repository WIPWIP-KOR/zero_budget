import { Column, is } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';

import {
  accounts,
  budgets,
  categories,
  goals,
  ledgerMembers,
  ledgers,
  transactions,
} from '@/db/schema';

/** drizzle 필드명(camelCase) ↔ DB 컬럼명(snake_case) 매핑을 스키마에서 추출 */
function fieldColumnPairs(table: SQLiteTable): [field: string, column: string][] {
  const pairs: [string, string][] = [];
  for (const [key, value] of Object.entries(table)) {
    if (is(value, Column)) pairs.push([key, value.name]);
  }
  return pairs;
}

export interface TableSync {
  /** 서버(Postgres) 테이블 이름 */
  remoteName: string;
  table: SQLiteTable;
  /** 로컬 행 → 서버 upsert payload (dirty 제외, snake_case) */
  toRemote(row: Record<string, unknown>): Record<string, unknown>;
  /** 서버 행 → 로컬 값 (camelCase, dirty=0) */
  fromRemote(remote: Record<string, unknown>): Record<string, unknown>;
}

function makeTableSync(remoteName: string, table: SQLiteTable): TableSync {
  const pairs = fieldColumnPairs(table).filter(([field]) => field !== 'dirty');
  return {
    remoteName,
    table,
    toRemote(row) {
      const out: Record<string, unknown> = {};
      for (const [field, column] of pairs) out[column] = row[field] ?? null;
      return out;
    },
    fromRemote(remote) {
      const out: Record<string, unknown> = {};
      for (const [field, column] of pairs) out[field] = remote[column] ?? null;
      out.dirty = 0;
      return out;
    },
  };
}

/** push/pull 순서 — FK 참조 순서를 따른다 (ledgers 먼저) */
export const SYNC_TABLES: TableSync[] = [
  makeTableSync('ledgers', ledgers),
  makeTableSync('ledger_members', ledgerMembers),
  makeTableSync('categories', categories),
  makeTableSync('accounts', accounts),
  makeTableSync('transactions', transactions),
  makeTableSync('goals', goals),
  makeTableSync('budgets', budgets),
];
