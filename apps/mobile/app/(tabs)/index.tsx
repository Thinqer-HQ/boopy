import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getActiveSubscriptions, getAllSettings } from "../../lib/db";
import {
  COLORS,
  formatCurrency,
  getTotalMonthly,
  toYearly,
  formatDate,
  daysUntil,
  getRenewalLabel,
  getVendorInitial,
  getVendorColor,
  cadenceLabel,
} from "../../lib/utils";
import type { Subscription } from "../../lib/types";

export default function DashboardScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [currency, setCurrency] = useState("USD");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    const active = getActiveSubscriptions(db);
    const settings = getAllSettings(db);
    setSubs(active);
    setCurrency(settings.default_currency);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
    setRefreshing(false);
  };

  const monthly = getTotalMonthly(subs);
  const yearly = subs
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + toYearly(s.amount, s.cadence), 0);

  const upcoming = subs
    .filter((s) => {
      const d = daysUntil(s.renewal_date);
      return d !== null && d >= 0 && d <= 30;
    })
    .sort((a, b) => (daysUntil(a.renewal_date) ?? 999) - (daysUntil(b.renewal_date) ?? 999))
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.brand} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>Boopy</Text>
            <Text style={styles.subtitle}>Subscription tracker</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push("/modal/add")}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Monthly spend</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(monthly, currency)}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemValue}>{subs.length}</Text>
              <Text style={styles.summaryItemLabel}>Active</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemValue}>{formatCurrency(yearly, currency)}</Text>
              <Text style={styles.summaryItemLabel}>Per year</Text>
            </View>
          </View>
        </View>

        {/* Upcoming renewals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming renewals</Text>
          {upcoming.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>No renewals in the next 30 days</Text>
            </View>
          ) : (
            upcoming.map((s) => {
              const days = daysUntil(s.renewal_date);
              const isUrgent = days !== null && days <= 3;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={styles.renewalRow}
                  onPress={() => router.push(`/subscription/${s.id}`)}
                >
                  <View
                    style={[styles.vendorIcon, { backgroundColor: getVendorColor(s.vendor_name) }]}
                  >
                    <Text style={styles.vendorInitial}>{getVendorInitial(s.vendor_name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.renewalName}>{s.vendor_name}</Text>
                    <Text style={[styles.renewalDate, isUrgent && { color: COLORS.red }]}>
                      {getRenewalLabel(s.renewal_date)}
                    </Text>
                  </View>
                  <Text style={styles.renewalAmount}>
                    {formatCurrency(s.amount, s.currency)}
                    {cadenceLabel(s.cadence)}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* All active subs */}
        {subs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All subscriptions</Text>
            {subs.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.renewalRow}
                onPress={() => router.push(`/subscription/${s.id}`)}
              >
                <View
                  style={[styles.vendorIcon, { backgroundColor: getVendorColor(s.vendor_name) }]}
                >
                  <Text style={styles.vendorInitial}>{getVendorInitial(s.vendor_name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.renewalName}>{s.vendor_name}</Text>
                  <Text style={styles.renewalDate}>{formatDate(s.renewal_date)}</Text>
                </View>
                <Text style={styles.renewalAmount}>
                  {formatCurrency(s.amount, s.currency)}
                  {cadenceLabel(s.cadence)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {subs.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="repeat-outline" size={48} color={COLORS.muted} />
            <Text style={styles.emptyStateTitle}>No subscriptions yet</Text>
            <Text style={styles.emptyStateText}>Tap + to add your first subscription</Text>
            <TouchableOpacity
              style={styles.emptyStateBtn}
              onPress={() => router.push("/modal/add")}
            >
              <Text style={styles.emptyStateBtnText}>Add subscription</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 24 }} />
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
    paddingBottom: 16,
  },
  appName: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  subtitle: { fontSize: 12, color: COLORS.muted, marginTop: 1 },
  addBtn: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.brand,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.brand,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  summaryLabel: { fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: "500" },
  summaryAmount: { fontSize: 36, fontWeight: "800", color: "#fff", marginTop: 4, marginBottom: 20 },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryItemValue: { fontSize: 16, fontWeight: "700", color: "#fff" },
  summaryItemLabel: { fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  summaryDivider: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.25)" },
  section: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    padding: 16,
    paddingBottom: 8,
  },
  emptySection: { padding: 16, alignItems: "center" },
  emptyText: { color: COLORS.muted, fontSize: 13 },
  renewalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  vendorIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  vendorInitial: { fontSize: 16, fontWeight: "700", color: "#fff" },
  renewalName: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  renewalDate: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  renewalAmount: { fontSize: 13, fontWeight: "700", color: COLORS.text },
  emptyState: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 32 },
  emptyStateTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginTop: 16 },
  emptyStateText: { fontSize: 14, color: COLORS.muted, marginTop: 6, textAlign: "center" },
  emptyStateBtn: {
    marginTop: 20,
    backgroundColor: COLORS.brand,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyStateBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
