import { Stack } from "expo-router";
import { View, Text, ActivityIndicator, Modal } from "react-native";
import React from "react";
import { useAuth } from "@clerk/clerk-expo";

export default function Layout() {
  const { isLoaded, isSignedIn } = useAuth();
  console.log("isSignedIn", isSignedIn);

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="weather"
          options={{
            headerShown: false,
            presentation: "modal",
            gestureEnabled: true,
            animationTypeForReplace: "push",
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
