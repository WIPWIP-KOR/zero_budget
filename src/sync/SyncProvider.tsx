import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { router } from 'expo-router';
import { addDatabaseChangeListener } from 'expo-sqlite';
import { AppState } from 'react-native';

import { useSession } from '@/features/auth/AuthProvider';
import { getCurrentLedgerId } from '@/features/ledgers/current';
import { findLoginMergeCandidate } from '@/features/ledgers/merge';
import { generateDueTransactions } from '@/features/recurring/generate';
import { nowISO } from '@/lib/dates';

import { syncNow } from './engine';

/** §6.2 — 마지막 쓰기 3~5초 후 자동 push (지금까지는 포그라운드/수동 트리거뿐이었다) */
const WRITE_DEBOUNCE_MS = 4000;

interface SyncContextValue {
  syncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
  /** 수동 동기화 트리거 */
  sync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue>({
  syncing: false,
  lastSyncedAt: null,
  error: null,
  sync: async () => {},
});

/** 로그인 시 + 포그라운드 복귀 시 자동 동기화. DatabaseProvider 안쪽에서 사용할 것. */
export function SyncProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);

  const sync = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setSyncing(true);
    setError(null);
    try {
      const result = await syncNow();
      if (!result.skipped) setLastSyncedAt(nowISO());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      setSyncing(false);
    }
  }, []);

  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;
    // 로그인 전 장부를 먼저 기록해둬야, sync로 서버 장부가 내려온 뒤 "재로그인/새 기기" 병합
    // 후보(§5.3)를 판단할 수 있다.
    const preLoginLedgerId = getCurrentLedgerId();
    void sync().then(async () => {
      const candidate = await findLoginMergeCandidate(preLoginLedgerId);
      if (candidate) {
        router.push({
          pathname: '/merge-wizard',
          params: { source: candidate.source, target: candidate.target },
        });
      }
    });
  }, [userId, sync]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && userId) void sync();
    });
    return () => sub.remove();
  }, [userId, sync]);

  // 반복/고정 거래 생성 — 로그인 여부와 무관하게 앱 실행/포그라운드 복귀 시마다
  useEffect(() => {
    void generateDueTransactions();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void generateDueTransactions();
    });
    return () => sub.remove();
  }, []);

  // 쓰기 후 debounce push (§6.2) — pull이 sync_state/원격 반영으로 다시 이벤트를 일으켜도
  // dirty 행이 없으면 다음 push는 그냥 아무것도 안 보내니 무해하다.
  useEffect(() => {
    if (!userId) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const sub = addDatabaseChangeListener(({ tableName }) => {
      if (tableName === 'sync_state') return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void sync(), WRITE_DEBOUNCE_MS);
    });
    return () => {
      if (timer) clearTimeout(timer);
      sub.remove();
    };
  }, [userId, sync]);

  return (
    <SyncContext.Provider value={{ syncing, lastSyncedAt, error, sync }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync(): SyncContextValue {
  return useContext(SyncContext);
}
