import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllSettings, setSetting } from "../../lib/db";
import { supabase } from "../../lib/supabase";
import { syncToCloud } from "../../lib/sync";
import { COLORS, timeAgo, formatDate } from "../../lib/utils";
import { CURRENCIES } from "../../lib/types";
import type { AppSettings } from "../../lib/types";

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>({
    default_currency: "USD",
    notifications_enabled: "true",
    user_id: null,
    last_synced: null,
  });
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(() => {
    const s = getAllSettings(db);
    setSettings(s);
    if (s.user_id) {
      supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    } else {
      setUserEmail(null);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function toggleNotifications(val: boolean) {
    setSetting(db, "notifications_enabled", val ? "true" : "false");
    setSettings((prev) => ({ ...prev, notifications_enabled: val ? "true" : "false" }));
  }

  function setCurrency(currency: string) {
    setSetting(db, "default_currency", currency);
    setSettings((prev) => ({ ...prev, default_currency: currency }));
  }

  async function handleSync() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }

    // Get workspace ID — try fetching from the API
    setSyncing(true);
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL ?? "https://www.useboopy.com"}/api/workspace`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      const data = await res.json();
      const workspaceId = data.workspace?.id ?? data.id;
      if (!workspaceId) throw new Error("No workspace found");

      const result = await syncToCloud(db, workspaceId);
      if (result.error) {
        Alert.alert("Sync failed", result.error);
      } else {
        Alert.alert(
          "Sync complete",
          `Pushed ${result.pushed}, pulled ${result.pulled} subscriptions.`
        );
        load();
      }
    } catch (e) {
      Alert.alert("Sync failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSyncing(false);
    }
  }

  async function handleSignOut() {
    Alert.alert("Sign out", "You will stay in local mode. Your data will not be deleted.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          setSetting(db, "user_id", null);
          setSetting(db, "last_synced", null);
          load();
        },
      },
    ]);
  }

  const isSignedIn = !!settings.user_id || !!userEmail;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Cloud sync */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Cloud sync</Text>
          {isSignedIn ? (
            <>
              <Row
                icon="person-circle-outline"
                label="Signed in as"
                value={userEmail ?? settings.user_id ?? "—"}
              />
              <Row
                icon="time-outline"
                label="Last synced"
                value={settings.last_synced ? timeAgo(settings.last_synced) : "Never"}
              />
              <TouchableOpacity style={styles.row} onPress={handleSync} disabled={syncing}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={20}
                  color={COLORS.brand}
                  style={styles.rowIcon}
                />
                <Text style={[styles.rowLabel, { color: COLORS.brand }]}>
                  {syncing ? "Syncing…" : "Sync now"}
                </Text>
                {syncing && (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.brand}
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.row} onPress={handleSignOut}>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={COLORS.red}
                  style={styles.rowIcon}
                />
                <Text style={[styles.rowLabel, { color: COLORS.red }]}>Sign out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.syncCta}>
                <Ionicons name="cloud-outline" size={32} color={COLORS.muted} />
                <Text style={styles.syncCtaTitle}>Local mode</Text>
                <Text style={styles.syncCtaText}>
                  Your data is stored on this device. Sign in to sync with your Boopy web account.
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.row, { borderTopWidth: 1, borderTopColor: COLORS.border }]}
                onPress={() => router.push("/auth/login")}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={20}
                  color={COLORS.brand}
                  style={styles.rowIcon}
                />
                <Text style={[styles.rowLabel, { color: COLORS.brand, fontWeight: "700" }]}>
                  Sign in &amp; sync
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.muted}
                  style={{ marginLeft: "auto" }}
                />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Currency */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Default currency</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.currencyList}
          >
            {CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.currencyChip,
                  settings.default_currency === c && styles.currencyChipActive,
                ]}
                onPress={() => setCurrency(c)}
              >
                <Text
                  style={[
                    styles.currencyText,
                    settings.default_currency === c && styles.currencyTextActive,
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notifications</Text>
          <View style={styles.row}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color={COLORS.text}
              style={styles.rowIcon}
            />
            <Text style={styles.rowLabel}>Renewal reminders</Text>
            <Switch
              value={settings.notifications_enabled === "true"}
              onValueChange={toggleNotifications}
              trackColor={{ false: COLORS.border, true: COLORS.brand }}
              thumbColor="#fff"
              style={{ marginLeft: "auto" }}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>About</Text>
          <Row icon="information-circle-outline" label="Version" value="1.0.0" />
          <Row icon="globe-outline" label="Website" value="useboopy.com" />
          <Row icon="mail-outline" label="Support" value="support@boopy.app" />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon as "add"} size={20} color={COLORS.muted} style={styles.rowIcon} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rowIcon: { marginRight: 12 },
  rowLabel: { fontSize: 14, color: COLORS.text, flex: 1 },
  rowValue: { fontSize: 13, color: COLORS.muted },
  syncCta: { alignItems: "center", padding: 24, gap: 8 },
  syncCtaTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  syncCtaText: { fontSize: 13, color: COLORS.muted, textAlign: "center", lineHeight: 18 },
  currencyList: { padding: 12, gap: 8 },
  currencyChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currencyChipActive: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  currencyText: { fontSize: 13, fontWeight: "600", color: COLORS.muted },
  currencyTextActive: { color: "#fff" },
});
