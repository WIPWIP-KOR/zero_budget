import { generateInviteCode } from '../invites';

describe('generateInviteCode', () => {
  test('6 chars from unambiguous charset', () => {
    for (let i = 0; i < 50; i += 1) {
      const code = generateInviteCode();
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
      // 헷갈리는 문자 금지
      expect(code).not.toMatch(/[01OIL]/);
    }
  });
});
