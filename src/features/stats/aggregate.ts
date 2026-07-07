import type { TransactionWithRefs } from '@/features/transactions/group';

export interface CategoryBreakdownItem {
  categoryId: string | null;
  name: string;
  color: string;
  icon: string;
  total: number;
  /** 0~1, 해당 타입 합계 대비 비중 */
  ratio: number;
}

/** 한 달 거래를 카테고리별 합계로 묶는다 (금액 내림차순). */
export function categoryBreakdown(
  rows: TransactionWithRefs[],
  type: 'income' | 'expense',
): CategoryBreakdownItem[] {
  const byCategory = new Map<string, CategoryBreakdownItem>();
  let sum = 0;

  for (const row of rows) {
    if (row.tx.type !== type) continue;
    sum += row.tx.amount;
    const key = row.tx.categoryId ?? 'uncategorized';
    const item = byCategory.get(key) ?? {
      categoryId: row.tx.categoryId,
      name: row.category?.name ?? '미분류',
      color: row.category?.color ?? '#64748B',
      icon: row.category?.icon ?? 'help',
      total: 0,
      ratio: 0,
    };
    item.total += row.tx.amount;
    byCategory.set(key, item);
  }

  const items = [...byCategory.values()].sort((a, b) => b.total - a.total);
  for (const item of items) {
    item.ratio = sum > 0 ? item.total / sum : 0;
  }
  return items;
}

export interface MonthlyPoint {
  month: string; // YYYY-MM
  income: number;
  expense: number;
}

/** 주어진 월 목록(YYYY-MM 배열) 순서대로 월별 수입/지출 합계를 만든다. */
export function monthlySeries(
  rows: { occurredOn: string; type: string; amount: number }[],
  months: string[],
): MonthlyPoint[] {
  const map = new Map<string, MonthlyPoint>(
    months.map((m) => [m, { month: m, income: 0, expense: 0 }]),
  );
  for (const row of rows) {
    const point = map.get(row.occurredOn.slice(0, 7));
    if (!point) continue;
    if (row.type === 'income') point.income += row.amount;
    else if (row.type === 'expense') point.expense += row.amount;
  }
  return months.map((m) => map.get(m)!);
}
