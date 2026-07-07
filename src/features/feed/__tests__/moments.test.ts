import { buildLocalMoments } from '../moments';

const today = '2026-07-07';

describe('buildLocalMoments', () => {
  test('empty rows produce no moments', () => {
    expect(buildLocalMoments([], today)).toEqual([]);
  });

  test('no-spend-today when today has no expense', () => {
    const moments = buildLocalMoments(
      [{ occurredOn: '2026-07-06', type: 'expense', amount: 5000 }],
      today,
    );
    expect(moments.map((m) => m.id)).toContain('no-spend-today');
  });

  test('no no-spend moment when today has expense', () => {
    const moments = buildLocalMoments(
      [{ occurredOn: today, type: 'expense', amount: 5000 }],
      today,
    );
    expect(moments.map((m) => m.id)).not.toContain('no-spend-today');
  });

  test('week-saving when this week spent less than previous week', () => {
    const moments = buildLocalMoments(
      [
        { occurredOn: '2026-06-26', type: 'expense', amount: 100000 }, // 지난주
        { occurredOn: today, type: 'expense', amount: 30000 }, // 이번주
      ],
      today,
    );
    const saving = moments.find((m) => m.id === 'week-saving');
    expect(saving).toBeDefined();
    expect(saving!.title).toContain('70,000원');
  });

  test('streak counts consecutive days ending today', () => {
    const moments = buildLocalMoments(
      [
        { occurredOn: today, type: 'expense', amount: 1 },
        { occurredOn: '2026-07-06', type: 'income', amount: 1 },
        { occurredOn: '2026-07-05', type: 'expense', amount: 1 },
        { occurredOn: '2026-07-03', type: 'expense', amount: 1 }, // 끊김
      ],
      today,
    );
    const streak = moments.find((m) => m.id === 'streak');
    expect(streak).toBeDefined();
    expect(streak!.title).toContain('3일 연속');
  });

  test('no streak moment for a single day', () => {
    const moments = buildLocalMoments(
      [{ occurredOn: today, type: 'expense', amount: 1 }],
      today,
    );
    expect(moments.map((m) => m.id)).not.toContain('streak');
  });
});
