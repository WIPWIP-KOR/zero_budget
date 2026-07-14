import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Chip } from '@/components/Chip';
import { DatePickerModal } from '@/components/DatePickerModal';
import type { Frequency, RecurringRule, RecurringType } from '@/db/schema';
import { accountsQuery } from '@/features/accounts/queries';
import { categoriesQuery } from '@/features/categories/queries';
import { formatAmount } from '@/lib/format';
import { formatDateLabel, toDateKey } from '@/lib/dates';
import { colors, radius, spacing } from '@/theme';

import type { RecurringRuleInput } from './queries';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

interface RecurringRuleFormProps {
  initial?: RecurringRule;
  onSubmit: (input: RecurringRuleInput) => void;
  onDelete?: () => void;
}

export function RecurringRuleForm({ initial, onSubmit, onDelete }: RecurringRuleFormProps) {
  const [type, setType] = useState<RecurringType>(
    initial?.type === 'income' ? 'income' : 'expense',
  );
  const [amountDigits, setAmountDigits] = useState(initial ? String(initial.amount) : '');
  const [categoryId, setCategoryId] = useState<string | null>(initial?.categoryId ?? null);
  const [accountId, setAccountId] = useState<string | null>(initial?.accountId ?? null);
  const [memo, setMemo] = useState(initial?.memo ?? '');
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? 'monthly');
  const [dayOfMonth, setDayOfMonth] = useState(initial?.dayOfMonth ?? 1);
  const [weekday, setWeekday] = useState(initial?.weekday ?? 0);
  const [startOn, setStartOn] = useState(initial?.startOn ?? toDateKey(new Date()));
  const [endOn, setEndOn] = useState<string | null>(initial?.endOn ?? null);
  const [startModal, setStartModal] = useState(false);
  const [endModal, setEndModal] = useState(false);

  const { data: allCategories } = useLiveQuery(categoriesQuery());
  const { data: allAccounts } = useLiveQuery(accountsQuery());

  const typeCategories = useMemo(
    () => (allCategories ?? []).filter((c) => c.type === type),
    [allCategories, type],
  );

  const amount = amountDigits ? parseInt(amountDigits, 10) : 0;

  const handleSave = () => {
    if (amount <= 0) {
      Alert.alert('금액을 입력해주세요');
      return;
    }
    if (!categoryId) {
      Alert.alert('카테고리를 선택해주세요');
      return;
    }
    onSubmit({
      type,
      amount,
      categoryId,
      accountId,
      memo: memo || null,
      frequency,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : null,
      weekday: frequency === 'weekly' ? weekday : null,
      startOn,
      endOn,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.typeRow}>
        {(['expense', 'income'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => {
              setType(t);
              setCategoryId(null);
            }}
            style={[
              styles.typeButton,
              type === t && { backgroundColor: t === 'expense' ? colors.expense : colors.income },
            ]}
          >
            <Text style={[styles.typeLabel, type === t && styles.typeLabelActive]}>
              {t === 'expense' ? '지출' : '수입'}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>금액</Text>
      <View style={styles.amountRow}>
        <TextInput
          style={styles.amountInput}
          value={amountDigits ? formatAmount(amount) : ''}
          onChangeText={(text) => setAmountDigits(text.replace(/\D/g, ''))}
          placeholder="0"
          placeholderTextColor={colors.textFaint}
          keyboardType="number-pad"
        />
        <Text style={styles.won}>원</Text>
      </View>

      <Text style={styles.sectionLabel}>카테고리</Text>
      <View style={styles.chipWrap}>
        {typeCategories.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            icon={c.icon}
            color={c.color}
            selected={categoryId === c.id}
            onPress={() => setCategoryId(c.id)}
          />
        ))}
      </View>

      <Text style={styles.sectionLabel}>자산</Text>
      <View style={styles.chipWrap}>
        {(allAccounts ?? []).map((a) => (
          <Chip
            key={a.id}
            label={a.name}
            color={a.color}
            selected={accountId === a.id}
            onPress={() => setAccountId(accountId === a.id ? null : a.id)}
          />
        ))}
      </View>

      <Text style={styles.sectionLabel}>메모</Text>
      <TextInput
        style={styles.memoInput}
        value={memo}
        onChangeText={setMemo}
        placeholder="메모 (선택)"
        placeholderTextColor={colors.textFaint}
      />

      <Text style={styles.sectionLabel}>반복 주기</Text>
      <View style={styles.chipWrap}>
        <Chip label="매월" selected={frequency === 'monthly'} onPress={() => setFrequency('monthly')} />
        <Chip label="매주" selected={frequency === 'weekly'} onPress={() => setFrequency('weekly')} />
      </View>

      {frequency === 'monthly' ? (
        <>
          <Text style={styles.sectionLabel}>매월 며칠</Text>
          <View style={styles.chipWrap}>
            {[1, 5, 10, 15, 20, 25, 31].map((d) => (
              <Chip
                key={d}
                label={d === 31 ? '말일' : `${d}일`}
                selected={dayOfMonth === d}
                onPress={() => setDayOfMonth(d)}
              />
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.sectionLabel}>매주 무슨 요일</Text>
          <View style={styles.chipWrap}>
            {WEEKDAY_LABELS.map((label, i) => (
              <Chip key={i} label={label} selected={weekday === i} onPress={() => setWeekday(i)} />
            ))}
          </View>
        </>
      )}

      <Text style={styles.sectionLabel}>시작일</Text>
      <Pressable style={styles.dateRow} onPress={() => setStartModal(true)}>
        <Text style={styles.dateValue}>{formatDateLabel(startOn)}</Text>
      </Pressable>
      <DatePickerModal
        visible={startModal}
        value={startOn}
        onChange={setStartOn}
        onClose={() => setStartModal(false)}
      />

      <View style={styles.endRow}>
        <Text style={styles.sectionLabel}>종료일 없음 (무기한)</Text>
        <Switch
          value={endOn === null}
          onValueChange={(v) => setEndOn(v ? null : toDateKey(new Date()))}
        />
      </View>
      {endOn !== null ? (
        <>
          <Pressable style={styles.dateRow} onPress={() => setEndModal(true)}>
            <Text style={styles.dateValue}>{formatDateLabel(endOn)}</Text>
          </Pressable>
          <DatePickerModal
            visible={endModal}
            value={endOn}
            onChange={setEndOn}
            onClose={() => setEndModal(false)}
          />
        </>
      ) : null}

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveLabel}>{initial ? '수정' : '추가'}</Text>
      </Pressable>

      {onDelete ? (
        <Pressable
          style={styles.deleteButton}
          onPress={() =>
            Alert.alert('반복 거래 삭제', '이 반복 규칙을 삭제할까요? 이미 생성된 거래는 유지돼요.', [
              { text: '취소', style: 'cancel' },
              { text: '삭제', style: 'destructive', onPress: onDelete },
            ])
          }
        >
          <Text style={styles.deleteLabel}>삭제</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
  },
  typeLabel: {
    color: colors.textSub,
    fontWeight: '600',
  },
  typeLabelActive: {
    color: '#fff',
  },
  sectionLabel: {
    color: colors.textSub,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  amountInput: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    padding: 0,
    minWidth: 80,
  },
  won: {
    fontSize: 18,
    color: colors.textSub,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  memoInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    color: colors.text,
  },
  dateRow: {
    paddingVertical: spacing.sm,
  },
  dateValue: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  endRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  saveButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 14,
  },
  saveLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteLabel: {
    color: colors.danger,
    fontWeight: '600',
  },
});
