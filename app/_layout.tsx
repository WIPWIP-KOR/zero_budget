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
          </Stack>
        </DatabaseProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
