import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  href?: Href;
  note?: string;
}

const MENU: MenuItem[] = [
  { icon: 'wallet', label: '자산 관리', href: '/accounts' },
  { icon: 'pricetags', label: '카테고리 관리', note: '준비 중' },
  { icon: 'person-circle', label: '계정 · 동기화', note: '준비 중' },
  { icon: 'people', label: '부부 가계부 초대', note: '준비 중' },
];

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {MENU.map((item) => {
          const row = (
            <View style={styles.row}>
              <Ionicons name={item.icon} size={20} color={colors.primary} />
              <Text style={styles.label}>{item.label}</Text>
              {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
              {item.href ? (
                <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
              ) : null}
            </View>
          );
          return item.href ? (
            <Link key={item.label} href={item.href} asChild>
              <Pressable>{row}</Pressable>
            </Link>
          ) : (
            <View key={item.label} style={styles.disabled}>
              {row}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  label: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  note: {
    color: colors.textFaint,
    fontSize: 12,
  },
  disabled: {
    opacity: 0.55,
  },
});
