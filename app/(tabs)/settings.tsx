import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>카테고리/자산 관리와 계정 설정이 여기에 표시됩니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  placeholder: {
    color: colors.textSub,
  },
});
