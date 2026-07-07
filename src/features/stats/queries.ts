import { and, eq, gte, isNull, lte } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { transactions } from '@/db/schema';
import { getCurrentLedgerId } from '@/features/ledgers/current';
import { monthRange } from '@/lib/dates';

/** [startMonth, endMonth] 범위(YYYY-MM, 양끝 포함)의 거래를 가볍게 조회 — 월 추이용 */
export function rangeTransactionsQuery(startMonth: string, endMonth: string) {
  const [start] = monthRange(startMonth);
  const [, end] = monthRange(endMonth);
  return getDb()
    .select({
      occurredOn: transactions.occurredOn,
      type: transactions.type,
      amount: transactions.amount,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.ledgerId, getCurrentLedgerId()),
        isNull(transactions.deletedAt),
        gte(transactions.occurredOn, start),
        lte(transactions.occurredOn, end),
      ),
    );
}
