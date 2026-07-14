import type { TransactionWithRefs } from '@/features/transactions/group';

import { categoryBreakdown, monthlySeries } from '../aggregate';

function row(
  type: 'income' | 'expense',
  amount: number,
  category: { id: string; name: string; color: string } | null,
  occurredOn = '2026-07-06',
): TransactionWithRefs {
  return {
    tx: {
      id: Math.random().toString(36),
      ledgerId: 'ledger-1',
      userId: null,
      createdAt: '2026-07-01T00:00:00.000Z',
      updatedAt: '2026-07-01T00:00:00.000Z',
      deletedAt: null,
      dirty: 0,
      type,
      amount,
      categoryId: category?.id ?? null,
      accountId: null,
      toAccountId: null,
      memo: null,
      occurredOn,
      status: 'sorted',
      photoUrl: null,
      videoUrl: null,
      rawComment: null,
    },
    category: category
      ? {
          id: category.id,
          ledgerId: 'ledger-1',
          userId: null,
          createdAt: '',
          updatedAt: '',
          deletedAt: null,
          dirty: 0,
          name: category.name,
          type: type === 'income' ? 'income' : 'expense',
          icon: 'cart',
          color: category.color,
          sortOrder: 0,
        }
      : null,
    account: null,
  };
}

const food = { id: 'c1', name: '식비', color: '#E5484D' };
const traffic = { id: 'c2', name: '교통', color: '#3B82F6' };

describe('categoryBreakdown', () => {
  test('groups by category sorted desc with ratios', () => {
    const items = categoryBreakdown(
      [
        row('expense', 20000, food),
        row('expense', 20000, food),
        row('expense', 60000, traffic),
        row('income', 999999, null), // 다른 타입은 무시
      ],
      'expense',
    );
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ name: '교통', total: 60000, ratio: 0.6 });
    expect(items[1]).toMatchObject({ name: '식비', total: 40000, ratio: 0.4 });
  });

  test('uncategorized rows fall back to 미분류', () => {
    const items = categoryBreakdown([row('expense', 1000, null)], 'expense');
    expect(items[0].name).toBe('미분류');
    expect(items[0].ratio).toBe(1);
  });

  test('empty input', () => {
    expect(categoryBreakdown([], 'expense')).toEqual([]);
  });
});

describe('monthlySeries', () => {
  test('fills all requested months, including empty ones', () => {
    const points = monthlySeries(
      [
        { occurredOn: '2026-05-10', type: 'expense', amount: 1000 },
        { occurredOn: '2026-07-01', type: 'income', amount: 5000 },
        { occurredOn: '2026-07-15', type: 'expense', amount: 2000 },
        { occurredOn: '2026-01-01', type: 'expense', amount: 77777 }, // 범위 밖
      ],
      ['2026-05', '2026-06', '2026-07'],
    );
    expect(points).toEqual([
      { month: '2026-05', income: 0, expense: 1000 },
      { month: '2026-06', income: 0, expense: 0 },
      { month: '2026-07', income: 5000, expense: 2000 },
    ]);
  });
});
