import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import { REMINDER_DEEP_LINK_TARGET } from './reminder';

/** 저녁 리마인더 알림을 탭하면 수집함으로 이동한다 (§11.2) */
export function NotificationDeepLinkHandler() {
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    const target = response?.notification.request.content.data?.target;
    if (target === REMINDER_DEEP_LINK_TARGET) {
      router.push('/inbox');
    }
  }, [response]);

  return null;
}
