import { and, asc, eq, isNull } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { recurringRules, type Frequency, type RecurringType } from '@/db/schema';
import { getCurrentLedgerId } from '@/features/ledgers/current';
import { nowISO } from '@/lib/dates';
import { newId } from '@/lib/id';

export function recurringRulesQuery() {
  return getDb()
    .select()
    .from(recurringRules)
    .where(and(eq(recurringRules.ledgerId, getCurrentLedgerId()), isNull(recurringRules.deletedAt)))
    .orderBy(asc(recurringRules.startOn));
}

export function recurringRuleQuery(id: string) {
  return getDb().select().from(recurringRules).where(eq(recurringRules.id, id)).limit(1);
}

export interface RecurringRuleInput {
  type: RecurringType;
  amount: number;
  categoryId: string | null;
  accountId: string | null;
  memo: string | null;
  frequency: Frequency;
  dayOfMonth: number | null;
  weekday: number | null;
  startOn: string; // YYYY-MM-DD
  endOn: string | null;
}

export async function createRecurringRule(input: RecurringRuleInput): Promise<string> {
  const id = newId();
  const ts = nowISO();
  await getDb().insert(recurringRules).values({
    id,
    ledgerId: getCurrentLedgerId(),
    ...input,
    createdAt: ts,
    updatedAt: ts,
  });
  return id;
}

export async function updateRecurringRule(id: string, input: RecurringRuleInput): Promise<void> {
  await getDb()
    .update(recurringRules)
    .set({ ...input, updatedAt: nowISO(), dirty: 1 })
    .where(eq(recurringRules.id, id));
}

export async function deleteRecurringRule(id: string): Promise<void> {
  const ts = nowISO();
  await getDb()
    .update(recurringRules)
    .set({ deletedAt: ts, updatedAt: ts, dirty: 1 })
    .where(eq(recurringRules.id, id));
}
