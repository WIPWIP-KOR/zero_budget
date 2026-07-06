import { and, asc, eq, isNull } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { categories, type CategoryType } from '@/db/schema';

export function categoriesQuery(type?: CategoryType) {
  return getDb()
    .select()
    .from(categories)
    .where(and(isNull(categories.deletedAt), type ? eq(categories.type, type) : undefined))
    .orderBy(asc(categories.sortOrder));
}
