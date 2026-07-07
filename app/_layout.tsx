import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DatabaseProvider } from '@/db/DatabaseProvider';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <DatabaseProvider>
          <StatusBar style="dark" />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="transaction/new"
              options={{ presentation: 'modal', title: '거래 입력' }}
            />
            <Stack.Screen name="transaction/[id]" options={{ title: '거래 상세' }} />
            <Stack.Screen
              name="goal/edit"
              options={{ presentation: 'modal', title: '이번 달 목표' }}
            />
            <Stack.Screen name="accounts/index" options={{ title: '자산 관리' }} />
            <Stack.Screen
              name="accounts/new"
              options={{ presentation: 'modal', title: '자산 추가' }}
            />
            <Stack.Screen name="accounts/[id]" options={{ title: '자산 수정' }} />
          </Stack>
        </DatabaseProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
