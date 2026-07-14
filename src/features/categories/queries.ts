import { and, asc, eq, isNull } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { categories, type CategoryType } from '@/db/schema';
import { getCurrentLedgerId } from '@/features/ledgers/current';

export function categoriesQuery(type?: CategoryType) {
  return categoriesByLedgerQuery(getCurrentLedgerId(), type);
}

/** 정리 화면처럼 현재 장부가 아닌 다른(배정 대상) 장부의 카테고리를 조회할 때 사용 */
export function categoriesByLedgerQuery(ledgerId: string, type?: CategoryType) {
  return getDb()
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.ledgerId, ledgerId),
        isNull(categories.deletedAt),
        type ? eq(categories.type, type) : undefined,
      ),
    )
    .orderBy(asc(categories.sortOrder));
}
