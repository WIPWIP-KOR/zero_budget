import { router } from 'expo-router';

import { AccountForm } from '@/features/accounts/AccountForm';
import { createAccount, type AccountInput } from '@/features/accounts/queries';

export default function NewAccountScreen() {
  const handleSubmit = async (input: AccountInput) => {
    await createAccount(input);
    router.back();
  };

  return <AccountForm onSubmit={handleSubmit} />;
}
