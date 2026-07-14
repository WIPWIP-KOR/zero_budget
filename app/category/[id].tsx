import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CategoryForm } from '@/features/categories/CategoryForm';
import {
  categoryQuery,
  deleteCategory,
  updateCategory,
  type CategoryInput,
} from '@/features/categories/queries';
import { colors } from '@/theme';

export default function EditCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useLiveQuery(categoryQuery(id), [id]);
  const category = data?.[0];

  if (!category) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const handleSubmit = async (input: CategoryInput) => {
    await updateCategory(category.id, input);
    router.back();
  };

  const handleDelete = async () => {
    await deleteCategory(category.id);
    router.back();
  };

  return <CategoryForm initial={category} onSubmit={handleSubmit} onDelete={handleDelete} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
});
