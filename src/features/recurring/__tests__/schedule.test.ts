import { dueOccurrences } from '../schedule';

describe('dueOccurrences — monthly', () => {
  test('one occurrence per month between start and today, excluding not-yet-due months', () => {
    // dayOfMonth=15, today=2026-07-14 → this month's 15th hasn't happened yet
    const dates = dueOccurrences(
      { frequency: 'monthly', dayOfMonth: 15, weekday: null, startOn: '2026-05-01', endOn: null },
      '2026-07-14',
    );
    expect(dates).toEqual(['2026-05-15', '2026-06-15']);
  });

  test('day 31 clamps to the last day of shorter months', () => {
    const dates = dueOccurrences(
      { frequency: 'monthly', dayOfMonth: 31, weekday: null, startOn: '2026-01-01', endOn: null },
      '2026-04-30',
    );
    expect(dates).toEqual(['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30']);
  });

  test('stops at endOn when it is before today', () => {
    const dates = dueOccurrences(
      { frequency: 'monthly', dayOfMonth: 1, weekday: null, startOn: '2026-01-01', endOn: '2026-03-01' },
      '2026-06-01',
    );
    expect(dates).toEqual(['2026-01-01', '2026-02-01', '2026-03-01']);
  });

  test('does not include a day before startOn in the start month', () => {
    const dates = dueOccurrences(
      { frequency: 'monthly', dayOfMonth: 5, weekday: null, startOn: '2026-07-10', endOn: null },
      '2026-07-14',
    );
    expect(dates).toEqual([]);
  });

  test('returns empty when startOn is after today', () => {
    const dates = dueOccurrences(
      { frequency: 'monthly', dayOfMonth: 1, weekday: null, startOn: '2026-08-01', endOn: null },
      '2026-07-14',
    );
    expect(dates).toEqual([]);
  });
});

describe('dueOccurrences — weekly', () => {
  test('every matching weekday between start and today', () => {
    // 2026-07-14 is a Tuesday
    const dates = dueOccurrences(
      { frequency: 'weekly', dayOfMonth: null, weekday: 2, startOn: '2026-07-01', endOn: null },
      '2026-07-14',
    );
    expect(dates).toEqual(['2026-07-07', '2026-07-14']);
  });

  test('starts from the first matching weekday on or after startOn', () => {
    const dates = dueOccurrences(
      { frequency: 'weekly', dayOfMonth: null, weekday: 0, startOn: '2026-07-01', endOn: null }, // Wed start, Sunday target
      '2026-07-14',
    );
    expect(dates).toEqual(['2026-07-05', '2026-07-12']);
  });
});
