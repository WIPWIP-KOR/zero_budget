import { addDays } from '@/lib/dates';

export interface Moment {
  id: string;
  icon: string; // Ionicons 이름
  title: string;
  sub: string;
}

interface MomentInput {
  occurredOn: string; // YYYY-MM-DD
  type: string;
  amount: number;
}

/**
 * 내 기록에서 동기부여 "이야기" 카드를 만든다 (피드 상단, 로컬 전용).
 * 규칙은 단순하게: 무지출 / 주간 절약 / 기록 스트릭.
 */
export function buildLocalMoments(rows: MomentInput[], todayKey: string): Moment[] {
  const moments: Moment[] = [];
  if (rows.length === 0) return moments;

  // 1) 오늘 무지출
  const todayExpense = rows
    .filter((r) => r.occurredOn === todayKey && r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);
  if (todayExpense === 0) {
    moments.push({
      id: 'no-spend-today',
      icon: 'sparkles',
      title: '오늘 무지출 도전 중!',
      sub: '아직 오늘 지출 기록이 없어요',
    });
  }

  // 2) 최근 7일 지출이 그 전 7일보다 적으면 절약 하이라이트
  const weekStart = addDays(todayKey, -6);
  const prevWeekStart = addDays(todayKey, -13);
  let thisWeek = 0;
  let prevWeek = 0;
  for (const r of rows) {
    if (r.type !== 'expense') continue;
    if (r.occurredOn >= weekStart && r.occurredOn <= todayKey) thisWeek += r.amount;
    else if (r.occurredOn >= prevWeekStart && r.occurredOn < weekStart) prevWeek += r.amount;
  }
  if (prevWeek > 0 && thisWeek < prevWeek) {
    moments.push({
      id: 'week-saving',
      icon: 'trending-down',
      title: `지난주보다 ${(prevWeek - thisWeek).toLocaleString()}원 아꼈어요`,
      sub: '이 페이스 그대로 가요 💪',
    });
  }

  // 3) 오늘 포함 연속 기록 일수 (2일 이상일 때만)
  const daysWithRecord = new Set(rows.map((r) => r.occurredOn));
  let streak = 0;
  let cursor = todayKey;
  while (daysWithRecord.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  if (streak >= 2) {
    moments.push({
      id: 'streak',
      icon: 'flame',
      title: `${streak}일 연속 기록 중!`,
      sub: '기록이 습관이 되고 있어요',
    });
  }

  return moments;
}
