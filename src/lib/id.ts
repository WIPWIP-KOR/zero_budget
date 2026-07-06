import * as Crypto from 'expo-crypto';

/** 오프라인에서도 충돌 없는 uuid v4 생성 */
export function newId(): string {
  return Crypto.randomUUID();
}
