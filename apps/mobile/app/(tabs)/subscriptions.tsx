import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllSubscriptions, softDeleteSubscription } from "../../lib/db";
import {
  COLORS,
  formatCurrency,
  cadenceLabel,
  formatDate,
  getVendorInitial,
  getVendorColor,
} from "../../lib/utils";
import type { Subscription, SubStatus } from "../../lib/types";

const STATUS_TABS: { key: SubStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "paused", label: "Paused" },
  { key: "canceled", label: "Canceled" },
];

export default function SubscriptionsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [filter, setFilter] = useState<SubStatus | "all">("all");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setSubs(getAllSubscriptions(db));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function handleDelete(sub: Subscription) {
    Alert.alert("Delete subscription", `Remove ${sub.vendor_name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          softDeleteSubscription(db, sub.id);
          load();
        },
      },
    ]);
  }

  const filtered = subs.filter((s) => {
    const matchStatus = filter === "all" || s.status === filter;
    const matchSearch = s.vendor_name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Subscriptions</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push("/modal/add")}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={COLORS.muted} style={{ marginLeft: 12 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search subscriptions…"
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")} style={{ paddingRight: 12 }}>
            <Ionicons name="close-circle" size={16} color={COLORS.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {STATUS_TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.filterTab, filter === t.key && styles.filterTabActive]}
            onPress={() => setFilter(t.key)}
          >
            <Text style={[styles.filterTabText, filter === t.key && styles.filterTabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 10 }}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="repeat-outline" size={40} color={COLORS.muted} />
            <Text style={styles.emptyTitle}>No subscriptions found</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/modal/add")}>
              <Text style={styles.emptyBtnText}>Add subscription</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((s) => (
            <View key={s.id} style={styles.card}>
              <TouchableOpacity
                style={styles.cardInner}
                onPress={() => router.push(`/subscription/${s.id}`)}
              >
                <View style={[styles.icon, { backgroundColor: getVendorColor(s.vendor_name) }]}>
                  <Text style={styles.iconText}>{getVendorInitial(s.vendor_name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{s.vendor_name}</Text>
                  <Text style={styles.meta}>
                    {s.category ? `${s.category} · ` : ""}
                    {formatDate(s.renewal_date)}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <Text style={styles.amount}>
                    {formatCurrency(s.amount, s.currency)}
                    {cadenceLabel(s.cadence)}
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          s.status === "active"
                            ? COLORS.greenBg
                            : s.status === "paused"
                              ? COLORS.yellowBg
                              : COLORS.redBg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color:
                            s.status === "active"
                              ? "#065f46"
                              : s.status === "paused"
                                ? COLORS.yellow
                                : COLORS.red,
                        },
                      ]}
                    >
                      {s.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(s)}>
                <Ionicons name="trash-outline" size={16} color={COLORS.red} />
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  addBtn: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.brand,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  filterBar: { marginBottom: 4 },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  filterTabText: { fontSize: 13, fontWeight: "600", color: COLORS.muted },
  filterTabTextActive: { color: "#fff" },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  cardInner: { flex: 1, flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  iconText: { fontSize: 18, fontWeight: "700", color: "#fff" },
  name: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  meta: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  amount: { fontSize: 13, fontWeight: "700", color: COLORS.text },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: "700", textTransform: "capitalize" },
  deleteBtn: {
    paddingHorizontal: 16,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: COLORS.muted, marginTop: 12 },
  emptyBtn: {
    marginTop: 16,
    backgroundColor: COLORS.brand,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
