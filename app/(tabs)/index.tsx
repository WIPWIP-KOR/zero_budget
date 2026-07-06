import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>이번 달 요약이 여기에 표시됩니다.</Text>
      <Link href="/transaction/new" style={styles.addLink}>
        + 거래 입력
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    gap: spacing.md,
  },
  placeholder: {
    color: colors.textSub,
  },
  addLink: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});
