import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { RegionPicker } from "@/components/RegionPicker";
import { Screen } from "@/components/Screen";
import { colors } from "@/constants/colors";
import { uploadPhoto } from "@/services/api";
import { confirm, notify } from "@/services/confirm";
import { pickImage } from "@/services/imagePicker";
import { useAppState } from "@/state/AppStateProvider";

const MAX_EXTRA = 5;

const INTRO_PROMPTS = [
  {
    key: "introOneLine" as const,
    label: "나를 한 문장으로 소개한다면?",
    placeholder: "예: 차분하지만 농담 좋아하는 디자이너예요",
    max: 200
  },
  {
    key: "valueImportant" as const,
    label: "연애에서 내가 가장 중요하게 생각하는 가치는 무엇인가요?",
    placeholder: "예: 서로의 일상을 존중하면서도 진솔하게 대화하는 것",
    max: 500
  },
  {
    key: "dreamRelationship" as const,
    label: "내가 꿈꾸는 연애의 모습은 어떤 모습인가요?",
    placeholder: "예: 평일엔 각자의 시간, 주말엔 함께 동네 산책",
    max: 500
  }
];

export default function ProfileEditScreen() {
  const { profile, authUser, saveProfile } = useAppState();
  const [nickname, setNickname] = useState(profile?.nickname ?? authUser?.nickname ?? "");
  const [region, setRegion] = useState(profile?.region || "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    profile?.pendingPhotoUrl ?? profile?.photoUrl ?? null
  );
  const [photoLocalUri, setPhotoLocalUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [introOneLine, setIntroOneLine] = useState(profile?.introOneLine ?? "");
  const [valueImportant, setValueImportant] = useState(profile?.valueImportant ?? "");
  const [dreamRelationship, setDreamRelationship] = useState(profile?.dreamRelationship ?? "");
  const [extraPhotos, setExtraPhotos] = useState<string[]>(profile?.extraPhotoUrls ?? []);
  const [extraBusyIndex, setExtraBusyIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const MIN_INTRO = 20;
  const intoLen = introOneLine.trim().length;
  const valLen = valueImportant.trim().length;
  const dreamLen = dreamRelationship.trim().length;
  const introsValid =
    (intoLen === 0 || intoLen >= MIN_INTRO) &&
    (valLen === 0 || valLen >= MIN_INTRO) &&
    (dreamLen === 0 || dreamLen >= MIN_INTRO);

  const canSave = !saving && !uploading && extraBusyIndex === null && introsValid;
  const previewUri = photoLocalUri ?? photoUrl;

  const pickPhoto = async () => {
    if (uploading) return;
    try {
      const picked = await pickImage();
      if (picked === null) return;
      setPhotoLocalUri(picked.uri);
      setUploading(true);
      const { url } = await uploadPhoto(picked);
      setPhotoUrl(url);
    } catch (err) {
      setPhotoLocalUri(null);
      notify("사진 업로드 실패", err instanceof Error ? err.message : "다시 시도해주세요");
    } finally {
      setUploading(false);
    }
  };

  const pickExtra = async (index: number) => {
    if (extraBusyIndex !== null) return;
    try {
      setExtraBusyIndex(index);
      const picked = await pickImage();
      if (picked === null) return;
      const { url } = await uploadPhoto(picked);
      setExtraPhotos((current) => {
        const next = [...current];
        next[index] = url;
        return next.filter((u): u is string => typeof u === "string" && u.length > 0);
      });
    } catch (err) {
      notify("업로드 실패", err instanceof Error ? err.message : "다시 시도해주세요");
    } finally {
      setExtraBusyIndex(null);
    }
  };

  const removeExtra = async (index: number) => {
    if (extraBusyIndex !== null) return;
    if (!(await confirm("사진 삭제", "이 사진을 삭제할까요?", "삭제", true))) return;
    setExtraPhotos((current) => current.filter((_, i) => i !== index));
  };

  const intros: Record<"introOneLine" | "valueImportant" | "dreamRelationship", { value: string; set: (v: string) => void }> = {
    introOneLine: { value: introOneLine, set: setIntroOneLine },
    valueImportant: { value: valueImportant, set: setValueImportant },
    dreamRelationship: { value: dreamRelationship, set: setDreamRelationship }
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await saveProfile({
        nickname: nickname.trim().length > 0 ? nickname.trim() : (profile?.nickname ?? authUser?.nickname ?? ""),
        gender: profile?.gender ?? null,
        ageRange: profile?.ageRange ?? "",
        birthYear: profile?.birthYear ?? null,
        region,
        bio: profile?.bio ?? "",
        introOneLine: introOneLine.trim(),
        valueImportant: valueImportant.trim(),
        dreamRelationship: dreamRelationship.trim(),
        photoUrl,
        pendingPhotoUrl: profile?.pendingPhotoUrl ?? null,
        photoRejectedAt: profile?.photoRejectedAt ?? null,
        extraPhotoUrls: extraPhotos
      });
      notify("저장 완료", "프로필이 업데이트됐어요.");
      router.back();
    } catch (err) {
      notify("저장 실패", err instanceof Error ? err.message : "다시 시도해주세요");
    } finally {
      setSaving(false);
    }
  };

  const genderLabel = profile?.gender ?? "미설정";
  const birthYearLabel = profile?.birthYear ? `${profile.birthYear}년생` : "미설정";

  return (
    <Screen scroll={false} style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>내 프로필</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.reviewNotice}>
          <Ionicons name="time-outline" size={14} color={colors.blushDark} />
          <Text style={styles.reviewNoticeText}>
            변경한 프로필은 심사(보통 몇 시간 이내) 후 적용됩니다.
          </Text>
        </View>

        <Card style={styles.photoCard}>
          <Pressable onPress={pickPhoto} style={styles.avatar} disabled={uploading}>
            {previewUri ? (
              <Image source={{ uri: previewUri }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="camera-outline" size={36} color={colors.muted} />
            )}
            {uploading && (
              <View style={styles.photoOverlay}>
                <Text style={styles.photoOverlayText}>업로드 중…</Text>
              </View>
            )}
            {!uploading && profile?.pendingPhotoUrl !== null && profile?.pendingPhotoUrl !== undefined && (
              <View style={styles.photoStatusBadge}>
                <Ionicons name="time-outline" size={12} color="#fff" />
                <Text style={styles.photoStatusBadgeText}>심사 중</Text>
              </View>
            )}
          </Pressable>
          {profile?.photoRejectedAt !== null && profile?.photoRejectedAt !== undefined && (profile?.pendingPhotoUrl ?? null) === null && (
            <View style={styles.photoRejectNotice}>
              <Ionicons name="alert-circle-outline" size={13} color={colors.blushDark} />
              <Text style={styles.photoRejectText}>이전 사진이 거절됐어요. 새 사진을 등록해 주세요.</Text>
            </View>
          )}
          <Pressable onPress={pickPhoto} style={styles.photoBtn} disabled={uploading}>
            <Ionicons name="camera-outline" size={14} color={colors.blushDark} />
            <Text style={styles.photoBtnText}>
              {uploading ? "업로드 중…" : previewUri ? "프로필 사진 변경" : "프로필 사진 등록"}
            </Text>
          </Pressable>
          <View style={styles.guideBox}>
            <Ionicons name="bulb-outline" size={13} color={colors.body} />
            <Text style={styles.guideText}>
              이목구비가 잘 보이는 정면 사진을 추천해요. 단체사진·풍경·과한 보정은 심사에서 반려될 수 있어요.
            </Text>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            placeholder="닉네임"
            placeholderTextColor={colors.muted}
            style={styles.input}
            maxLength={20}
          />

          <View style={styles.lockedRow}>
            <View style={styles.lockedItem}>
              <Text style={styles.label}>성별</Text>
              <View style={styles.lockedBox}>
                <Text style={styles.lockedValue}>{genderLabel}</Text>
                <Ionicons name="lock-closed" size={14} color={colors.muted} />
              </View>
            </View>
            <View style={styles.lockedItem}>
              <Text style={styles.label}>생년</Text>
              <View style={styles.lockedBox}>
                <Text style={styles.lockedValue}>{birthYearLabel}</Text>
                <Ionicons name="lock-closed" size={14} color={colors.muted} />
              </View>
            </View>
          </View>
          <Text style={styles.lockedHint}>성별과 생년은 가입 후 변경할 수 없어요.</Text>

          <Text style={styles.label}>지역</Text>
          <RegionPicker value={region} onChange={setRegion} />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>자기소개</Text>
          <Text style={styles.sectionDesc}>각 문항은 최소 20자 이상 작성해주세요. 매칭된 상대에게만 보여요.</Text>
          {INTRO_PROMPTS.map((p) => {
            const { value, set } = intros[p.key];
            const len = value.trim().length;
            const tooShort = len > 0 && len < MIN_INTRO;
            return (
              <View key={p.key} style={styles.introBlock}>
                <Text style={styles.introLabel}>{p.label}</Text>
                <TextInput
                  value={value}
                  onChangeText={(t) => set(t.slice(0, p.max))}
                  placeholder={p.placeholder}
                  placeholderTextColor={colors.muted}
                  multiline
                  style={[styles.introInput, tooShort && styles.introInputError]}
                  textAlignVertical="top"
                />
                <View style={styles.introMeta}>
                  <Text style={[styles.introHint, len >= MIN_INTRO && styles.introHintOk]}>
                    {len === 0
                      ? `최소 ${MIN_INTRO}자`
                      : len >= MIN_INTRO
                        ? "최소 글자 충족"
                        : `최소 ${MIN_INTRO}자 (현재 ${len}자)`}
                  </Text>
                  <Text style={styles.introCounter}>{value.length} / {p.max}</Text>
                </View>
              </View>
            );
          })}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>추가 사진 ({extraPhotos.length}/{MAX_EXTRA})</Text>
          <Text style={styles.sectionDesc}>매력을 어필할 사진을 최대 {MAX_EXTRA}장까지 올릴 수 있어요. 안 올려도 괜찮아요.</Text>
          <View style={styles.extraGrid}>
            {Array.from({ length: MAX_EXTRA }).map((_, i) => {
              const url = extraPhotos[i];
              const busy = extraBusyIndex === i;
              return (
                <Pressable
                  key={i}
                  onPress={() => (url ? removeExtra(i) : pickExtra(i))}
                  style={styles.extraCell}
                  disabled={busy}
                >
                  {url ? (
                    <>
                      <Image source={{ uri: url }} style={styles.extraImage} />
                      <View style={styles.extraBadge}>
                        <Ionicons name="close" size={12} color="#fff" />
                      </View>
                    </>
                  ) : (
                    <View style={styles.extraEmpty}>
                      <Ionicons name="add" size={22} color={colors.muted} />
                    </View>
                  )}
                  {busy && (
                    <View style={styles.photoOverlay}>
                      <Text style={styles.photoOverlayText}>처리 중…</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.guideText}>추가 사진 1장당 평균 +3% 매칭률 상승 효과가 있어요.</Text>
        </Card>

        <AppButton label={saving ? "저장 중…" : "저장"} onPress={handleSave} disabled={!canSave} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 24, paddingTop: 22, paddingBottom: 22 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
    paddingBottom: 14
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  content: { gap: 14, paddingBottom: 32 },
  section: { gap: 12, padding: 18 },
  sectionTitle: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  sectionDesc: { color: colors.muted, fontSize: 12, lineHeight: 18 },

  photoCard: { alignItems: "center", gap: 12, padding: 22 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceWarm,
    borderWidth: 2,
    borderColor: colors.blushLight,
    overflow: "hidden"
  },
  avatarImage: { width: "100%", height: "100%" },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)"
  },
  photoOverlayText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  photoStatusBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.65)"
  },
  photoStatusBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  photoRejectNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.blushLight
  },
  photoRejectText: { color: colors.blushDark, fontSize: 12, fontWeight: "700", flex: 1 },
  photoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.blushLight,
    backgroundColor: colors.surfaceWarm
  },
  photoBtnText: { color: colors.blushDark, fontSize: 12, fontWeight: "700" },

  label: { color: colors.ink, fontSize: 13, fontWeight: "700", marginTop: 4 },
  input: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.background,
    color: colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15
  },

  lockedRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  lockedItem: { flex: 1, gap: 6 },
  lockedBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surfaceWarm
  },
  lockedValue: { color: colors.body, fontSize: 14, fontWeight: "700" },
  lockedHint: { color: colors.muted, fontSize: 11, lineHeight: 16 },

  reviewNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.blushLight
  },
  reviewNoticeText: { color: colors.blushDark, fontSize: 12, fontWeight: "700", flex: 1 },
  guideBox: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surfaceWarm,
    marginTop: 6
  },
  guideText: { color: colors.body, fontSize: 11, lineHeight: 16, flex: 1 },

  introBlock: { gap: 6, marginTop: 6 },
  introLabel: { color: colors.ink, fontSize: 13, fontWeight: "700" },
  introInput: {
    minHeight: 84,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.background,
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20
  },
  introCounter: { color: colors.muted, fontSize: 11, fontWeight: "600" },
  introInputError: { borderColor: colors.blush },
  introMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  introHint: { color: colors.blushDark, fontSize: 11, fontWeight: "700" },
  introHintOk: { color: colors.success },

  extraGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  extraCell: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.surfaceWarm,
    position: "relative"
  },
  extraImage: { width: "100%", height: "100%" },
  extraEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.inputBorder,
    borderRadius: 12
  },
  extraBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)"
  }
});
