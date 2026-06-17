import "react-native-url-polyfill/auto";
import { useEffect } from "react";
import { AppState } from "react-native";
import { Stack } from "expo-router";
import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { initDB } from "../lib/db";
import { log } from "../lib/logger";
import { ErrorBoundary } from "../components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

function initDBWithLogging(db: SQLiteDatabase) {
  try {
    log.info("DB init start");
    initDB(db);
    log.info("DB init OK");
  } catch (e) {
    log.error("DB init FAILED:", e);
    throw e;
  }
}

export default function RootLayout() {
  useEffect(() => {
    log.info("RootLayout mounted");
    SplashScreen.hideAsync();

    // Catch unhandled JS errors that escape React (e.g. in setTimeout, event callbacks)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const RNErrorUtils = (global as any).ErrorUtils;
    if (RNErrorUtils) {
      const prev = RNErrorUtils.getGlobalHandler();
      RNErrorUtils.setGlobalHandler((error: Error, isFatal: boolean) => {
        log.error(
          `Unhandled ${isFatal ? "FATAL " : ""}JS error: ${error?.message}\n${error?.stack ?? ""}`
        );
        prev?.(error, isFatal);
      });
    }

    // Track foreground/background transitions
    const appSub = AppState.addEventListener("change", (nextState) => {
      log.info("AppState →", nextState);
    });

    return () => {
      appSub.remove();
    };
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SQLiteProvider databaseName="boopy.db" onInit={initDBWithLogging}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal/add"
              options={{
                presentation: "modal",
                headerShown: true,
                title: "Add Subscription",
                headerTintColor: "#6d5df6",
                headerTitleStyle: { fontWeight: "700" },
              }}
            />
            <Stack.Screen
              name="subscription/[id]"
              options={{
                headerShown: true,
                title: "Edit Subscription",
                headerTintColor: "#6d5df6",
                headerTitleStyle: { fontWeight: "700" },
              }}
            />
            <Stack.Screen
              name="auth/login"
              options={{
                presentation: "modal",
                headerShown: true,
                title: "Sign In",
                headerTintColor: "#6d5df6",
                headerTitleStyle: { fontWeight: "700" },
              }}
            />
          </Stack>
        </SQLiteProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
