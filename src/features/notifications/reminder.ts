import * as Notifications from 'expo-notifications';

const REMINDER_IDENTIFIER = 'evening-reminder';

/** 캡처/정리로 이어지는 딥링크 데이터 — 알림 탭 시 이 값을 보고 라우팅한다 (§11.2) */
export const REMINDER_DEEP_LINK_TARGET = 'inbox';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

/** 저녁 리마인더를 매일 같은 시각에 반복 알림으로 예약한다. 기존 예약은 갈아끼운다 */
export async function scheduleEveningReminder(hour = 21, minute = 0): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_IDENTIFIER,
    content: {
      title: '오늘 하루 정리해볼까요?',
      body: '수집함에 쌓인 기록을 한 번에 정리해요',
      data: { target: REMINDER_DEEP_LINK_TARGET },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelEveningReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER).catch(() => {});
}
