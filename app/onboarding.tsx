import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  DimensionValue,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { ChoicePill } from "@/components/ChoicePill";
import { Screen } from "@/components/Screen";
import { colors } from "@/constants/colors";
import { uploadPhoto } from "@/services/api";
import { notify } from "@/services/confirm";
import { pickImage } from "@/services/imagePicker";
import { useAppState } from "@/state/AppStateProvider";
import { Gender } from "@/types/domain";

type Step = "gender" | "birthYear" | "region" | "photo" | "intro";

const STEPS: Step[] = ["gender", "birthYear", "region", "photo", "intro"];
const REGIONS = ["서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산"];

const currentYear = new Date().getFullYear();
const MIN_BIRTH_YEAR = currentYear - 80;
const MAX_BIRTH_YEAR = currentYear - 18;

const INTRO_PROMPTS: { key: "introOneLine" | "valueImportant" | "dreamRelationship"; label: string; placeholder: string; max: number }[] = [
  {
    key: "introOneLine",
    label: "나를 한 문장으로 소개한다면?",
    placeholder: "예: 차분하지만 농담 좋아하는 디자이너예요",
    max: 200
  },
  {
    key: "valueImportant",
    label: "연애에서 내가 가장 중요하게 생각하는 가치는 무엇인가요?",
    placeholder: "예: 서로의 일상을 존중하면서도 진솔하게 대화하는 것",
    max: 500
  },
  {
    key: "dreamRelationship",
    label: "내가 꿈꾸는 연애의 모습은 어떤 모습인가요?",
    placeholder: "예: 평일엔 각자의 시간, 주말엔 함께 동네 산책",
    max: 500
  }
];

