import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/Card";
import { FlowerBadge } from "@/components/FlowerBadge";
import { MatchRate } from "@/components/MatchRate";
import { ProfileOrb } from "@/components/ProfileOrb";
import { colors, shadow } from "@/constants/colors";
import { confirm, notify } from "@/services/confirm";
import { useAppState } from "@/state/AppStateProvider";

type Params = { matchId?: string };

export default function ChatDetailScreen() {
  const { matchId } = useLocalSearchParams<Params>();
  const { matches, messages, flowerCount, sendChatMessage, reportMessage, blockMatch, loadMessagesForMatch } = useAppState();
  const [draft, setDraft] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [sending, setSending] = useState(false);

  const match = matches.find((m) => m.id === matchId) ?? matches[0] ?? null;
  const chatMessages = useMemo(
    () => messages.filter((m) => m.matchId === match?.id),
    [messages, match?.id]
  );

  useEffect(() => {
    if (match === null) return;
    void loadMessagesForMatch(match.id).catch(() => {});
    const id = setInterval(() => {
      void loadMessagesForMatch(match.id).catch(() => {});
    }, 3000);
    return () => clearInterval(id);
  }, [match?.id, loadMessagesForMatch]);

  if (match === null) {
    return (
      <SafeAreaView style={styles.safe}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>채팅을 찾을 수 없어요</Text>
        </View>
      </SafeAreaView>
    );
  }

  const submit = async () => {
    if (!draft.trim() || sending) return;
    const body = draft;
    setSending(true);
    setDraft("");
    try {
      await sendChatMessage(match.id, body);
    } catch (err) {
      setDraft(body);
      notify("전송 실패", err instanceof Error ? err.message : "다시 시도해주세요");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.ink} />
            </Pressable>
            <Pressable onPress={() => setShowProfile(true)} style={styles.headerCenter}>
              <ProfileOrb initial={match.candidate.initial} size={34} />
              <View>
                <Text style={styles.headerName}>{match.candidate.nickname}</Text>
                <Text style={styles.headerSub}>{match.candidate.ageRange}{match.candidate.region ? ` · ${match.candidate.region}` : ""}</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => setShowMenu(true)} style={styles.menuBtn}>
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.ink} />
            </Pressable>
          </View>

          <View style={styles.subHeader}>
            <MatchRate rate={match.matchRate} compact />
            <FlowerBadge count={flowerCount} compact />
          </View>

          <View style={styles.notice}>
            <Ionicons name="flower-outline" color={colors.infoBannerText} size={16} />
            <Text style={styles.noticeText}>새로운 매칭을 시작하면 백애 1송이가 차감됩니다.</Text>
          </View>

          <ScrollView
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {chatMessages.map((msg) => (
              <Pressable
                key={msg.id}
                onLongPress={async () => {
                  if (await confirm("메시지 신고", "이 메시지를 신고하고 숨길까요?", "신고", true)) {
                    void reportMessage(msg.id);
                  }
                }}
                style={[styles.bubble, msg.sender === "me" ? styles.myBubble : styles.otherBubble]}
              >
                <Text style={styles.bubbleText}>{msg.body}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.inputBar}>
            <Pressable style={styles.plusBtn}>
              <Ionicons name="add" color={colors.muted} size={22} />
            </Pressable>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="메시지를 입력하세요"
              placeholderTextColor={colors.muted}
              style={styles.input}
              multiline
            />
            <Pressable onPress={submit} style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]}>
              <Ionicons name="send" color={colors.surface} size={17} />
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      <Modal visible={showProfile} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>프로필 보기</Text>
              <Pressable onPress={() => setShowProfile(false)}>
                <Ionicons name="close" size={22} color={colors.ink} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.profileSection}>
                <ProfileOrb initial={match.candidate.initial} size={80} />
                <Text style={styles.profileMeta}>{match.candidate.ageRange} · {match.candidate.region}</Text>
                <Text style={styles.profileJob}>{match.candidate.job}</Text>
                <MatchRate rate={match.matchRate} />
              </View>

              <Card style={styles.bioCard}>
                <Text style={styles.bioTitle}>자기소개</Text>
                {[
                  { label: "나를 한 문장으로 소개한다면?", value: match.candidate.introOneLine },
                  { label: "연애에서 가장 중요하게 생각하는 가치", value: match.candidate.valueImportant },
                  { label: "꿈꾸는 연애의 모습", value: match.candidate.dreamRelationship }
                ].map((item) => (
                  <View key={item.label} style={styles.introRow}>
                    <Text style={styles.introLabel}>{item.label}</Text>
                    <Text style={[styles.bioText, !item.value && styles.bioTextEmpty]}>
                      {item.value && item.value.length > 0 ? item.value : "아직 작성하지 않았어요"}
                    </Text>
                  </View>
                ))}
              </Card>

              <Card style={styles.valuesCard}>
                <Text style={styles.bioTitle}>가치관</Text>
                <View style={styles.summaryWrap}>
                  {match.candidate.summary.map((item) => (
                    <Text key={item} style={styles.summaryPill}>{item}</Text>
                  ))}
                </View>
              </Card>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      <Modal visible={showMenu} animationType="fade" transparent>
        <Pressable style={styles.menuOverlay} onPress={() => setShowMenu(false)}>
          <View style={styles.menuSheet}>
            <Pressable
              style={styles.menuItem}
              onPress={() => { setShowMenu(false); setShowProfile(true); }}
            >
              <Ionicons name="person-outline" size={20} color={colors.ink} />
              <Text style={styles.menuItemText}>프로필 보기</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable
              style={styles.menuItem}
              onPress={async () => {
                setShowMenu(false);
                if (await confirm("차단", "이 매칭을 차단하시겠어요?", "차단", true)) {
                  void blockMatch(match.id);
                  router.back();
                }
              }}
            >
              <Ionicons name="ban-outline" size={20} color="#E55" />
              <Text style={[styles.menuItemText, { color: "#E55" }]}>차단하기</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: 10
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  headerName: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  headerSub: { color: colors.muted, fontSize: 11, marginTop: 1 },
  menuBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 10
  },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.infoBanner,
    borderWidth: 1,
    borderColor: colors.infoBannerBorder,
    borderRadius: 12,
    marginHorizontal: 18,
    padding: 12
  },
  noticeText: { flex: 1, color: colors.infoBannerText, fontSize: 12, lineHeight: 18 },
  messages: { flex: 1 },
  messagesContent: { padding: 18, gap: 10, justifyContent: "flex-end" },
  bubble: { maxWidth: "78%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  myBubble: { alignSelf: "flex-end", backgroundColor: colors.blushLight },
  otherBubble: { alignSelf: "flex-start", backgroundColor: colors.chatBubble },
  bubbleText: { color: colors.ink, fontSize: 14, lineHeight: 20 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    marginHorizontal: 14,
    marginBottom: 10,
    paddingHorizontal: 8,
    minHeight: 52
  },
  plusBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  input: { flex: 1, color: colors.ink, fontSize: 14, maxHeight: 100 },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.blush
  },
  sendBtnDisabled: { backgroundColor: colors.line },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: colors.muted, fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingBottom: 8,
    maxHeight: "80%",
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
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  sheetTitle: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  profileSection: { alignItems: "center", gap: 8, paddingVertical: 16 },
  profileMeta: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  profileJob: { color: colors.body, fontSize: 14 },
  bioCard: { marginBottom: 12, gap: 8 },
  valuesCard: { marginBottom: 24, gap: 10 },
  bioTitle: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  bioText: { color: colors.body, fontSize: 13, lineHeight: 20 },
  bioTextEmpty: { color: colors.muted, fontStyle: "italic" },
  introRow: { gap: 4, marginTop: 8 },
  introLabel: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  summaryWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  summaryPill: {
    color: colors.blushDark,
    backgroundColor: colors.blushLight,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: "600"
  },
  menuOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-end" },
  menuSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 8,
    paddingBottom: 32,
    ...shadow
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 22,
    paddingVertical: 16
  },
  menuItemText: { color: colors.ink, fontSize: 16 },
  menuDivider: { height: 1, backgroundColor: colors.line, marginHorizontal: 22 }
});
