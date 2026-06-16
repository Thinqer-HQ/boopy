import "react-native-url-polyfill/auto";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { initDB } from "../lib/db";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider databaseName="boopy.db" onInit={initDB}>
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
  );
}
