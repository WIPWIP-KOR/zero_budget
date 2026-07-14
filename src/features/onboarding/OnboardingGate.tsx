import { router, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';

import { isOnboardingComplete } from './storage';

/**
 * 첫 실행이면 온보딩으로 보낸다 (§3.1). DB/장부가 준비된 뒤(로그인 상태와 무관하게)
 * 딱 한 번만 검사한다 — 이후 온보딩을 마치고 돌아오면 다시 검사하지 않는다.
 */
export function OnboardingGate() {
  const pathname = usePathname();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    (async () => {
      const done = await isOnboardingComplete();
      if (!done && pathname !== '/onboarding') {
        router.replace('/onboarding');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
