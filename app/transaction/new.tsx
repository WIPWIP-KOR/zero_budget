import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

export default function NewTransactionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>거래 입력 폼이 여기에 표시됩니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  placeholder: {
    color: colors.textSub,
  },
});
