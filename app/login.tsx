import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { Screen } from "@/components/Screen";
import { colors } from "@/constants/colors";
import { useAppState } from "@/state/AppStateProvider";

export default function LoginScreen() {
  const { logIn } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canLogin = email.includes("@") && password.length >= 4 && !submitting;

  const handleLogin = async () => {
    if (!canLogin) return;
    setSubmitting(true);
    try {
      await logIn({ email: email.trim(), password });
      router.replace("/(tabs)/search");
    } catch (err) {
      const code = err instanceof Error ? err.message : "unknown";
      Alert.alert(
        "로그인 실패",
        code === "invalid_credentials"
          ? "이메일이나 비밀번호가 올바르지 않아요"
          : code === "invalid_input"
            ? "입력을 확인해주세요"
            : "잠시 후 다시 시도해주세요"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={24} color={colors.ink} />
      </Pressable>

      <View style={styles.heading}>
        <Text style={styles.title}>로그인</Text>
        <Text style={styles.subtitle}>백애에 오신 것을 환영해요</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputWrap}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="이메일"
            placeholderTextColor={colors.muted}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputWrap}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.inputPr]}
            secureTextEntry={!showPassword}
          />
          <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.muted} />
          </Pressable>
        </View>
      </View>

      <AppButton label={submitting ? "로그인 중…" : "로그인"} onPress={handleLogin} disabled={!canLogin} />

      <Pressable onPress={() => {}} style={styles.forgotBtn}>
        <Text style={styles.forgotText}>비밀번호 찾기</Text>
      </Pressable>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>또는</Text>
        <View style={styles.dividerLine} />
      </View>

      <AppButton label="가입하기" variant="secondary" onPress={() => router.replace("/signup")} />
    </Screen>
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
  heading: { marginTop: 16, marginBottom: 32, gap: 6 },
  title: { color: colors.ink, fontSize: 28, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: 14 },
  form: { gap: 12, marginBottom: 20 },
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
  inputPr: { paddingRight: 48 },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center"
  },
  forgotBtn: { alignSelf: "center", marginTop: 16, padding: 4 },
  forgotText: { color: colors.muted, fontSize: 13, textDecorationLine: "underline" },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 24
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.line },
  dividerText: { color: colors.muted, fontSize: 12 }
});
