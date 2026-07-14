import { createContext, useContext, useState, type ReactNode } from 'react';

import { getCurrentLedgerId, setCurrentLedgerId } from './current';

interface CurrentLedgerContextValue {
  currentLedgerId: string;
  switchLedger: (id: string) => Promise<void>;
}

const CurrentLedgerContext = createContext<CurrentLedgerContextValue | null>(null);

/**
 * getCurrentLedgerId()의 모듈 전역값을 React 상태로 미러링해, 장부 전환 시
 * useLiveQuery를 쓰는 화면들이 리렌더되게 한다. DatabaseProvider가 loadCurrentLedger를
 * 끝낸 뒤에만 마운트되므로 초기값 조회는 항상 안전하다.
 */
export function CurrentLedgerProvider({ children }: { children: ReactNode }) {
  const [currentLedgerId, setState] = useState(() => getCurrentLedgerId());

  const switchLedger = async (id: string) => {
    if (id === currentLedgerId) return;
    await setCurrentLedgerId(id);
    setState(id);
  };

  return (
    <CurrentLedgerContext.Provider value={{ currentLedgerId, switchLedger }}>
      {children}
    </CurrentLedgerContext.Provider>
  );
}

export function useCurrentLedger(): CurrentLedgerContextValue {
  const ctx = useContext(CurrentLedgerContext);
  if (!ctx) throw new Error('useCurrentLedger must be used within CurrentLedgerProvider');
  return ctx;
}
