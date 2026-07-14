import { and, eq, isNull } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { goals, type GoalKind } from '@/db/schema';
import { getCurrentLedgerId } from '@/features/ledgers/current';
import { nowISO } from '@/lib/dates';
import { newId } from '@/lib/id';

export function goalQuery(month: string) {
  return getDb()
    .select()
    .from(goals)
    .where(
      and(
        eq(goals.ledgerId, getCurrentLedgerId()),
        eq(goals.month, month),
        isNull(goals.deletedAt),
      ),
    )
    .limit(1);
}

/** 해당 월의 저축/지출 상한 목표를 만들거나 갱신한다. kind는 새로 만들 때만 반영된다 */
export async function upsertGoal(
  month: string,
  savingTarget: number,
  kind: GoalKind = 'saving',
): Promise<void> {
  const db = getDb();
  const ts = nowISO();
  const existing = await goalQuery(month);

  if (existing.length > 0) {
    await db
      .update(goals)
      .set({ savingTarget, updatedAt: ts, dirty: 1 })
      .where(eq(goals.id, existing[0].id));
    return;
  }

  await db.insert(goals).values({
    id: newId(),
    ledgerId: getCurrentLedgerId(),
    month,
    savingTarget,
    kind,
    createdAt: ts,
    updatedAt: ts,
  });
}
