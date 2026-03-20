import { Stack } from "expo-router";
import React from "react";
import Colors from "@/constants/colors";

export default function SettingsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "700" as const,
          fontSize: 18,
          color: Colors.text,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Settings" }}
      />
    </Stack>
  );
}
