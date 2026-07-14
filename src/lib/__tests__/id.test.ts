import { formatHexAsUuid } from '../id';

describe('formatHexAsUuid', () => {
  test('groups the first 32 hex chars as 8-4-4-4-12', () => {
    const hex = 'abcdef0123456789abcdef0123456789extra';
    expect(formatHexAsUuid(hex)).toBe('abcdef01-2345-6789-abcd-ef0123456789');
  });

  test('same hex always produces the same id', () => {
    const hex = '00112233445566778899aabbccddeeff0011223';
    expect(formatHexAsUuid(hex)).toBe(formatHexAsUuid(hex));
  });

  test('different hex produces different ids', () => {
    expect(formatHexAsUuid('a'.repeat(64))).not.toBe(formatHexAsUuid('b'.repeat(64)));
  });

  test('pads short input instead of throwing', () => {
    expect(formatHexAsUuid('abc')).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});
