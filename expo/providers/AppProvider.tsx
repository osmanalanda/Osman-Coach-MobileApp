import { useState, useEffect, useCallback, useMemo } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import createContextHook from "@nkzw/create-context-hook";
import {
  requestNotificationPermissions,
  scheduleAllNotifications,
  cancelAllNotifications,
} from "@/utils/notifications";
import { callClaudeAPI, getFallbackMessage } from "@/utils/claude-api";

const API_KEY_STORAGE = "osman_coach_api_key";
const NOTIF_ENABLED_KEY = "osman_coach_notif_enabled";
const HISTORY_KEY = "osman_coach_history";

export interface HistoryEntry {
  id: string;
  slotId: string;
  label: string;
  message: string;
  timestamp: string;
}

async function getSecure(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function setSecure(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteSecure(key: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const [AppProvider, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [apiKey, setApiKeyState] = useState<string>("");
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const apiKeyQuery = useQuery({
    queryKey: ["apiKey"],
    queryFn: async () => {
      const key = await getSecure(API_KEY_STORAGE);
      return key ?? "";
    },
    staleTime: Infinity,
  });

  const notifQuery = useQuery({
    queryKey: ["notifEnabled"],
    queryFn: async () => {
      const val = await AsyncStorage.getItem(NOTIF_ENABLED_KEY);
      return val === "true";
    },
    staleTime: Infinity,
  });

  const historyQuery = useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      return stored ? (JSON.parse(stored) as HistoryEntry[]) : [];
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (apiKeyQuery.data !== undefined) {
      setApiKeyState(apiKeyQuery.data);
    }
  }, [apiKeyQuery.data]);

  useEffect(() => {
    if (notifQuery.data !== undefined) {
      setNotificationsEnabled(notifQuery.data);
    }
  }, [notifQuery.data]);

  useEffect(() => {
    if (historyQuery.data !== undefined) {
      setHistory(historyQuery.data);
    }
  }, [historyQuery.data]);

  const saveApiKeyMutation = useMutation({
    mutationFn: async (key: string) => {
      if (key.trim()) {
        await setSecure(API_KEY_STORAGE, key.trim());
      } else {
        await deleteSecure(API_KEY_STORAGE);
      }
      return key.trim();
    },
    onSuccess: (key) => {
      setApiKeyState(key);
      queryClient.setQueryData(["apiKey"], key);
      console.log("[AppProvider] API key saved");
    },
  });

  const toggleNotificationsMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (enabled) {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          console.log("[AppProvider] Notification permission denied");
          return false;
        }
        await scheduleAllNotifications();
      } else {
        await cancelAllNotifications();
      }
      await AsyncStorage.setItem(NOTIF_ENABLED_KEY, String(enabled));
      return enabled;
    },
    onSuccess: (enabled) => {
      setNotificationsEnabled(enabled);
      queryClient.setQueryData(["notifEnabled"], enabled);
      console.log("[AppProvider] Notifications:", enabled);
    },
  });

  const generateMessageMutation = useMutation({
    mutationFn: async ({
      slotId,
      label,
      hour,
    }: {
      slotId: string;
      label: string;
      hour: number;
    }) => {
      const now = new Date();
      const dayNames = [
        "Sunday", "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday",
      ];
      const dayOfWeek = dayNames[now.getDay()];
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      let message: string;
      if (apiKey) {
        try {
          message = await callClaudeAPI(apiKey, timeStr, dayOfWeek);
        } catch (e) {
          console.error("[AppProvider] Claude API failed, using fallback:", e);
          message = getFallbackMessage(hour, dayOfWeek);
        }
      } else {
        message = getFallbackMessage(hour, dayOfWeek);
      }

      const entry: HistoryEntry = {
        id: `${slotId}-${Date.now()}`,
        slotId,
        label,
        message,
        timestamp: now.toISOString(),
      };

      const updated = [entry, ...history].slice(0, 50);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return { entry, updated };
    },
    onSuccess: ({ updated }) => {
      setHistory(updated);
      queryClient.setQueryData(["history"], updated);
    },
  });

  const saveApiKey = useCallback(
    (key: string) => saveApiKeyMutation.mutate(key),
    [saveApiKeyMutation]
  );

  const toggleNotifications = useCallback(
    (enabled: boolean) => toggleNotificationsMutation.mutate(enabled),
    [toggleNotificationsMutation]
  );

  const generateMessage = useCallback(
    (slotId: string, label: string, hour: number) =>
      generateMessageMutation.mutate({ slotId, label, hour }),
    [generateMessageMutation]
  );

  return useMemo(
    () => ({
      apiKey,
      notificationsEnabled,
      history,
      isLoading: apiKeyQuery.isLoading || notifQuery.isLoading || historyQuery.isLoading,
      isSavingKey: saveApiKeyMutation.isPending,
      isTogglingNotifications: toggleNotificationsMutation.isPending,
      isGenerating: generateMessageMutation.isPending,
      saveApiKey,
      toggleNotifications,
      generateMessage,
    }),
    [
      apiKey,
      notificationsEnabled,
      history,
      apiKeyQuery.isLoading,
      notifQuery.isLoading,
      historyQuery.isLoading,
      saveApiKeyMutation.isPending,
      toggleNotificationsMutation.isPending,
      generateMessageMutation.isPending,
      saveApiKey,
      toggleNotifications,
      generateMessage,
    ]
  );
});
