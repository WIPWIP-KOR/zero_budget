import { and, asc, eq, isNull, sql } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { accounts, transactions, type AccountType } from '@/db/schema';
import { getCurrentLedgerId } from '@/features/ledgers/current';
import { nowISO } from '@/lib/dates';
import { newId } from '@/lib/id';

export function accountsQuery() {
  return getDb()
    .select()
    .from(accounts)
    .where(and(eq(accounts.ledgerId, getCurrentLedgerId()), isNull(accounts.deletedAt)))
    .orderBy(asc(accounts.sortOrder));
}

/** 자산 목록 + 전체 기간 잔액(수입 - 지출) */
export function accountBalancesQuery() {
  return getDb()
    .select({
      account: accounts,
      balance: sql<number>`coalesce(sum(
        case
          when ${transactions.type} = 'income' then ${transactions.amount}
          when ${transactions.type} = 'expense' then -${transactions.amount}
          else 0
        end
      ), 0)`,
    })
    .from(accounts)
    .leftJoin(
      transactions,
      and(eq(transactions.accountId, accounts.id), isNull(transactions.deletedAt)),
    )
    .where(and(eq(accounts.ledgerId, getCurrentLedgerId()), isNull(accounts.deletedAt)))
    .groupBy(accounts.id)
    .orderBy(asc(accounts.sortOrder));
}

export function accountQuery(id: string) {
  return getDb().select().from(accounts).where(eq(accounts.id, id)).limit(1);
}

export interface AccountInput {
  name: string;
  type: AccountType;
  color: string;
}

export async function createAccount(input: AccountInput): Promise<string> {
  const id = newId();
  const ts = nowISO();
  const existing = await accountsQuery();
  await getDb().insert(accounts).values({
    id,
    ledgerId: getCurrentLedgerId(),
    ...input,
    sortOrder: existing.length,
    createdAt: ts,
    updatedAt: ts,
  });
  return id;
}

export async function updateAccount(id: string, input: AccountInput): Promise<void> {
  await getDb()
    .update(accounts)
    .set({ ...input, updatedAt: nowISO(), dirty: 1 })
    .where(eq(accounts.id, id));
}

/** soft delete — 기존 거래의 자산 표시는 유지된다 */
export async function deleteAccount(id: string): Promise<void> {
  const ts = nowISO();
  await getDb()
    .update(accounts)
    .set({ deletedAt: ts, updatedAt: ts, dirty: 1 })
    .where(eq(accounts.id, id));
}
