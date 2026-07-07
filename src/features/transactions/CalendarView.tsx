import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

import { formatAmount } from '@/lib/format';
import { formatDateLabel, toDateKey } from '@/lib/dates';
import { colors, spacing } from '@/theme';

import type { TransactionWithRefs } from './group';
import { TransactionListItem } from './TransactionListItem';

LocaleConfig.locales.ko = {
  monthNames: Array.from({ length: 12 }, (_, i) => `${i + 1}월`),
  monthNamesShort: Array.from({ length: 12 }, (_, i) => `${i + 1}월`),
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

interface DayTotals {
  income: number;
  expense: number;
}

interface CalendarViewProps {
  month: string; // YYYY-MM
  rows: TransactionWithRefs[];
}

export function CalendarView({ month, rows }: CalendarViewProps) {
  const todayKey = toDateKey(new Date());
  const [selected, setSelected] = useState<string | null>(
    todayKey.startsWith(month) ? todayKey : null,
  );

  const dayTotals = useMemo(() => {
    const totals = new Map<string, DayTotals>();
    for (const row of rows) {
      const key = row.tx.occurredOn;
      const t = totals.get(key) ?? { income: 0, expense: 0 };
      if (row.tx.type === 'income') t.income += row.tx.amount;
      else if (row.tx.type === 'expense') t.expense += row.tx.amount;
      totals.set(key, t);
    }
    return totals;
  }, [rows]);

  const selectedRows = useMemo(
    () => (selected ? rows.filter((r) => r.tx.occurredOn === selected) : []),
    [rows, selected],
  );

  return (
    <View style={styles.container}>
      <Calendar
        key={month}
        current={`${month}-01`}
        hideArrows
        disableMonthChange
        hideExtraDays
        renderHeader={() => null}
        style={styles.calendar}
        theme={{ todayTextColor: colors.primary }}
        dayComponent={({ date }) => {
          if (!date) return <View style={styles.dayCell} />;
          const key = date.dateString;
          const totals = dayTotals.get(key);
          const isSelected = selected === key;
          const isToday = key === todayKey;
          return (
            <Pressable
              style={[styles.dayCell, isSelected && styles.dayCellSelected]}
              onPress={() => setSelected(key)}
            >
              <Text
                style={[
                  styles.dayNumber,
                  isToday && { color: colors.primary, fontWeight: '700' },
                ]}
              >
                {date.day}
              </Text>
              {totals?.income ? (
                <Text style={[styles.dayAmount, { color: colors.income }]} numberOfLines={1}>
                  +{formatAmount(totals.income)}
                </Text>
              ) : null}
              {totals?.expense ? (
                <Text style={[styles.dayAmount, { color: colors.expense }]} numberOfLines={1}>
                  -{formatAmount(totals.expense)}
                </Text>
              ) : null}
            </Pressable>
          );
        }}
      />
      <FlatList
        data={selectedRows}
        keyExtractor={(row) => row.tx.id}
        renderItem={({ item }) => <TransactionListItem row={item} />}
        ListHeaderComponent={
          selected ? (
            <Text style={styles.selectedHeader}>{formatDateLabel(selected)}</Text>
          ) : null
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {selected ? '이 날의 거래가 없어요' : '날짜를 선택해보세요'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendar: {
    backgroundColor: colors.card,
    paddingBottom: spacing.sm,
  },
  dayCell: {
    width: '100%',
    minHeight: 52,
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: `${colors.primary}18`,
  },
  dayNumber: {
    fontSize: 13,
    color: colors.text,
  },
  dayAmount: {
    fontSize: 9,
    fontWeight: '600',
  },
  selectedHeader: {
    color: colors.textSub,
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  empty: {
    color: colors.textFaint,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
