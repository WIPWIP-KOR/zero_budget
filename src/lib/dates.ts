/** ISO-8601 타임스탬프. 문자열 비교가 시간 순서와 일치해 LWW 동기화에 사용 */
export function nowISO(): string {
  return new Date().toISOString();
}

/** 로컬 기준 YYYY-MM-DD */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** YYYY-MM */
export function toMonthKey(date: Date): string {
  return toDateKey(date).slice(0, 7);
}

/** 해당 월의 [첫날, 마지막날] YYYY-MM-DD 쌍 */
export function monthRange(monthKey: string): [string, string] {
  const [y, m] = monthKey.split('-').map(Number);
  const last = new Date(y, m, 0).getDate();
  return [`${monthKey}-01`, `${monthKey}-${String(last).padStart(2, '0')}`];
}

/** monthKey에서 delta개월 이동한 YYYY-MM */
export function addMonths(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return toMonthKey(d);
}

/** '2026-07' → '2026년 7월' */
export function formatMonth(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  return `${y}년 ${m}월`;
}

/** '2026-07-06' → '7월 6일 (월)' */
export function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  return `${m}월 ${d}일 (${weekdays[date.getDay()]})`;
}
