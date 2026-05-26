import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "@/components/AppButton";
import { Screen } from "@/components/Screen";
import { colors, shadow } from "@/constants/colors";
import { sendVerificationCode, verifyEmailCode } from "@/services/api";
import { notify } from "@/services/confirm";
import { useAppState } from "@/state/AppStateProvider";

type TermKey = "terms" | "privacy" | "sensitive" | "marketing";

const TERMS: { key: TermKey; label: string; required: boolean }[] = [
  { key: "terms", label: "이용약관 동의", required: true },
  { key: "privacy", label: "개인정보 수집 및 이용 동의", required: true },
  { key: "sensitive", label: "민감정보 수집 및 이용 동의", required: true },
  { key: "marketing", label: "마케팅 정보 수신 동의", required: false }
];

type Agreed = Record<TermKey, boolean>;

const errorMessage = (raw: string): string => {
  switch (raw) {
    case "email_taken":
      return "이미 사용 중인 이메일이에요";
    case "invalid_email":
      return "이메일 형식이 올바르지 않아요";
    case "mail_send_failed":
      return "메일 발송에 실패했어요. 잠시 후 다시 시도해주세요";
    case "code_expired":
      return "코드가 만료됐어요. 다시 받아주세요";
    case "code_mismatch":
      return "코드가 일치하지 않아요";
    case "too_many_attempts":
      return "시도가 많아요. 코드를 다시 받아주세요";
    case "no_pending_verification":
      return "먼저 인증 코드를 발송해주세요";
    case "email_not_verified":
      return "이메일 인증을 먼저 완료해주세요";
    default:
      return raw;
  }
};

