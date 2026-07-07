import { shouldApplyRemote } from '../lww';

describe('shouldApplyRemote', () => {
  const older = '2026-07-01T00:00:00.000Z';
  const newer = '2026-07-02T00:00:00.000Z';

  test('clean local always accepts remote', () => {
    expect(shouldApplyRemote(newer, 0, older)).toBe(true);
    expect(shouldApplyRemote(older, 0, newer)).toBe(true);
  });

  test('dirty local keeps newer local change', () => {
    expect(shouldApplyRemote(newer, 1, older)).toBe(false);
  });

  test('dirty local yields to newer remote (last write wins)', () => {
    expect(shouldApplyRemote(older, 1, newer)).toBe(true);
  });

  test('handles postgres timestamptz offset format', () => {
    // 서버는 +00:00 형식으로 돌려줄 수 있다
    expect(shouldApplyRemote('2026-07-01T00:00:00.000Z', 1, '2026-07-01T09:00:00+09:00')).toBe(
      false, // 같은 시각 → 로컬 유지
    );
    expect(shouldApplyRemote('2026-07-01T00:00:00.000Z', 1, '2026-07-01T09:00:01+09:00')).toBe(
      true,
    );
  });
});
