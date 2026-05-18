import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { ChoicePill } from "@/components/ChoicePill";
import { Screen } from "@/components/Screen";
import { colors } from "@/constants/colors";
import { useAppState } from "@/state/AppStateProvider";
import { Gender } from "@/types/domain";

const genderOptions: Gender[] = ["여성", "남성", "선택 안 함"];
const ageOptions = ["20대 후반", "30대 초반", "30대 중반", "40대"];
const regionOptions = ["서울", "경기", "인천", "부산", "대구", "광주"];

export default function AuthScreen() {
  const { saveProfile } = useAppState();
  const [nickname, setNickname] = useState("회원님");
  const [gender, setGender] = useState<Gender>("선택 안 함");
  const [ageRange, setAgeRange] = useState("30대 초반");
  const [region, setRegion] = useState("서울");

  const canContinue = nickname.trim().length >= 2;

  const submit = (): void => {
    if (!canContinue) {
      return;
    }

    saveProfile({ nickname: nickname.trim(), gender, ageRange, region });
    router.push("/values");
  };

  return (
    <Screen>
      <Text style={styles.title}>기본 정보를 알려주세요</Text>
      <Text style={styles.subtitle}>사진 없이 가치관 프로필을 먼저 만들어요.</Text>

      <Card style={styles.form}>
        <Text style={styles.label}>닉네임</Text>
        <TextInput
          value={nickname}
          onChangeText={setNickname}
          placeholder="닉네임"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />

        <Text style={styles.label}>성별</Text>
        <View style={styles.pills}>
          {genderOptions.map((option) => (
            <ChoicePill key={option} label={option} selected={gender === option} onPress={() => setGender(option)} />
          ))}
        </View>

        <Text style={styles.label}>나이대</Text>
        <View style={styles.pills}>
          {ageOptions.map((option) => (
            <ChoicePill
              key={option}
              label={option}
              selected={ageRange === option}
              onPress={() => setAgeRange(option)}
            />
          ))}
        </View>

        <Text style={styles.label}>지역</Text>
        <View style={styles.pills}>
          {regionOptions.map((option) => (
            <ChoicePill key={option} label={option} selected={region === option} onPress={() => setRegion(option)} />
          ))}
        </View>
      </Card>

      <AppButton label="가치관 설문 시작" onPress={submit} disabled={!canContinue} style={styles.button} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: "800",
    marginTop: 12
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 22
  },
  form: {
    gap: 14
  },
  label: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 6
  },
  input: {
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.background,
    color: colors.ink,
    paddingHorizontal: 14,
    fontSize: 15
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  button: {
    marginTop: 24
  }
});
