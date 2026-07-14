import { Ionicons } from '@expo/vector-icons';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useCurrentLedger } from '@/features/ledgers/CurrentLedgerContext';
import { createLedger, ledgersQuery } from '@/features/ledgers/queries';
import { colors, radius, spacing } from '@/theme';

const KIND_LABEL: Record<string, string> = {
  main: '부부',
  party: '파티',
  personal: '개인',
};

/** 내역/통계 탭 상단 — 현재 장부 표시 + 전환/개인 장부 생성 (§3.3c, §4) */
export function LedgerSwitcher() {
  const { currentLedgerId, switchLedger } = useCurrentLedger();
  const { data } = useLiveQuery(ledgersQuery());
  const ledgers = data ?? [];
  const current = ledgers.find((l) => l.id === currentLedgerId);

  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreatePersonal = async () => {
    const name = newName.trim();
    if (!name) return;
    const id = await createLedger(name, 'personal');
    setNewName('');
    setCreating(false);
    setOpen(false);
    await switchLedger(id);
  };

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)} testID="ledger-switcher">
        <Text style={styles.triggerLabel} numberOfLines={1}>
          {current?.name ?? '내 가계부'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textSub} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>장부 전환</Text>
            {ledgers.map((l) => (
              <Pressable
                key={l.id}
                style={styles.ledgerRow}
                onPress={async () => {
                  await switchLedger(l.id);
                  setOpen(false);
                }}
              >
                <View style={styles.ledgerRowMain}>
                  <Text style={styles.ledgerName}>{l.name}</Text>
                  <Text style={styles.ledgerKind}>{KIND_LABEL[l.kind] ?? l.kind}</Text>
                </View>
                {l.id === currentLedgerId ? (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
                ) : null}
              </Pressable>
            ))}

            {creating ? (
              <View style={styles.createRow}>
                <TextInput
                  style={styles.createInput}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="장부 이름 (예: 사업, 여행 적립)"
                  placeholderTextColor={colors.textFaint}
                  autoFocus
                  onSubmitEditing={handleCreatePersonal}
                />
                <Pressable onPress={handleCreatePersonal} hitSlop={8}>
                  <Ionicons name="checkmark-circle" size={26} color={colors.primary} />
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.addRow} onPress={() => setCreating(true)}>
                <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                <Text style={styles.addLabel}>개인 장부 만들기 (무료)</Text>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    maxWidth: 220,
  },
  triggerLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  sheetTitle: {
    color: colors.textSub,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ledgerRowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ledgerName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  ledgerKind: {
    color: colors.textFaint,
    fontSize: 11,
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  addLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  createInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    color: colors.text,
  },
});
