import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllSettings } from "../../lib/db";
import { supabase } from "../../lib/supabase";
import { COLORS } from "../../lib/utils";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://www.useboopy.com";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  // Check auth on mount
  useState(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
  });

  const settings = getAllSettings(db);
  const isSignedIn = !!settings.user_id || !!session;

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      const token = currentSession?.access_token;

      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const reply =
        data.reply ?? data.message ?? data.content ?? "Sorry, I could not process that.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I couldn't reach the server. Make sure you're signed in and connected to the internet.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Boopy AI</Text>
        </View>
        <View style={styles.gateContainer}>
          <View style={styles.gateCard}>
            <Ionicons name="sparkles" size={48} color={COLORS.brand} />
            <Text style={styles.gateTitle}>AI spending insights</Text>
            <Text style={styles.gateText}>
              Sign in to your Boopy account to ask questions about your subscriptions, get spending
              breakdowns, and receive personalized recommendations.
            </Text>
            <TouchableOpacity style={styles.signInBtn} onPress={() => router.push("/auth/login")}>
              <Text style={styles.signInBtnText}>Sign in to use AI</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Boopy AI</Text>
        {messages.length > 0 && (
          <TouchableOpacity onPress={() => setMessages([])}>
            <Text style={{ color: COLORS.brand, fontSize: 13, fontWeight: "600" }}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <View style={styles.welcome}>
              <Ionicons name="sparkles-outline" size={32} color={COLORS.brand} />
              <Text style={styles.welcomeTitle}>Ask me anything</Text>
              <Text style={styles.welcomeText}>
                About your subscriptions, spending, or upcoming renewals.
              </Text>
              {[
                "What's my biggest subscription expense?",
                "Which subscriptions renew this month?",
                "How much am I spending yearly?",
              ].map((q) => (
                <TouchableOpacity
                  key={q}
                  style={styles.suggestion}
                  onPress={() => {
                    setInput(q);
                  }}
                >
                  <Text style={styles.suggestionText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {messages.map((m, i) => (
            <View
              key={i}
              style={[styles.bubble, m.role === "user" ? styles.userBubble : styles.aiBubble]}
            >
              {m.role === "assistant" && (
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={12} color="#fff" />
                </View>
              )}
              <Text
                style={[styles.bubbleText, m.role === "user" ? styles.userText : styles.aiText]}
              >
                {m.content}
              </Text>
            </View>
          ))}

          {loading && (
            <View style={[styles.bubble, styles.aiBubble]}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={12} color="#fff" />
              </View>
              <ActivityIndicator size="small" color={COLORS.brand} />
            </View>
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.inputField}
            placeholder="Ask about your subscriptions…"
            placeholderTextColor={COLORS.muted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.4 }]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  gateContainer: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  gateCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gateTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text, marginTop: 16 },
  gateText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  signInBtn: {
    marginTop: 20,
    backgroundColor: COLORS.brand,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
  },
  signInBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  welcome: { alignItems: "center", paddingVertical: 24, gap: 8 },
  welcomeTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginTop: 8 },
  welcomeText: { fontSize: 13, color: COLORS.muted, textAlign: "center" },
  suggestion: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: "100%",
  },
  suggestionText: { fontSize: 13, color: COLORS.brand, fontWeight: "500" },
  bubble: { flexDirection: "row", alignItems: "flex-start", gap: 8, maxWidth: "90%" },
  userBubble: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  aiBubble: { alignSelf: "flex-start" },
  aiAvatar: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: COLORS.brand,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    overflow: "hidden",
  },
  userText: { backgroundColor: COLORS.brand, color: "#fff", borderBottomRightRadius: 4 },
  aiText: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  inputField: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.brand,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
