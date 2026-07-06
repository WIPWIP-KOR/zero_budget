import { DEFAULT_ACCOUNTS, DEFAULT_CATEGORIES } from '@/constants/seeds';
import { nowISO } from '@/lib/dates';
import { newId } from '@/lib/id';

import type { DB } from './client';
import { accounts, categories, ledgers } from './schema';

/**
 * 최초 실행 시 기본 장부 + 카테고리/자산을 넣는다.
 * 이미 장부가 있으면 아무것도 하지 않음.
 */
export async function seedIfEmpty(db: DB): Promise<void> {
  const existing = await db.select({ id: ledgers.id }).from(ledgers).limit(1);
  if (existing.length > 0) return;

  const ts = nowISO();
  const ledgerId = newId();

  await db.insert(ledgers).values({
    id: ledgerId,
    name: '내 가계부',
    createdAt: ts,
    updatedAt: ts,
  });

  await db.insert(categories).values(
    DEFAULT_CATEGORIES.map((c, i) => ({
      id: newId(),
      ledgerId,
      name: c.name,
      type: c.type,
      icon: c.icon,
      color: c.color,
      sortOrder: i,
      createdAt: ts,
      updatedAt: ts,
    })),
  );

  await db.insert(accounts).values(
    DEFAULT_ACCOUNTS.map((a, i) => ({
      id: newId(),
      ledgerId,
      name: a.name,
      type: a.type,
      color: a.color,
      sortOrder: i,
      createdAt: ts,
      updatedAt: ts,
    })),
  );
}
