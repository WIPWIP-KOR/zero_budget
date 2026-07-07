/**
 * Last-write-wins 판정.
 * 로컬이 dirty(아직 push 안 됨)이고 로컬이 더 최신이면 로컬을 지킨다 —
 * 로컬 변경은 다음 push에서 서버로 올라간다. 그 외에는 서버 값을 적용.
 */
export function shouldApplyRemote(
  localUpdatedAt: string,
  localDirty: number,
  remoteUpdatedAt: string,
): boolean {
  if (localDirty !== 1) return true;
  return Date.parse(remoteUpdatedAt) > Date.parse(localUpdatedAt);
}
