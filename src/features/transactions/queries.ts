import { and, desc, eq, gte, isNull, lte } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { accounts, categories, transactions, type TransactionType } from '@/db/schema';
import { getCurrentLedgerId } from '@/features/ledgers/current';
import { monthRange, nowISO, toDateKey } from '@/lib/dates';
import { newId } from '@/lib/id';

import { parseAmountFromComment } from './parseAmount';

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

/** 현재 장부의 미정리(수집함) 거래 — 최근 캡처가 위로 오도록 정렬 */
export function unsortedTransactionsQuery() {
  return getDb()
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.ledgerId, getCurrentLedgerId()),
        eq(transactions.status, 'unsorted'),
        isNull(transactions.deletedAt),
      ),
    )
    .orderBy(desc(transactions.createdAt));
}

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

export interface SortInput {
  ledgerId: string;
  categoryId: string;
  accountId: string | null;
  /** 캡처 시 금액 파싱에 실패했다면 정리 단계에서 채운 금액 */
  amount?: number;
}

/** 정리 — 장부/카테고리 원탭 배정 + status='sorted'. §3.2 */
export async function sortTransaction(id: string, input: SortInput): Promise<void> {
  await getDb()
    .update(transactions)
    .set({
      ledgerId: input.ledgerId,
      categoryId: input.categoryId,
      accountId: input.accountId,
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      status: 'sorted',
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

export interface CaptureInput {
  photoUrl: string | null;
  videoUrl: string | null;
  /** 화폐 단위가 포함된 코멘트. 비어 있어도 사진/영상이 있으면 캡처는 성립 */
  comment: string;
  occurredOn?: string; // YYYY-MM-DD, 기본 오늘
}

/**
 * 3초 캡처 — §3.2. 사진/영상/코멘트 중 하나 이상만 있으면 성립한다.
 * 코멘트에서 금액을 파싱하고, 실패하면 amount=0으로 두고 정리 단계에서 보완한다.
 * 카테고리/자산은 강요하지 않고 항상 unsorted 상태로 수집함에 쌓인다.
 */
export async function createCaptureTransaction(input: CaptureInput): Promise<string> {
  const id = newId();
  const ts = nowISO();
  const amount = input.comment ? parseAmountFromComment(input.comment) ?? 0 : 0;
  await getDb().insert(transactions).values({
    id,
    ledgerId: getCurrentLedgerId(),
    type: 'expense',
    amount,
    categoryId: null,
    accountId: null,
    memo: null,
    occurredOn: input.occurredOn ?? toDateKey(new Date()),
    status: 'unsorted',
    photoUrl: input.photoUrl,
    videoUrl: input.videoUrl,
    rawComment: input.comment || null,
    createdAt: ts,
    updatedAt: ts,
    dirty: 1,
  });
  return id;
}
