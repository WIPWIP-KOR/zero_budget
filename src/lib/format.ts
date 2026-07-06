/** 12345678 → '12,345,678' */
export function formatAmount(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const digits = Math.abs(Math.trunc(amount)).toString();
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** 12345678 → '12,345,678원' */
export function formatKRW(amount: number): string {
  return `${formatAmount(amount)}원`;
}

/** 수입은 +, 지출은 - 부호를 붙인 표시 문자열 */
export function formatSigned(amount: number, type: 'income' | 'expense' | 'transfer'): string {
  if (type === 'income') return `+${formatKRW(amount)}`;
  if (type === 'expense') return `-${formatKRW(amount)}`;
  return formatKRW(amount);
}
