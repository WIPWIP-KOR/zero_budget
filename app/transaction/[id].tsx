import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { TransactionForm } from '@/features/transactions/TransactionForm';
import {
  deleteTransaction,
  transactionQuery,
  updateTransaction,
  type TransactionInput,
} from '@/features/transactions/queries';
import { colors } from '@/theme';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useLiveQuery(transactionQuery(id), [id]);
  const tx = data?.[0];

  if (!tx) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const handleSubmit = async (input: TransactionInput) => {
    await updateTransaction(tx.id, input);
    router.back();
  };

  const handleDelete = async () => {
    await deleteTransaction(tx.id);
    router.back();
  };

  return <TransactionForm initial={tx} onSubmit={handleSubmit} onDelete={handleDelete} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
});