export default function SignupScreen() {
  const { signUp } = useAppState();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [signingUp, setSigningUp] = useState(false);
  const [sentAt, setSentAt] = useState<number | null>(null);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [agreed, setAgreed] = useState<Agreed>({ terms: false, privacy: false, sensitive: false, marketing: false });

  const emailOk = email.includes("@") && email.includes(".");
  const passwordOk = password.length >= 6;
  const allRequired = agreed.terms && agreed.privacy && agreed.sensitive;
  const allChecked = allRequired && agreed.marketing;
  const canSendCode = emailOk && !sending && resendSeconds === 0;
  const canVerify = code.length === 6 && !verifying && !verified;
  const canContinue = verified && passwordOk;

  useEffect(() => {
    if (sentAt === null) return;
    const id = setInterval(() => {
      const remain = Math.max(0, 60 - Math.floor((Date.now() - sentAt) / 1000));
      setResendSeconds(remain);
      if (remain === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [sentAt]);

  const handleSendCode = async () => {
    if (!canSendCode) return;
    setSending(true);
    try {
      await sendVerificationCode(email.trim().toLowerCase());
      setSentAt(Date.now());
      setResendSeconds(60);
      setVerified(false);
      setCode("");
      notify("인증 코드 발송", "메일을 확인해주세요. 5분 안에 6자리 코드를 입력해주세요.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      notify("발송 실패", errorMessage(msg));
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (!canVerify) return;
    setVerifying(true);
    try {
      await verifyEmailCode(email.trim().toLowerCase(), code);
      setVerified(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      notify("인증 실패", errorMessage(msg));
    } finally {
      setVerifying(false);
    }
  };

  const handleNext = () => {
    if (canContinue) setShowTerms(true);
  };

  const toggleAll = () => {
    const next = !allChecked;
    setAgreed({ terms: next, privacy: next, sensitive: next, marketing: next });
  };

  const toggleTerm = (key: TermKey) => {
    setAgreed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAgree = async () => {
    if (!allRequired || signingUp) return;
    setSigningUp(true);
    try {
      await signUp({ email: email.trim().toLowerCase(), password });
      setShowTerms(false);
      router.replace("/onboarding");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      notify("가입 실패", errorMessage(msg));
    } finally {
      setSigningUp(false);
    }
  };

  return (
    <>
      <Screen>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>

        <View style={styles.heading}>
          <Text style={styles.title}>가입하기</Text>
          <Text style={styles.subtitle}>이메일 인증 후 가입을 진행해요</Text>
        </View>

        <ScrollView style={styles.form} contentContainerStyle={{ gap: 10, paddingBottom: 16 }}>
          <Text style={styles.label}>이메일</Text>
          <View style={styles.row}>
            <TextInput
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (verified) setVerified(false);
              }}
              placeholder="이메일 입력"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.inputFlex]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!verified}
            />
            <Pressable
              onPress={handleSendCode}
              disabled={!canSendCode}
              style={[styles.codeBtn, !canSendCode && styles.codeBtnDisabled]}
            >
              <Text style={[styles.codeBtnText, !canSendCode && styles.codeBtnTextDisabled]}>
                {verified
                  ? "인증 완료"
                  : sending
                    ? "발송 중…"
                    : resendSeconds > 0
                      ? `재발송 ${resendSeconds}초`
                      : sentAt === null
                        ? "인증 발송"
                        : "재발송"}
              </Text>
            </Pressable>
          </View>

          {sentAt !== null && !verified && (
            <>
              <Text style={styles.label}>인증 코드 (6자리)</Text>
              <View style={styles.row}>
                <TextInput
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/[^\d]/g, "").slice(0, 6))}
                  placeholder="000000"
                  placeholderTextColor={colors.muted}
                  style={[styles.input, styles.inputFlex, styles.codeInput]}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <Pressable
                  onPress={handleVerify}
                  disabled={!canVerify}
                  style={[styles.codeBtn, !canVerify && styles.codeBtnDisabled]}
                >
                  <Text style={[styles.codeBtnText, !canVerify && styles.codeBtnTextDisabled]}>
                    {verifying ? "확인 중…" : "확인"}
                  </Text>
                </Pressable>
              </View>
              <Text style={styles.hint}>받은 메일의 6자리 코드를 입력해주세요. 코드는 5분 동안 유효해요.</Text>
            </>
          )}

          {verified && (
            <View style={styles.verifiedBanner}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.verifiedText}>이메일 인증이 완료되었어요</Text>
            </View>
          )}

          <Text style={[styles.label, !verified && styles.labelDisabled]}>비밀번호 (6자 이상)</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.inputPr, !verified && styles.inputDisabled]}
              secureTextEntry={!showPassword}
              editable={verified}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.muted} />
            </Pressable>
          </View>
        </ScrollView>

        <AppButton label="다음 — 이용약관 동의" onPress={handleNext} disabled={!canContinue} />
      </Screen>

      <Modal visible={showTerms} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>이용약관 동의</Text>
            <Text style={styles.sheetSubtitle}>백애 서비스 이용을 위해 아래 항목에 동의해주세요.</Text>

            <ScrollView style={styles.termsList} showsVerticalScrollIndicator={false}>
              <Pressable onPress={toggleAll} style={styles.termRowAll}>
                <View style={[styles.checkbox, allChecked && styles.checkboxChecked]}>
                  {allChecked && <Ionicons name="checkmark" size={14} color={colors.surface} />}
                </View>
                <Text style={styles.termLabelAll}>전체 동의</Text>
              </Pressable>

              <View style={styles.termsDivider} />

              {TERMS.map((term) => (
                <Pressable key={term.key} onPress={() => toggleTerm(term.key)} style={styles.termRow}>
                  <View style={[styles.checkbox, agreed[term.key] && styles.checkboxChecked]}>
                    {agreed[term.key] && <Ionicons name="checkmark" size={14} color={colors.surface} />}
                  </View>
                  <View style={styles.termTextWrap}>
                    <Text style={styles.termLabel}>{term.label}</Text>
                    {!term.required && <Text style={styles.termOptional}>(선택)</Text>}
                    {term.required && <Text style={styles.termRequired}>(필수)</Text>}
                  </View>
                  <Pressable style={styles.viewBtn}>
                    <Text style={styles.viewBtnText}>보기</Text>
                  </Pressable>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.sheetFooter}>
              <AppButton
                label={signingUp ? "가입 중…" : "동의하고 시작하기"}
                onPress={handleAgree}
                disabled={!allRequired || signingUp}
              />
              <Pressable onPress={() => setShowTerms(false)} style={styles.cancelBtn} disabled={signingUp}>
                <Text style={styles.cancelText}>취소</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
    marginTop: 4
  },
  heading: { marginTop: 16, marginBottom: 24, gap: 6 },
  title: { color: colors.ink, fontSize: 28, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: 14 },
  form: { flex: 1 },
  label: { color: colors.ink, fontSize: 13, fontWeight: "700", marginTop: 4 },
  labelDisabled: { color: colors.muted },
  row: { flexDirection: "row", gap: 10 },
  inputWrap: { position: "relative" },
  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.surface,
    color: colors.ink,
    paddingHorizontal: 16,
    fontSize: 15
  },
  inputFlex: { flex: 1 },
  inputDisabled: { backgroundColor: colors.background, color: colors.muted },
  inputPr: { paddingRight: 48 },
  codeInput: { letterSpacing: 6, textAlign: "center", fontWeight: "700" },
  codeBtn: {
    height: 54,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.blush,
    alignItems: "center",
    justifyContent: "center"
  },
  codeBtnDisabled: { backgroundColor: colors.line },
  codeBtnText: { color: colors.surface, fontSize: 13, fontWeight: "700" },
  codeBtnTextDisabled: { color: colors.muted },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: -2 },
  verifiedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EBF6F0",
    borderRadius: 12,
    padding: 12,
    marginTop: 4
  },
  verifiedText: { color: colors.success, fontSize: 13, fontWeight: "700" },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end"
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingBottom: 8,
    maxHeight: "85%",
    ...shadow
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginVertical: 12
  },
  sheetTitle: { color: colors.ink, fontSize: 20, fontWeight: "800", marginBottom: 4 },
  sheetSubtitle: { color: colors.muted, fontSize: 13, marginBottom: 20 },
  termsList: { flexGrow: 0 },
  termRowAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14
  },
  termsDivider: { height: 1, backgroundColor: colors.line, marginBottom: 8 },
  termRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    alignItems: "center",
    justifyContent: "center"
  },
  checkboxChecked: { backgroundColor: colors.blush, borderColor: colors.blush },
  termTextWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  termLabel: { color: colors.ink, fontSize: 14 },
  termLabelAll: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  termRequired: { color: colors.blush, fontSize: 11 },
  termOptional: { color: colors.muted, fontSize: 11 },
  viewBtn: { padding: 4 },
  viewBtnText: { color: colors.muted, fontSize: 12, textDecorationLine: "underline" },
  sheetFooter: { paddingTop: 20, gap: 12 },
  cancelBtn: { alignSelf: "center", padding: 8 },
  cancelText: { color: colors.muted, fontSize: 13 }
});
