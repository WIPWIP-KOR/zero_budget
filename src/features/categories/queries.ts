import { and, asc, eq, isNull } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { categories, type CategoryType } from '@/db/schema';
import { getCurrentLedgerId } from '@/features/ledgers/current';
import { nowISO } from '@/lib/dates';
import { newId } from '@/lib/id';

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

export function categoryQuery(id: string) {
  return getDb().select().from(categories).where(eq(categories.id, id)).limit(1);
}

export interface CategoryInput {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
}

export async function createCategory(input: CategoryInput): Promise<string> {
  const id = newId();
  const ts = nowISO();
  const existing = await categoriesQuery(input.type);
  await getDb().insert(categories).values({
    id,
    ledgerId: getCurrentLedgerId(),
    ...input,
    sortOrder: existing.length,
    createdAt: ts,
    updatedAt: ts,
  });
  return id;
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  await getDb()
    .update(categories)
    .set({ ...input, updatedAt: nowISO(), dirty: 1 })
    .where(eq(categories.id, id));
}

/** soft delete — 기존 거래의 카테고리 표시는 유지된다 */
export async function deleteCategory(id: string): Promise<void> {
  const ts = nowISO();
  await getDb()
    .update(categories)
    .set({ deletedAt: ts, updatedAt: ts, dirty: 1 })
    .where(eq(categories.id, id));
}
