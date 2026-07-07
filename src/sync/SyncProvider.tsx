import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { useSession } from '@/features/auth/AuthProvider';
import { nowISO } from '@/lib/dates';

import { syncNow } from './engine';

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
    if (userId) void sync();
  }, [userId, sync]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && userId) void sync();
    });
    return () => sub.remove();
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
