import { parseAmountFromComment } from '../parseAmount';

describe('parseAmountFromComment', () => {
  test('parses comma-separated amount followed by 원', () => {
    expect(parseAmountFromComment('스벅 4,500원')).toBe(4500);
  });

  test('parses amount without commas', () => {
    expect(parseAmountFromComment('택시 12000원')).toBe(12000);
  });

  test('parses amount with no space before 원', () => {
    expect(parseAmountFromComment('점심12000원 카드')).toBe(12000);
  });

  test('parses amount with a space before 원', () => {
    expect(parseAmountFromComment('편의점 3000 원')).toBe(3000);
  });

  test('returns null when there is no currency unit', () => {
    expect(parseAmountFromComment('그냥 메모')).toBeNull();
  });

  test('returns null when the number is not followed by 원', () => {
    expect(parseAmountFromComment('4500번 버스')).toBeNull();
  });

  test('returns null for zero amount', () => {
    expect(parseAmountFromComment('0원')).toBeNull();
  });

  test('returns null for empty string', () => {
    expect(parseAmountFromComment('')).toBeNull();
  });

  test('picks the first amount when multiple are present', () => {
    expect(parseAmountFromComment('아메리카노 4,500원 + 팁 500원')).toBe(4500);
  });
});
