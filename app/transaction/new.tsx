import { router } from 'expo-router';

import { TransactionForm } from '@/features/transactions/TransactionForm';
import { createTransaction, type TransactionInput } from '@/features/transactions/queries';

export default function NewTransactionScreen() {
  const handleSubmit = async (input: TransactionInput) => {
    await createTransaction(input);
    router.back();
  };

  return <TransactionForm onSubmit={handleSubmit} />;
}
