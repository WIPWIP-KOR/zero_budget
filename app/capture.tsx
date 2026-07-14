import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { createCaptureTransaction } from '@/features/transactions/queries';
import { parseAmountFromComment } from '@/features/transactions/parseAmount';
import { formatKRW } from '@/lib/format';
import { colors, radius, spacing } from '@/theme';

type Media = { uri: string; kind: 'photo' | 'video' };

export default function CaptureScreen() {
  const [comment, setComment] = useState('');
  const [media, setMedia] = useState<Media | null>(null);
  const [saving, setSaving] = useState(false);

  const parsedAmount = useMemo(() => parseAmountFromComment(comment), [comment]);
  const canSave = comment.trim().length > 0 || media !== null;

  const capture = async (kind: 'photo' | 'video') => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('카메라 권한이 필요해요', '설정에서 카메라 접근을 허용해주세요.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: kind === 'photo' ? ['images'] : ['videos'],
      videoMaxDuration: kind === 'video' ? 15 : undefined,
      quality: 0.6,
    });
    if (result.canceled || result.assets.length === 0) return;
    setMedia({ uri: result.assets[0].uri, kind });
  };

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await createCaptureTransaction({
        comment: comment.trim(),
        photoUrl: media?.kind === 'photo' ? media.uri : null,
        videoUrl: media?.kind === 'video' ? media.uri : null,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>결제 직후, 3초만</Text>
      <Text style={styles.subtitle}>사진·영상·코멘트 중 뭐든 하나면 돼요. 정리는 나중에.</Text>

      {media ? (
        <View style={styles.mediaPreview}>
          {media.kind === 'photo' ? (
            <Image source={{ uri: media.uri }} style={styles.mediaImage} />
          ) : (
            <View style={[styles.mediaImage, styles.videoPlaceholder]}>
              <Ionicons name="videocam" size={28} color="#fff" />
            </View>
          )}
          <Pressable
            style={styles.removeMedia}
            hitSlop={8}
            onPress={() => setMedia(null)}
            testID="remove-media"
          >
            <Ionicons name="close-circle" size={24} color={colors.text} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.mediaRow}>
          <Pressable style={styles.mediaButton} onPress={() => capture('photo')} testID="capture-photo">
            <Ionicons name="camera" size={22} color={colors.primary} />
            <Text style={styles.mediaButtonLabel}>사진</Text>
          </Pressable>
          <Pressable style={styles.mediaButton} onPress={() => capture('video')} testID="capture-video">
            <Ionicons name="videocam" size={22} color={colors.primary} />
            <Text style={styles.mediaButtonLabel}>영상</Text>
          </Pressable>
        </View>
      )}

      <TextInput
        style={styles.commentInput}
        value={comment}
        onChangeText={setComment}
        placeholder="예: 스벅 4,500원"
        placeholderTextColor={colors.textFaint}
        multiline
        autoFocus={!media}
        testID="capture-comment"
      />
      {comment.trim().length > 0 ? (
        <Text style={parsedAmount ? styles.parseHint : styles.parseHintWarn}>
          {parsedAmount
            ? `${formatKRW(parsedAmount)}으로 기록돼요`
            : '금액을 못 찾았어요 — 정리할 때 채워주세요'}
        </Text>
      ) : null}

      <Pressable
        style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!canSave || saving}
        testID="capture-save"
      >
        <Text style={styles.saveLabel}>수집함에 담기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSub,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mediaButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  mediaButtonLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  mediaPreview: {
    alignSelf: 'flex-start',
  },
  mediaImage: {
    width: 120,
    height: 120,
    borderRadius: radius.md,
  },
  videoPlaceholder: {
    backgroundColor: colors.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeMedia: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  commentInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    color: colors.text,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  parseHint: {
    color: colors.income,
    fontSize: 13,
    fontWeight: '600',
  },
  parseHintWarn: {
    color: colors.textSub,
    fontSize: 13,
  },
  saveButton: {
    marginTop: 'auto',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 14,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
