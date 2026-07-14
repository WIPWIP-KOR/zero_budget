import { router } from 'expo-router';

import { CategoryForm } from '@/features/categories/CategoryForm';
import { createCategory, type CategoryInput } from '@/features/categories/queries';

export default function NewCategoryScreen() {
  const handleSubmit = async (input: CategoryInput) => {
    await createCategory(input);
    router.back();
  };

  return <CategoryForm onSubmit={handleSubmit} />;
}
