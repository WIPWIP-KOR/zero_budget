import { computeGoalProgress } from '../progress';

describe('computeGoalProgress', () => {
  test('done when saved >= target', () => {
    const p = computeGoalProgress(1_000_000, 400_000, 500_000, 10, 30);
    expect(p.status).toBe('done');
    expect(p.saved).toBe(600_000);
    expect(p.progress).toBe(1); // 클램프
  });

  test('ahead when progress beats elapsed ratio', () => {
    // 저축 300k/목표 500k = 60%, 경과 10/30 = 33%
    const p = computeGoalProgress(500_000, 200_000, 500_000, 10, 30);
    expect(p.status).toBe('ahead');
    expect(p.progress).toBeCloseTo(0.6);
  });

  test('ontrack within 5%p tolerance', () => {
    // 진행 30%, 기대 33.3% → 3.3%p 뒤 → ontrack
    const p = computeGoalProgress(150_000, 0, 500_000, 10, 30);
    expect(p.status).toBe('ontrack');
  });

  test('behind when clearly slower than pace', () => {
    // 진행 10%, 기대 50%
    const p = computeGoalProgress(50_000, 0, 500_000, 15, 30);
    expect(p.status).toBe('behind');
  });

  test('negative saving clamps progress to 0', () => {
    const p = computeGoalProgress(0, 100_000, 500_000, 5, 30);
    expect(p.saved).toBe(-100_000);
    expect(p.progress).toBe(0);
    expect(p.status).toBe('behind');
  });

  test('zero target does not divide by zero', () => {
    const p = computeGoalProgress(100_000, 0, 0, 5, 30);
    expect(p.progress).toBe(0);
  });
});
