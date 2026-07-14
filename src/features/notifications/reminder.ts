import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDER_IDENTIFIER = 'evening-reminder';
const ANDROID_CHANNEL_ID = 'reminders';

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
  if (Platform.OS === 'android') {
    // Android 8+는 채널이 있어야 알림이 실제로 표시된다
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: '저녁 리마인더',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

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
      channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
    },
  });
}

export async function cancelEveningReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER).catch(() => {});
}

export async function isEveningReminderScheduled(): Promise<boolean> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.some((n) => n.identifier === REMINDER_IDENTIFIER);
}
