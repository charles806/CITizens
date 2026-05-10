import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/expo";
import React from "react";
import "../../global.css"

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
