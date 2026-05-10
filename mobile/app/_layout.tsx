import React from "react";
import { ClerkProvider } from "@clerk/expo";
import * as SecureStore from "expo-secure-store";
import { Stack } from "expo-router";
import "../global.css";

const tokenCache = {
  getToken: async (key: string) => {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  saveToken: async (key: string, token: string) => {
    try {
      return SecureStore.setItemAsync(key, token);
    } catch (err) {
      return;
    }
  },
  deleteToken: async (key: string) => {
    try {
      return SecureStore.deleteItemAsync(key);
    } catch (err) {
      return;
    }
  },
};

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    console.error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }
  
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey!}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
      </Stack>
    </ClerkProvider>
  );
}
