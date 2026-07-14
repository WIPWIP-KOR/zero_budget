import { SYNC_TABLES } from '../mappings';

const tx = SYNC_TABLES.find((t) => t.remoteName === 'transactions')!;

describe('mappings', () => {
  test('all eight tables registered in FK order', () => {
    expect(SYNC_TABLES.map((t) => t.remoteName)).toEqual([
      'ledgers',
      'ledger_members',
      'categories',
      'accounts',
      'transactions',
      'goals',
      'budgets',
      'recurring_rules',
    ]);
  });

  test('toRemote maps camelCase to snake_case and drops dirty', () => {
    const remote = tx.toRemote({
      id: 't1',
      ledgerId: 'l1',
      userId: 'u1',
      type: 'expense',
      amount: 12000,
      categoryId: 'c1',
      accountId: null,
      toAccountId: null,
      memo: '점심',
      occurredOn: '2026-07-07',
      status: 'sorted',
      photoUrl: null,
      videoUrl: null,
      rawComment: null,
      createdAt: '2026-07-07T01:00:00.000Z',
      updatedAt: '2026-07-07T01:00:00.000Z',
      deletedAt: null,
      dirty: 1,
    });
    expect(remote).toMatchObject({
      id: 't1',
      ledger_id: 'l1',
      user_id: 'u1',
      category_id: 'c1',
      occurred_on: '2026-07-07',
      memo: '점심',
    });
    expect(remote).not.toHaveProperty('dirty');
    expect(remote).not.toHaveProperty('ledgerId');
  });

  test('fromRemote roundtrips and resets dirty', () => {
    const local = {
      id: 't1',
      ledgerId: 'l1',
      userId: 'u1',
      type: 'expense',
      amount: 12000,
      categoryId: 'c1',
      accountId: null,
      toAccountId: null,
      memo: null,
      occurredOn: '2026-07-07',
      status: 'sorted',
      photoUrl: null,
      videoUrl: null,
      rawComment: null,
      createdAt: '2026-07-07T01:00:00.000Z',
      updatedAt: '2026-07-07T01:00:00.000Z',
      deletedAt: null,
      dirty: 1,
    };
    const back = tx.fromRemote(tx.toRemote(local));
    expect(back).toEqual({ ...local, dirty: 0 });
  });
});
