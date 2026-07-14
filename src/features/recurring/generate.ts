import { eq, isNull } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { recurringRules, transactions } from '@/db/schema';
import { nowISO, toDateKey } from '@/lib/dates';
import { deterministicId } from '@/lib/id';

import { dueOccurrences } from './schedule';

/**
 * 앱 실행/포그라운드 시 호출 — 활성 반복 규칙의 due 항목을 거래로 생성한다 (§5.2).
 * 생성 거래 id는 uuidv5 대신 deterministicId(rule.id + occurredOn)로 결정적으로 만들어,
 * 부부 양쪽 기기가 동시에 생성해도 같은 id가 되어 자연 dedup된다. 이미 존재하면 건드리지 않는다
 * (정리 후 카테고리를 바꾸는 등 사용자 수정을 덮어쓰지 않기 위해 upsert가 아니라 존재 확인 후 삽입).
 */
export async function generateDueTransactions(): Promise<number> {
  const db = getDb();
  const rules = await db.select().from(recurringRules).where(isNull(recurringRules.deletedAt));
  const today = toDateKey(new Date());
  let created = 0;

  for (const rule of rules) {
    const dates = dueOccurrences(
      {
        frequency: rule.frequency,
        dayOfMonth: rule.dayOfMonth,
        weekday: rule.weekday,
        startOn: rule.startOn,
        endOn: rule.endOn,
      },
      today,
    );

    for (const occurredOn of dates) {
      const id = await deterministicId(rule.id, occurredOn);
      const existing = await db
        .select({ id: transactions.id })
        .from(transactions)
        .where(eq(transactions.id, id))
        .limit(1);
      if (existing.length > 0) continue;

      const ts = nowISO();
      await db.insert(transactions).values({
        id,
        ledgerId: rule.ledgerId,
        userId: rule.userId,
        type: rule.type,
        amount: rule.amount,
        categoryId: rule.categoryId,
        accountId: rule.accountId,
        memo: rule.memo,
        occurredOn,
        status: 'sorted',
        createdAt: ts,
        updatedAt: ts,
        dirty: 1,
      });
      created += 1;
    }
  }

  return created;
}
