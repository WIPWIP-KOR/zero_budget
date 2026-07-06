import { and, asc, eq, isNull } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { accounts } from '@/db/schema';
import { getCurrentLedgerId } from '@/features/ledgers/current';

export function accountsQuery() {
  return getDb()
    .select()
    .from(accounts)
    .where(and(eq(accounts.ledgerId, getCurrentLedgerId()), isNull(accounts.deletedAt)))
    .orderBy(asc(accounts.sortOrder));
}
