import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AccountForm } from '@/features/accounts/AccountForm';
import {
  accountQuery,
  deleteAccount,
  updateAccount,
  type AccountInput,
} from '@/features/accounts/queries';
import { colors } from '@/theme';

export default function EditAccountScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useLiveQuery(accountQuery(id), [id]);
  const account = data?.[0];

  if (!account) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const handleSubmit = async (input: AccountInput) => {
    await updateAccount(account.id, input);
    router.back();
  };

  const handleDelete = async () => {
    await deleteAccount(account.id);
    router.back();
  };

  return <AccountForm initial={account} onSubmit={handleSubmit} onDelete={handleDelete} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
});
