import type { Account, Category, Transaction } from '@/db/schema';

export interface TransactionWithRefs {
  tx: Transaction;
  category: Category | null;
  account: Account | null;
}

export interface DaySection {
  dateKey: string;
  income: number;
  expense: number;
  data: TransactionWithRefs[];
}

/** 날짜 내림차순 정렬된 거래를 SectionList용 일별 섹션으로 묶고 일별 합계를 계산한다. */
export function groupByDate(rows: TransactionWithRefs[]): DaySection[] {
  const sections: DaySection[] = [];
  let current: DaySection | null = null;

  for (const row of rows) {
    if (!current || current.dateKey !== row.tx.occurredOn) {
      current = { dateKey: row.tx.occurredOn, income: 0, expense: 0, data: [] };
      sections.push(current);
    }
    current.data.push(row);
    if (row.tx.type === 'income') current.income += row.tx.amount;
    else if (row.tx.type === 'expense') current.expense += row.tx.amount;
  }

  return sections;
}

export interface MonthTotals {
  income: number;
  expense: number;
  net: number;
}

export function sumMonth(rows: Pick<Transaction, 'type' | 'amount'>[]): MonthTotals {
  let income = 0;
  let expense = 0;
  for (const t of rows) {
    if (t.type === 'income') income += t.amount;
    else if (t.type === 'expense') expense += t.amount;
  }
  return { income, expense, net: income - expense };
}
