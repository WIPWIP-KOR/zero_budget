import { router } from 'expo-router';

import { RecurringRuleForm } from '@/features/recurring/RecurringRuleForm';
import { createRecurringRule, type RecurringRuleInput } from '@/features/recurring/queries';

export default function NewRecurringRuleScreen() {
  const handleSubmit = async (input: RecurringRuleInput) => {
    await createRecurringRule(input);
    router.back();
  };

  return <RecurringRuleForm onSubmit={handleSubmit} />;
}
