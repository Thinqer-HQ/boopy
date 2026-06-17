import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { log } from "../lib/logger";

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    log.error("ErrorBoundary caught:", error.message, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>App crashed</Text>
        <Text style={styles.hint}>Screenshot this screen and share it for debugging</Text>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.label}>Error</Text>
          <Text style={styles.errorName}>{error.name}</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          {!!error.stack && (
            <>
              <Text style={styles.label}>Stack trace</Text>
              <Text style={styles.stack}>{error.stack}</Text>
            </>
          )}
        </ScrollView>
        <TouchableOpacity style={styles.btn} onPress={this.reset}>
          <Text style={styles.btnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#e53e3e",
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: "#888",
    marginBottom: 20,
  },
  scroll: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 14,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 4,
  },
  errorName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#c53030",
  },
  errorMessage: {
    fontSize: 13,
    color: "#333",
    lineHeight: 20,
  },
  stack: {
    fontSize: 10,
    color: "#555",
    fontFamily: "monospace",
    lineHeight: 16,
  },
  btn: {
    backgroundColor: "#6d5df6",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
