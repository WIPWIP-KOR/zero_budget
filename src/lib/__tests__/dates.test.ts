import { addMonths, formatDateLabel, formatMonth, monthRange, toDateKey, toMonthKey } from '../dates';

describe('dates', () => {
  test('toDateKey pads month/day', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toDateKey(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  test('toMonthKey', () => {
    expect(toMonthKey(new Date(2026, 6, 6))).toBe('2026-07');
  });

  test('monthRange handles month lengths and leap years', () => {
    expect(monthRange('2026-07')).toEqual(['2026-07-01', '2026-07-31']);
    expect(monthRange('2026-02')).toEqual(['2026-02-01', '2026-02-28']);
    expect(monthRange('2028-02')).toEqual(['2028-02-01', '2028-02-29']);
  });

  test('addMonths crosses year boundaries', () => {
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-07', 0)).toBe('2026-07');
  });

  test('formatMonth', () => {
    expect(formatMonth('2026-07')).toBe('2026년 7월');
  });

  test('formatDateLabel includes weekday', () => {
    // 2026-07-06은 월요일
    expect(formatDateLabel('2026-07-06')).toBe('7월 6일 (월)');
  });
});
