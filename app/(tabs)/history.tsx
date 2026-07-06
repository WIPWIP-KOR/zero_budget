import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>거래 내역(리스트/캘린더)이 여기에 표시됩니다.</Text>
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
