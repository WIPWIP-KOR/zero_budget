import { groupByDate, sumMonth, type TransactionWithRefs } from '../group';

function row(occurredOn: string, type: 'income' | 'expense' | 'transfer', amount: number): TransactionWithRefs {
  return {
    tx: {
      id: `${occurredOn}-${type}-${amount}`,
      userId: null,
      createdAt: '2026-07-01T00:00:00.000Z',
      updatedAt: '2026-07-01T00:00:00.000Z',
      deletedAt: null,
      dirty: 0,
      type,
      amount,
      categoryId: null,
      accountId: null,
      toAccountId: null,
      memo: null,
      occurredOn,
    },
    category: null,
    account: null,
  };
}

describe('groupByDate', () => {
  test('groups consecutive rows by date with daily totals', () => {
    const sections = groupByDate([
      row('2026-07-06', 'expense', 12000),
      row('2026-07-06', 'income', 50000),
      row('2026-07-05', 'expense', 3000),
    ]);

    expect(sections).toHaveLength(2);
    expect(sections[0].dateKey).toBe('2026-07-06');
    expect(sections[0].income).toBe(50000);
    expect(sections[0].expense).toBe(12000);
    expect(sections[0].data).toHaveLength(2);
    expect(sections[1].dateKey).toBe('2026-07-05');
    expect(sections[1].expense).toBe(3000);
  });

  test('transfer does not affect totals', () => {
    const sections = groupByDate([row('2026-07-06', 'transfer', 99999)]);
    expect(sections[0].income).toBe(0);
    expect(sections[0].expense).toBe(0);
  });

  test('empty input', () => {
    expect(groupByDate([])).toEqual([]);
  });
});

describe('sumMonth', () => {
  test('computes income/expense/net', () => {
    const totals = sumMonth([
      { type: 'income', amount: 100000 },
      { type: 'expense', amount: 30000 },
      { type: 'expense', amount: 20000 },
      { type: 'transfer', amount: 5000 },
    ]);
    expect(totals).toEqual({ income: 100000, expense: 50000, net: 50000 });
  });
});
