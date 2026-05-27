import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { SubPageHeader } from "@/components/SubPageHeader";
import { colors } from "@/constants/colors";
import { notify } from "@/services/confirm";

const STORE_KEY = "soge.blockedContacts";

const normalize = (raw: string): string => raw.replace(/\D/g, "");

const dedupe = (arr: string[]): string[] => Array.from(new Set(arr.filter((s) => s.length >= 9)));

export default function NoAcquaintanceScreen() {
  const [blocked, setBlocked] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void AsyncStorage.getItem(STORE_KEY)
      .then((raw) => {
        if (raw !== null) {
          try {
            const parsed = JSON.parse(raw) as string[];
            if (Array.isArray(parsed)) setBlocked(parsed);
          } catch {
            // ignore
          }
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  const persist = async (next: string[]): Promise<void> => {
    setBlocked(next);
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(next));
  };

  const importContacts = async () => {
    if (importing) return;
    if (Platform.OS === "web") {
      notify("지원되지 않음", "주소록 가져오기는 모바일에서만 사용할 수 있어요.");
      return;
    }
    setImporting(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        notify("권한 필요", "주소록 접근을 허용해야 차단할 수 있어요.");
        return;
      }
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
        pageSize: 0
      });
      const numbers = data
        .flatMap((c) => c.phoneNumbers ?? [])
        .map((p) => normalize(p.number ?? ""))
        .filter((n) => n.length > 0);
      const next = dedupe([...blocked, ...numbers]);
      await persist(next);
      notify("주소록 동기화 완료", `${next.length}명의 연락처가 차단 목록에 추가됐어요.`);
    } catch (err) {
      notify("불러오기 실패", err instanceof Error ? err.message : "다시 시도해주세요");
    } finally {
      setImporting(false);
    }
  };

  const clearAll = async () => {
    await persist([]);
    notify("초기화 완료", "차단 목록을 비웠어요.");
  };

  return (
    <Screen scroll={false}>
      <SubPageHeader title="아는 사람 만나지 않기" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="shield-checkmark" size={26} color={colors.blush} />
          </View>
          <View style={styles.statText}>
            <Text style={styles.statTitle}>주소록 차단</Text>
            <Text style={styles.statDesc}>주소록에 저장된 사람과 매칭되지 않게 해요.</Text>
          </View>
          <Text style={styles.statCount}>{blocked.length}</Text>
        </Card>

        <View style={styles.actions}>
          <AppButton
            label={importing ? "가져오는 중…" : blocked.length === 0 ? "주소록 가져오기" : "주소록 다시 동기화"}
            onPress={importContacts}
            disabled={importing || !loaded}
          />
          {blocked.length > 0 && (
            <Pressable onPress={clearAll} style={styles.clearBtn} disabled={importing}>
              <Ionicons name="trash-outline" size={14} color={colors.muted} />
              <Text style={styles.clearText}>차단 목록 초기화</Text>
            </Pressable>
          )}
        </View>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>이렇게 동작해요</Text>
          <Text style={styles.infoText}>
            1) 주소록의 전화번호를 디바이스에서만 정규화해서 보관해요.{"\n"}
            2) 다른 사용자가 같은 번호로 가입돼 있으면 매칭에서 자동으로 빠져요.{"\n"}
            3) 번호는 서버로 평문 전송하지 않아요.
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 32 },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18
  },
  statIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.surfaceWarm,
    alignItems: "center", justifyContent: "center"
  },
  statText: { flex: 1, gap: 4 },
  statTitle: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  statDesc: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  statCount: { color: colors.blushDark, fontSize: 24, fontWeight: "800" },

  actions: { gap: 8 },
  clearBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 10
  },
  clearText: { color: colors.muted, fontSize: 12, fontWeight: "700" },

  infoCard: { gap: 8, padding: 18 },
  infoTitle: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  infoText: { color: colors.muted, fontSize: 12, lineHeight: 20 }
});
