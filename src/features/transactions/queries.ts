import { and, desc, eq, gte, isNull, lte } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { accounts, categories, transactions, type TransactionType } from '@/db/schema';
import { getCurrentLedgerId } from '@/features/ledgers/current';
import { monthRange, nowISO } from '@/lib/dates';
import { newId } from '@/lib/id';

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  categoryId: string | null;
  accountId: string | null;
  toAccountId?: string | null;
  memo: string | null;
  occurredOn: string; // YYYY-MM-DD
}

/** 한 달치 거래 + 카테고리/자산 조인. useLiveQuery에 넘겨 반응형으로 사용 */
export function monthTransactionsQuery(monthKey: string) {
  const [start, end] = monthRange(monthKey);
  return getDb()
    .select({
      tx: transactions,
      category: categories,
      account: accounts,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .where(
      and(
        eq(transactions.ledgerId, getCurrentLedgerId()),
        isNull(transactions.deletedAt),
        gte(transactions.occurredOn, start),
        lte(transactions.occurredOn, end),
      ),
    )
    .orderBy(desc(transactions.occurredOn), desc(transactions.createdAt));
}

export type TransactionRow = Awaited<ReturnType<ReturnType<typeof monthTransactionsQuery>['execute']>>[number];

export function transactionQuery(id: string) {
  return getDb().select().from(transactions).where(eq(transactions.id, id)).limit(1);
}

export async function createTransaction(input: TransactionInput): Promise<string> {
  const id = newId();
  const ts = nowISO();
  await getDb().insert(transactions).values({
    id,
    ledgerId: getCurrentLedgerId(),
    ...input,
    memo: input.memo?.trim() || null,
    createdAt: ts,
    updatedAt: ts,
    dirty: 1,
  });
  return id;
}

export async function updateTransaction(id: string, input: TransactionInput): Promise<void> {
  await getDb()
    .update(transactions)
    .set({
      ...input,
      memo: input.memo?.trim() || null,
      updatedAt: nowISO(),
      dirty: 1,
    })
    .where(eq(transactions.id, id));
}

/** soft delete — 동기화로 삭제를 전파하기 위해 행은 남긴다 */
export async function deleteTransaction(id: string): Promise<void> {
  const ts = nowISO();
  await getDb()
    .update(transactions)
    .set({ deletedAt: ts, updatedAt: ts, dirty: 1 })
    .where(eq(transactions.id, id));
}
