import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { colors, radius, spacing } from '@/theme';

interface DatePickerModalProps {
  visible: boolean;
  value: string; // YYYY-MM-DD
  onChange: (dateKey: string) => void;
  onClose: () => void;
}

export function DatePickerModal({ visible, value, onChange, onClose }: DatePickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Calendar
            initialDate={value}
            markedDates={{ [value]: { selected: true, selectedColor: colors.primary } }}
            onDayPress={(day: DateData) => {
              onChange(day.dateString);
              onClose();
            }}
            theme={{
              todayTextColor: colors.primary,
              arrowColor: colors.primary,
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
});
