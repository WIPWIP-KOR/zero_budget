import { formatAmount, formatKRW, formatSigned } from '../format';

describe('format', () => {
  test('formatAmount adds thousands separators', () => {
    expect(formatAmount(0)).toBe('0');
    expect(formatAmount(999)).toBe('999');
    expect(formatAmount(1000)).toBe('1,000');
    expect(formatAmount(12345678)).toBe('12,345,678');
  });

  test('formatAmount handles negatives and truncation', () => {
    expect(formatAmount(-45000)).toBe('-45,000');
    expect(formatAmount(1234.9)).toBe('1,234');
  });

  test('formatKRW', () => {
    expect(formatKRW(50000)).toBe('50,000원');
  });

  test('formatSigned by type', () => {
    expect(formatSigned(3000, 'income')).toBe('+3,000원');
    expect(formatSigned(3000, 'expense')).toBe('-3,000원');
    expect(formatSigned(3000, 'transfer')).toBe('3,000원');
  });
});
