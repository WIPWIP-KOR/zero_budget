import * as Crypto from 'expo-crypto';

/** 오프라인에서도 충돌 없는 uuid v4 생성 */
export function newId(): string {
  return Crypto.randomUUID();
}

/** SHA-256 hex 다이제스트 앞 32자를 8-4-4-4-12로 잘라 uuid 형식 문자열을 만든다 */
export function formatHexAsUuid(hex: string): string {
  const h = hex.slice(0, 32).padEnd(32, '0');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

/**
 * 같은 입력이면 항상 같은 uuid 형태의 id를 만든다. recurring_rules가 생성하는 거래처럼,
 * 부부 양쪽 기기가 동시에 같은 항목을 만들어도 같은 id로 upsert되어 자연 dedup되게 하는 용도.
 * RFC4122 v5는 아니지만 Postgres uuid 컬럼이 요구하는 8-4-4-4-12 형식은 만족한다.
 */
export async function deterministicId(...parts: string[]): Promise<string> {
  const hex = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    parts.join('|'),
  );
  return formatHexAsUuid(hex);
}