export default function OnboardingScreen() {
  const { saveProfile, profile } = useAppState();
  const [step, setStep] = useState<Step>("gender");
  const [gender, setGender] = useState<Gender | null>(profile?.gender ?? null);
  const [birthYearText, setBirthYearText] = useState<string>(
    profile?.birthYear ? String(profile.birthYear) : ""
  );
  const [region, setRegion] = useState<string>(profile?.region ?? "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(profile?.photoUrl ?? null);
  const [photoLocalUri, setPhotoLocalUri] = useState<string | null>(null);
  const [introOneLine, setIntroOneLine] = useState<string>(profile?.introOneLine ?? "");
  const [valueImportant, setValueImportant] = useState<string>(profile?.valueImportant ?? "");
  const [dreamRelationship, setDreamRelationship] = useState<string>(profile?.dreamRelationship ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const stepIndex = STEPS.indexOf(step);
  const progressWidth = useMemo<DimensionValue>(
    () => `${Math.round(((stepIndex + 1) / STEPS.length) * 100)}%`,
    [stepIndex]
  );

  const birthYearNumber = useMemo(() => {
    if (birthYearText.length !== 4) return null;
    const n = Number(birthYearText);
    if (!Number.isInteger(n)) return null;
    if (n < MIN_BIRTH_YEAR || n > MAX_BIRTH_YEAR) return null;
    return n;
  }, [birthYearText]);

  const birthYearError =
    birthYearText.length === 4 && birthYearNumber === null
      ? `${MIN_BIRTH_YEAR}년 ~ ${MAX_BIRTH_YEAR}년 사이로 입력해주세요`
      : null;

  const MIN_INTRO = 20;
  const introValid =
    introOneLine.trim().length >= MIN_INTRO &&
    valueImportant.trim().length >= MIN_INTRO &&
    dreamRelationship.trim().length >= MIN_INTRO;

  const canProceed =
    step === "gender"
      ? gender !== null
      : step === "birthYear"
        ? birthYearNumber !== null
        : step === "region"
          ? region.length > 0
          : step === "photo"
            ? !uploading
            : introValid;

  const goPrev = () => {
    if (stepIndex === 0) {
      router.back();
      return;
    }
    setStep(STEPS[stepIndex - 1]);
  };

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

  const goNext = async () => {
    if (!canProceed || saving) return;
    if (stepIndex < STEPS.length - 1) {
      setStep(STEPS[stepIndex + 1]);
      return;
    }
    setSaving(true);
    try {
      await saveProfile({
        nickname: profile?.nickname ?? "",
        gender: gender!,
        ageRange: "",
        birthYear: birthYearNumber,
        region,
        bio: profile?.bio ?? "",
        introOneLine: introOneLine.trim(),
        valueImportant: valueImportant.trim(),
        dreamRelationship: dreamRelationship.trim(),
        photoUrl,
        pendingPhotoUrl: profile?.pendingPhotoUrl ?? null,
        photoRejectedAt: profile?.photoRejectedAt ?? null,
        extraPhotoUrls: profile?.extraPhotoUrls ?? []
      });
      router.replace("/(tabs)/search");
    } catch (err) {
      notify("저장 실패", err instanceof Error ? err.message : "다시 시도해주세요");
    } finally {
      setSaving(false);
    }
  };

  const introSetter = (key: "introOneLine" | "valueImportant" | "dreamRelationship") => {
    if (key === "introOneLine") return setIntroOneLine;
    if (key === "valueImportant") return setValueImportant;
    return setDreamRelationship;
  };
  const introValue = (key: "introOneLine" | "valueImportant" | "dreamRelationship") => {
    if (key === "introOneLine") return introOneLine;
    if (key === "valueImportant") return valueImportant;
    return dreamRelationship;
  };

  const previewUri = photoLocalUri ?? photoUrl;

  return (
    <Screen scroll={false} style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={goPrev} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>프로필 설정</Text>
        <Text style={styles.progress}>{stepIndex + 1}/{STEPS.length}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {step === "gender" && (
          <Card style={styles.card}>
            <Text style={styles.question}>성별을 선택해주세요</Text>
            <Text style={styles.desc}>매칭을 위해 꼭 필요해요. 나중에 변경할 수 없어요.</Text>
            <View style={styles.genderRow}>
              {(["여성", "남성"] as Gender[]).map((g) => (
                <Pressable
                  key={g}
                  onPress={() => setGender(g)}
                  style={[styles.genderCard, gender === g && styles.genderCardSelected]}
                >
                  <Ionicons
                    name={g === "여성" ? "female" : "male"}
                    size={32}
                    color={gender === g ? colors.blush : colors.muted}
                  />
                  <Text style={[styles.genderLabel, gender === g && styles.genderLabelSelected]}>{g}</Text>
                </Pressable>
              ))}
            </View>
          </Card>
        )}

        {step === "birthYear" && (
          <Card style={styles.card}>
            <Text style={styles.question}>몇 년생이신가요?</Text>
            <Text style={styles.desc}>또래 추천에 활용해요. 만 18세 이상부터 가입할 수 있어요.</Text>
            <View style={styles.birthInputWrap}>
              <TextInput
                value={birthYearText}
                onChangeText={(t) => setBirthYearText(t.replace(/[^0-9]/g, "").slice(0, 4))}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={4}
                placeholder="예: 1995"
                placeholderTextColor={colors.muted}
                style={[styles.birthInput, birthYearError && styles.birthInputError]}
              />
              <Text style={styles.birthSuffix}>년생</Text>
            </View>
            {birthYearError && <Text style={styles.errorText}>{birthYearError}</Text>}
          </Card>
        )}

        {step === "region" && (
          <Card style={styles.card}>
            <Text style={styles.question}>거주 지역을 알려주세요</Text>
            <Text style={styles.desc}>비슷한 지역의 상대와 우선 매칭돼요.</Text>
            <View style={styles.pills}>
              {REGIONS.map((r) => (
                <ChoicePill key={r} label={r} selected={region === r} onPress={() => setRegion(r)} />
              ))}
            </View>
          </Card>
        )}

        {step === "photo" && (
          <Card style={styles.card}>
            <Text style={styles.question}>프로필 사진</Text>
            <Text style={styles.desc}>사진은 매칭 후에만 공개돼요. 지금 건너뛰고 나중에 등록할 수도 있어요.</Text>
            <View style={styles.photoWrap}>
              <Pressable onPress={pickPhoto} style={styles.photoAvatar} disabled={uploading}>
                {previewUri ? (
                  <Image source={{ uri: previewUri }} style={styles.photoImage} />
                ) : (
                  <Ionicons name="camera-outline" size={42} color={colors.muted} />
                )}
                {uploading && (
                  <View style={styles.photoOverlay}>
                    <Text style={styles.photoOverlayText}>업로드 중…</Text>
                  </View>
                )}
              </Pressable>
              <Pressable onPress={pickPhoto} style={styles.photoBtn} disabled={uploading}>
                <Ionicons name="camera-outline" size={16} color={colors.blushDark} />
                <Text style={styles.photoBtnText}>
                  {uploading ? "업로드 중…" : previewUri ? "사진 변경" : "사진 업로드"}
                </Text>
              </Pressable>
            </View>
            <View style={styles.noticeBox}>
              <Ionicons name="time-outline" size={16} color={colors.blushDark} />
              <Text style={styles.noticeText}>
                심사는 몇 시간 이내로 이루어지며 승인 후 프로필 노출이 시작됩니다.
              </Text>
            </View>
          </Card>
        )}

        {step === "intro" && (
          <Card style={styles.card}>
            <Text style={styles.question}>자기소개</Text>
            <Text style={styles.desc}>세 문항에 각 20자 이상으로 답해주세요. 매칭된 상대에게만 보여요.</Text>
            {INTRO_PROMPTS.map((p) => {
              const value = introValue(p.key);
              const len = value.trim().length;
              const tooShort = len > 0 && len < MIN_INTRO;
              return (
                <View key={p.key} style={styles.introBlock}>
                  <Text style={styles.introLabel}>{p.label}</Text>
                  <TextInput
                    value={value}
                    onChangeText={(t) => introSetter(p.key)(t.slice(0, p.max))}
                    placeholder={p.placeholder}
                    placeholderTextColor={colors.muted}
                    multiline
                    style={[styles.introInput, tooShort && styles.introInputError]}
                    textAlignVertical="top"
                  />
                  <View style={styles.introMeta}>
                    <Text style={[styles.introHint, len >= MIN_INTRO && styles.introHintOk]}>
                      {len >= MIN_INTRO ? "최소 글자 충족" : `최소 ${MIN_INTRO}자 (현재 ${len}자)`}
                    </Text>
                    <Text style={styles.introCounter}>{value.length} / {p.max}</Text>
                  </View>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          label={
            saving
              ? "저장 중…"
              : stepIndex < STEPS.length - 1
                ? "다음"
                : "완료 — 시작하기"
          }
          onPress={goNext}
          disabled={!canProceed || saving}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center", marginLeft: -8 },
  title: { color: colors.ink, fontSize: 18, fontWeight: "800", flex: 1, textAlign: "center" },
  progress: { color: colors.muted, fontSize: 13, fontWeight: "700", width: 36, textAlign: "right" },
  progressTrack: {
    height: 5,
    borderRadius: 8,
    backgroundColor: colors.line,
    marginTop: 20,
    marginBottom: 24,
    overflow: "hidden"
  },
  progressFill: { height: "100%", borderRadius: 8, backgroundColor: colors.blush },
  body: { gap: 18, paddingBottom: 16, paddingTop: 4, flexGrow: 1 },
  card: { gap: 14, padding: 22 },
  question: { color: colors.ink, fontSize: 20, fontWeight: "800" },
  desc: { color: colors.muted, fontSize: 13, lineHeight: 20 },

  genderRow: { flexDirection: "row", gap: 14, marginTop: 8 },
  genderCard: {
    flex: 1,
    paddingVertical: 28,
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.background
  },
  genderCardSelected: { borderColor: colors.blush, backgroundColor: colors.surfaceWarm },
  genderLabel: { color: colors.muted, fontSize: 15, fontWeight: "700" },
  genderLabelSelected: { color: colors.blushDark },

  birthInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10
  },
  birthInput: {
    flex: 1,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.background,
    color: colors.ink,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1
  },
  birthInputError: { borderColor: colors.blush },
  birthSuffix: { color: colors.body, fontSize: 16, fontWeight: "700" },
  errorText: { color: colors.blushDark, fontSize: 12, fontWeight: "600", marginTop: 4 },

  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },

  photoWrap: { alignItems: "center", gap: 14, marginTop: 8 },
  photoAvatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceWarm,
    borderWidth: 2,
    borderColor: colors.blushLight,
    overflow: "hidden"
  },
  photoImage: { width: "100%", height: "100%" },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)"
  },
  photoOverlayText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  photoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.blushLight,
    backgroundColor: colors.surfaceWarm
  },
  photoBtnText: { color: colors.blushDark, fontSize: 13, fontWeight: "700" },

  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceWarm
  },
  noticeText: { flex: 1, color: colors.blushDark, fontSize: 12, fontWeight: "600", lineHeight: 18 },

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

  footer: { paddingTop: 8 }
});
