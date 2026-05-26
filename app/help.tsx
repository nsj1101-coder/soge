import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { SubPageHeader } from "@/components/SubPageHeader";
import { colors } from "@/constants/colors";

type IoniconName = keyof typeof Ionicons.glyphMap;

const FAQS: { q: string; a: string }[] = [
  {
    q: "매칭은 어떻게 이루어지나요?",
    a: "가치관 답변을 비교해서 매치율이 70% 이상이면 자동으로 매칭이 생성돼요. 그 전까지는 단방향 좋아요로 기록됩니다."
  },
  {
    q: "꽃은 어떻게 충전하나요?",
    a: "상점 탭에서 꽃 패키지를 구매할 수 있어요. 새로운 매칭을 시작할 때 1송이가 차감됩니다."
  },
  {
    q: "추천이 안 나와요",
    a: "가치관 답변을 먼저 완료해야 더 정확한 추천이 나와요. 마이페이지 → 나의 가치관 답변에서 설정하세요."
  },
  {
    q: "신고/차단은 어떻게 하나요?",
    a: "채팅 화면 우측 상단의 메뉴에서 차단할 수 있어요. 부적절한 메시지는 길게 눌러서 신고하세요."
  }
];

const CONTACT: { icon: IoniconName; label: string; value: string }[] = [
  { icon: "mail-outline", label: "이메일", value: "support@soge.app" },
  { icon: "chatbubble-ellipses-outline", label: "1:1 문의", value: "곧 오픈" }
];

export default function HelpScreen() {
  return (
    <Screen scroll={false}>
      <SubPageHeader title="도움말 및 지원" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>자주 묻는 질문</Text>
          {FAQS.map((faq, idx) => (
            <View key={idx}>
              {idx > 0 && <View style={styles.divider} />}
              <Text style={styles.faqQ}>Q. {faq.q}</Text>
              <Text style={styles.faqA}>{faq.a}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>문의하기</Text>
          {CONTACT.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => Alert.alert(item.label, item.value)}
              style={styles.contactRow}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon} size={18} color={colors.blush} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactLabel}>{item.label}</Text>
                <Text style={styles.contactValue}>{item.value}</Text>
              </View>
            </Pressable>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 32 },
  section: { padding: 18, gap: 12 },
  sectionTitle: { color: colors.ink, fontSize: 15, fontWeight: "800", marginBottom: 4 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 12 },
  faqQ: { color: colors.ink, fontSize: 14, fontWeight: "700", marginBottom: 4 },
  faqA: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceWarm
  },
  contactLabel: { color: colors.muted, fontSize: 11, fontWeight: "600" },
  contactValue: { color: colors.ink, fontSize: 14, fontWeight: "600" }
});
