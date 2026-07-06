import { asc, isNull } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { accounts } from '@/db/schema';

export function accountsQuery() {
  return getDb()
    .select()
    .from(accounts)
    .where(isNull(accounts.deletedAt))
    .orderBy(asc(accounts.sortOrder));
}
