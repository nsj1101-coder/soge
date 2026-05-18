import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Card } from "@/components/Card";
import { FlowerBadge } from "@/components/FlowerBadge";
import { ProfileOrb } from "@/components/ProfileOrb";
import { Screen } from "@/components/Screen";
import { colors } from "@/constants/colors";
import { useAppState } from "@/state/AppStateProvider";

export default function ChatScreen() {
  const { matches, messages, flowerCount, sendChatMessage, reportMessage } = useAppState();
  const [draft, setDraft] = useState("");
  const activeMatch = matches[0] ?? null;
  const activeMessages = useMemo(
    () => messages.filter((message) => message.matchId === activeMatch?.id),
    [activeMatch?.id, messages]
  );

  const submit = (): void => {
    if (activeMatch === null) {
      return;
    }

    sendChatMessage(activeMatch.id, draft);
    setDraft("");
  };

  if (activeMatch === null) {
    return (
      <Screen>
        <Text style={styles.title}>채팅</Text>
        <Card style={styles.emptyCard}>
          <Ionicons name="chatbubble-outline" color={colors.blush} size={38} />
          <Text style={styles.emptyTitle}>매칭 후 채팅이 열려요</Text>
          <Text style={styles.emptyText}>서로 좋아요를 보내면 이곳에서 대화를 시작할 수 있습니다.</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
      <Screen scroll={false} style={styles.screen}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => {}} style={styles.backBtn}>
            <Ionicons name="chevron-back" color={colors.ink} size={24} />
          </Pressable>
          <Text style={styles.title}>채팅</Text>
          <View style={{ flex: 1 }} />
          <Pressable accessibilityRole="button" style={styles.moreBtn}>
            <Ionicons name="ellipsis-horizontal" color={colors.ink} size={22} />
          </Pressable>
        </View>
        <View style={styles.subHeader}>
          <View style={styles.matchRatePill}>
            <Text style={styles.matchRate}>매칭률 {activeMatch.matchRate}%</Text>
          </View>
          <FlowerBadge count={flowerCount} compact />
        </View>

        <View style={styles.notice}>
          <Ionicons name="flower-outline" color={colors.infoBannerText} size={18} />
          <Text style={styles.noticeText}>새로운 매칭을 시작하면 백애 1송이가 차감됩니다.</Text>
        </View>

        <View style={styles.messages}>
          {activeMessages.map((message) => (
            <Pressable
              key={message.id}
              onLongPress={() =>
                Alert.alert("메시지 신고", "이 메시지를 신고하고 화면에서 숨길까요?", [
                  { text: "취소", style: "cancel" },
                  { text: "신고", style: "destructive", onPress: () => reportMessage(message.id) }
                ])
              }
              style={[styles.bubble, message.sender === "me" ? styles.myBubble : styles.otherBubble]}
            >
              <Text style={[styles.messageText, message.sender === "me" && styles.myText]}>{message.body}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.inputBar}>
          <Pressable accessibilityLabel="첨부" accessibilityRole="button" style={styles.plusButton}>
            <Ionicons name="add" color={colors.muted} size={24} />
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="메시지를 입력하세요"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Pressable accessibilityLabel="메시지 보내기" accessibilityRole="button" onPress={submit} style={styles.sendButton}>
            <Ionicons name="send" color={colors.surface} size={19} />
          </Pressable>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: colors.background
  },
  screen: {
    paddingBottom: 12
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8
  },
  moreBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "800"
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10
  },
  matchRatePill: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.blushLight,
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  matchRate: {
    color: colors.blushDark,
    fontSize: 13,
    fontWeight: "800"
  },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.infoBanner,
    borderWidth: 1,
    borderColor: colors.infoBannerBorder,
    borderRadius: 12,
    padding: 12,
    marginTop: 12
  },
  noticeText: {
    flex: 1,
    color: colors.infoBannerText,
    fontSize: 12,
    lineHeight: 18
  },
  messages: {
    flex: 1,
    justifyContent: "flex-end",
    gap: 10,
    paddingVertical: 18
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 11
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.blushLight
  },
  otherBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.chatBubble
  },
  messageText: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20
  },
  myText: {
    color: colors.ink
  },
  inputBar: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 8
  },
  plusButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center"
  },
  input: {
    flex: 1,
    color: colors.ink,
    fontSize: 14
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.blush
  },
  emptyCard: {
    marginTop: 22,
    alignItems: "center",
    gap: 12
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800"
  },
  emptyText: {
    color: colors.muted,
    textAlign: "center",
    lineHeight: 21
  }
});
