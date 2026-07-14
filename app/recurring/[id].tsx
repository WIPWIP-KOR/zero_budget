import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { RecurringRuleForm } from '@/features/recurring/RecurringRuleForm';
import {
  deleteRecurringRule,
  recurringRuleQuery,
  updateRecurringRule,
  type RecurringRuleInput,
} from '@/features/recurring/queries';
import { colors } from '@/theme';

export default function EditRecurringRuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useLiveQuery(recurringRuleQuery(id), [id]);
  const rule = data?.[0];

  if (!rule) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const handleSubmit = async (input: RecurringRuleInput) => {
    await updateRecurringRule(rule.id, input);
    router.back();
  };

  const handleDelete = async () => {
    await deleteRecurringRule(rule.id);
    router.back();
  };

  return <RecurringRuleForm initial={rule} onSubmit={handleSubmit} onDelete={handleDelete} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
});
