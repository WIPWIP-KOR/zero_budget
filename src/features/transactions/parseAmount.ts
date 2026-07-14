/**
 * 캡처 코멘트에서 화폐 단위(금액)를 파싱한다. §3.2 — 코멘트에는 금액이 반드시 포함되어야 하며,
 * 별도 입력 필드 없이 텍스트에서 추출한다. 예: "스벅 4,500원" → 4500.
 * 매칭되는 금액이 없으면 null (정리 단계에서 보완 입력하도록 폴백).
 */
export function parseAmountFromComment(comment: string): number | null {
  const match = comment.match(/([\d,]*\d)\s*원/);
  if (!match) return null;
  const digits = match[1].replace(/,/g, '');
  const amount = parseInt(digits, 10);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}
