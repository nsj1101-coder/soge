import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { DimensionValue, Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { ChoicePill } from "@/components/ChoicePill";
import { Screen } from "@/components/Screen";
import { colors } from "@/constants/colors";
import { valueQuestions } from "@/data/valueQuestions";
import { useAppState } from "@/state/AppStateProvider";
import { ValueAnswer } from "@/types/domain";

export default function ValuesScreen() {
  const { replaceAnswers } = useAppState();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ValueAnswer[]>([]);
  const question = valueQuestions[step];
  const selectedOption = answers.find((answer) => answer.questionId === question.id)?.option;
  const progress = `${step + 1}/${valueQuestions.length}`;

  const progressWidth = useMemo<DimensionValue>(
    () => `${Math.round(((step + 1) / valueQuestions.length) * 100)}%`,
    [step]
  );

  const chooseOption = (option: string): void => {
    setAnswers((current) => {
      const nextAnswers = current.filter((answer) => answer.questionId !== question.id);

      return [...nextAnswers, { questionId: question.id, option }];
    });
  };

  const goNext = (): void => {
    if (selectedOption === undefined) {
      return;
    }

    if (step < valueQuestions.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    replaceAnswers(answers);
    router.replace("/(tabs)/recommendations");
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => (step > 0 ? setStep((s) => s - 1) : router.back())} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>가치관 프로필</Text>
        <Text style={styles.progress}>{progress}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      <Card style={styles.card}>
        <View style={styles.questionHeader}>
          <Ionicons name="heart-outline" size={16} color={colors.blush} />
          <Text style={styles.question}>{question.title}</Text>
        </View>
        <Text style={styles.subtitle}>{question.subtitle}</Text>
        <View style={styles.options}>
          {question.options.map((option) => (
            <ChoicePill
              key={option}
              label={option}
              selected={selectedOption === option}
              onPress={() => chooseOption(option)}
            />
          ))}
        </View>
      </Card>

      <AppButton label={step === valueQuestions.length - 1 ? "오늘의 추천 보기" : "다음"} onPress={goNext} disabled={selectedOption === undefined} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
    flex: 1,
    textAlign: "center"
  },
  progress: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  progressTrack: {
    height: 5,
    borderRadius: 8,
    backgroundColor: colors.line,
    marginTop: 22,
    marginBottom: 32,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: colors.blush
  },
  card: {
    gap: 16,
    marginBottom: 28
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  question: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  }
});
