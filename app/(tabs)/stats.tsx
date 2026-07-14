import { Ionicons } from '@expo/vector-icons';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { PieChart } from 'react-native-gifted-charts';

import { LedgerSwitcher } from '@/components/LedgerSwitcher';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { useCurrentLedger } from '@/features/ledgers/CurrentLedgerContext';
import { categoryBreakdown, monthlySeries } from '@/features/stats/aggregate';
import { rangeTransactionsQuery } from '@/features/stats/queries';
import { sumMonth } from '@/features/transactions/group';
import { monthTransactionsQuery } from '@/features/transactions/queries';
import { addMonths, toMonthKey } from '@/lib/dates';
import { formatKRW } from '@/lib/format';
import { colors, radius, spacing } from '@/theme';

const TREND_MONTHS = 6;

export default function StatsScreen() {
  const [month, setMonth] = useState(() => toMonthKey(new Date()));
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const { currentLedgerId } = useCurrentLedger();

  const trendStart = addMonths(month, -(TREND_MONTHS - 1));
  const { data: monthRows } = useLiveQuery(monthTransactionsQuery(month), [month, currentLedgerId]);
  const { data: rangeRows } = useLiveQuery(rangeTransactionsQuery(trendStart, month), [
    month,
    currentLedgerId,
  ]);

  const totals = useMemo(() => sumMonth((monthRows ?? []).map((r) => r.tx)), [monthRows]);
  const breakdown = useMemo(
    () => categoryBreakdown(monthRows ?? [], type),
    [monthRows, type],
  );
  const trend = useMemo(() => {
    const months = Array.from({ length: TREND_MONTHS }, (_, i) =>
      addMonths(month, i - (TREND_MONTHS - 1)),
    );
    return monthlySeries(rangeRows ?? [], months);
  }, [rangeRows, month]);

  const pieData = breakdown.map((item) => ({
    value: item.total,
    color: item.color,
  }));

  const barData = trend.flatMap((point) => [
    {
      value: point.income / 10000,
      frontColor: colors.income,
      spacing: 2,
      label: `${Number(point.month.slice(5))}월`,
      labelWidth: 40,
    },
    { value: point.expense / 10000, frontColor: colors.expense, spacing: 14, label: '' },
  ]);

  const typeTotal = type === 'expense' ? totals.expense : totals.income;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LedgerSwitcher />
      <MonthSwitcher month={month} onChange={setMonth} />

      <View style={styles.summaryCard}>
        <SummaryItem label="수입" value={totals.income} color={colors.income} />
        <SummaryItem label="지출" value={totals.expense} color={colors.expense} />
        <SummaryItem
          label="합계"
          value={totals.net}
          color={totals.net >= 0 ? colors.text : colors.expense}
        />
      </View>

      <View style={styles.segmentRow}>
        {(['expense', 'income'] as const).map((t) => (
          <Pressable
            key={t}
            testID={`segment-${t}`}
            onPress={() => setType(t)}
            style={[styles.segment, type === t && styles.segmentActive]}
          >
            <Text style={[styles.segmentLabel, type === t && styles.segmentLabelActive]}>
              {t === 'expense' ? '지출' : '수입'}
            </Text>
          </Pressable>
        ))}
      </View>

      {breakdown.length > 0 ? (
        <View style={styles.card}>
          <View style={styles.donutWrap}>
            <PieChart
              donut
              data={pieData}
              radius={90}
              innerRadius={58}
              strokeWidth={2}
              strokeColor={colors.card}
              innerCircleColor={colors.card}
              centerLabelComponent={() => (
                <View style={styles.donutCenter}>
                  <Text style={styles.donutCenterLabel}>
                    {type === 'expense' ? '총 지출' : '총 수입'}
                  </Text>
                  <Text style={styles.donutCenterValue}>{formatKRW(typeTotal)}</Text>
                </View>
              )}
            />
          </View>
          {breakdown.map((item) => (
            <View key={item.categoryId ?? 'none'} style={styles.breakdownRow}>
              <View style={[styles.iconCircle, { backgroundColor: `${item.color}22` }]}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color={item.color}
                />
              </View>
              <Text style={styles.breakdownName}>{item.name}</Text>
              <Text style={styles.breakdownRatio}>{Math.round(item.ratio * 100)}%</Text>
              <Text style={styles.breakdownAmount}>{formatKRW(item.total)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.empty}>
            {type === 'expense' ? '이 달의 지출이 없어요' : '이 달의 수입이 없어요'}
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>최근 {TREND_MONTHS}개월 추이</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
          <Text style={styles.legendLabel}>수입</Text>
          <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
          <Text style={styles.legendLabel}>지출</Text>
        </View>
        <BarChart
          data={barData}
          barWidth={12}
          barBorderTopLeftRadius={4}
          barBorderTopRightRadius={4}
          noOfSections={4}
          yAxisLabelSuffix="만"
          yAxisTextStyle={styles.axisText}
          xAxisLabelTextStyle={styles.axisText}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor={colors.border}
          rulesColor={colors.border}
          disableScroll
          height={160}
        />
      </View>
    </ScrollView>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>{formatKRW(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    color: colors.textSub,
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  segmentRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.border,
    borderRadius: radius.sm,
    padding: 2,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: radius.sm - 2,
  },
  segmentActive: {
    backgroundColor: colors.card,
  },
  segmentLabel: {
    color: colors.textSub,
    fontSize: 13,
    fontWeight: '600',
  },
  segmentLabelActive: {
    color: colors.text,
  },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  donutWrap: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  donutCenter: {
    alignItems: 'center',
  },
  donutCenterLabel: {
    color: colors.textSub,
    fontSize: 11,
  },
  donutCenterValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 8,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownName: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  breakdownRatio: {
    color: colors.textFaint,
    fontSize: 12,
    width: 40,
    textAlign: 'right',
  },
  breakdownAmount: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    minWidth: 90,
    textAlign: 'right',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  legendLabel: {
    color: colors.textSub,
    fontSize: 12,
  },
  axisText: {
    color: colors.textFaint,
    fontSize: 10,
  },
  empty: {
    color: colors.textFaint,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
