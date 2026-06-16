import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createSubscription, getAllSettings } from "../../lib/db";
import { COLORS, formatDate } from "../../lib/utils";
import { CURRENCIES, CATEGORIES, CADENCE_LABELS } from "../../lib/types";
import type { Cadence, SubStatus } from "../../lib/types";

const CADENCES: Cadence[] = ["weekly", "monthly", "quarterly", "yearly"];

export default function AddScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const settings = getAllSettings(db);

  const [vendorName, setVendorName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(settings.default_currency ?? "USD");
  const [cadence, setCadence] = useState<Cadence>("monthly");
  const [renewalDate, setRenewalDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<SubStatus>("active");

  function handleSave() {
    if (!vendorName.trim()) {
      Alert.alert("Required", "Please enter a service name.");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }

    createSubscription(db, {
      vendor_name: vendorName.trim(),
      amount: amt,
      currency,
      cadence,
      renewal_date: renewalDate ? renewalDate.toISOString().split("T")[0] : null,
      status,
      category,
      notes: notes.trim() || null,
      group_id: "default",
    });

    router.back();
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Field label="Service name *">
        <TextInput
          style={styles.input}
          placeholder="e.g. Netflix, Spotify, AWS"
          placeholderTextColor={COLORS.muted}
          value={vendorName}
          onChangeText={setVendorName}
          autoFocus
        />
      </Field>

      <Field label="Amount *">
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="0.00"
            placeholderTextColor={COLORS.muted}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6 }}
          >
            {CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, currency === c && styles.chipActive]}
                onPress={() => setCurrency(c)}
              >
                <Text style={[styles.chipText, currency === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Field>

      <Field label="Billing cycle">
        <View style={styles.segmented}>
          {CADENCES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.segment, cadence === c && styles.segmentActive]}
              onPress={() => setCadence(c)}
            >
              <Text style={[styles.segmentText, cadence === c && styles.segmentTextActive]}>
                {CADENCE_LABELS[c]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <Field label="Next renewal date">
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
          <Text style={{ color: renewalDate ? COLORS.text : COLORS.muted, fontSize: 14 }}>
            {renewalDate ? formatDate(renewalDate.toISOString()) : "Select date"}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={renewalDate ?? new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={new Date()}
            onChange={(_, date) => {
              setShowDatePicker(Platform.OS === "ios");
              if (date) setRenewalDate(date);
            }}
          />
        )}
        {Platform.OS === "ios" && showDatePicker && (
          <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.doneBtn}>
            <Text style={{ color: COLORS.brand, fontWeight: "700" }}>Done</Text>
          </TouchableOpacity>
        )}
      </Field>

      <Field label="Category">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => setCategory((prev) => (prev === cat ? null : cat))}
            >
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Field>

      <Field label="Status">
        <View style={styles.segmented}>
          {(["active", "paused"] as SubStatus[]).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.segment, status === s && styles.segmentActive]}
              onPress={() => setStatus(s)}
            >
              <Text style={[styles.segmentText, status === s && styles.segmentTextActive]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <Field label="Notes">
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: "top" }]}
          placeholder="Optional notes…"
          placeholderTextColor={COLORS.muted}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </Field>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save subscription</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  field: { marginBottom: 20 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  chipText: { fontSize: 12, fontWeight: "600", color: COLORS.muted },
  chipTextActive: { color: "#fff" },
  segmented: {
    flexDirection: "row",
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  segment: { flex: 1, paddingVertical: 10, alignItems: "center" },
  segmentActive: { backgroundColor: COLORS.brand },
  segmentText: { fontSize: 13, fontWeight: "600", color: COLORS.muted },
  segmentTextActive: { color: "#fff" },
  dateBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  doneBtn: { alignItems: "flex-end", paddingVertical: 8 },
  actions: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  cancelText: { fontSize: 15, fontWeight: "600", color: COLORS.muted },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.brand,
    alignItems: "center",
  },
  saveText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});
