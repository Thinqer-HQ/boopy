import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { setSetting } from "../../lib/db";
import { COLORS } from "../../lib/utils";

export default function LoginScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  async function handleSubmit() {
    if (!email.trim() || !password) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      let result;
      if (mode === "login") {
        result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      } else {
        result = await supabase.auth.signUp({ email: email.trim(), password });
      }

      const { data, error } = result;
      if (error) throw error;

      const userId = data.user?.id ?? data.session?.user.id;
      if (userId) {
        setSetting(db, "user_id", userId);
      }

      router.back();
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.logoWrap}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>B</Text>
            </View>
            <Text style={styles.appName}>Boopy</Text>
            <Text style={styles.tagline}>Sign in to sync your subscriptions across devices</Text>
          </View>

          {/* Mode toggle */}
          <View style={styles.modeToggle}>
            {(["login", "signup"] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
                onPress={() => setMode(m)}
              >
                <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
                  {m === "login" ? "Sign in" : "Create account"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              style={[
                styles.input,
                {
                  flex: 1,
                  marginBottom: 0,
                  borderRightWidth: 0,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                },
              ]}
              placeholder="••••••••"
              placeholderTextColor={COLORS.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete={mode === "login" ? "password" : "new-password"}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={COLORS.muted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>
                {mode === "login" ? "Sign in" : "Create account"}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            {mode === "login" ? "No account? " : "Already have an account? "}
            <Text
              style={{ color: COLORS.brand, fontWeight: "700" }}
              onPress={() => setMode((m) => (m === "login" ? "signup" : "login"))}
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </Text>
          </Text>

          <View style={styles.localNote}>
            <Ionicons name="phone-portrait-outline" size={14} color={COLORS.muted} />
            <Text style={styles.localNoteText}>
              Your local data is safe. Signing in only adds cloud sync — you can use Boopy offline
              without an account.
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, justifyContent: "center", padding: 20 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoWrap: { alignItems: "center", marginBottom: 20 },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.brand,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoText: { fontSize: 22, fontWeight: "800", color: "#fff" },
  appName: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  tagline: { fontSize: 13, color: COLORS.muted, textAlign: "center", marginTop: 4 },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    marginBottom: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeBtn: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 10 },
  modeBtnActive: { backgroundColor: COLORS.brand },
  modeBtnText: { fontSize: 13, fontWeight: "600", color: COLORS.muted },
  modeBtnTextActive: { color: "#fff" },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 0,
  },
  passwordWrap: { flexDirection: "row", marginBottom: 0 },
  eyeBtn: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtn: {
    backgroundColor: COLORS.brand,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  note: { textAlign: "center", marginTop: 16, fontSize: 13, color: COLORS.muted },
  localNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  localNoteText: { fontSize: 12, color: COLORS.muted, flex: 1, lineHeight: 16 },
});
