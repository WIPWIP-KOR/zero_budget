import { toDateKey } from '@/lib/dates';

export interface RecurrenceRule {
  frequency: 'monthly' | 'weekly';
  dayOfMonth: number | null;
  weekday: number | null;
  startOn: string; // YYYY-MM-DD
  endOn: string | null; // YYYY-MM-DD, null = 무기한
}

/** startOn부터 min(today, endOn)까지, 이 규칙이 발생하는 모든 날짜(YYYY-MM-DD)를 오름차순으로 돌려준다 */
export function dueOccurrences(rule: RecurrenceRule, today: string): string[] {
  const end = rule.endOn && rule.endOn < today ? rule.endOn : today;
  if (rule.startOn > end) return [];

  if (rule.frequency === 'monthly') {
    return monthlyOccurrences(rule.startOn, end, rule.dayOfMonth ?? 1);
  }
  return weeklyOccurrences(rule.startOn, end, rule.weekday ?? 0);
}

function monthlyOccurrences(startOn: string, end: string, dayOfMonth: number): string[] {
  const [sy, sm] = startOn.split('-').map(Number);
  const [ey, em] = end.split('-').map(Number);
  const dates: string[] = [];

  let y = sy;
  let m = sm;
  while (y < ey || (y === ey && m <= em)) {
    const lastDay = new Date(y, m, 0).getDate();
    const day = Math.min(dayOfMonth, lastDay);
    const dateKey = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (dateKey >= startOn && dateKey <= end) dates.push(dateKey);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return dates;
}

function weeklyOccurrences(startOn: string, end: string, weekday: number): string[] {
  const [sy, sm, sd] = startOn.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const endDate = new Date(ey, em - 1, ed);

  const cur = new Date(sy, sm - 1, sd);
  while (cur.getDay() !== weekday) cur.setDate(cur.getDate() + 1);

  const dates: string[] = [];
  while (cur.getTime() <= endDate.getTime()) {
    dates.push(toDateKey(cur));
    cur.setDate(cur.getDate() + 7);
  }
  return dates;
}
