import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import {
  Key,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  Save,
  Shield,
  Info,
  Trash2,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/providers/AppProvider";

export default function SettingsScreen() {
  const {
    apiKey,
    notificationsEnabled,
    isTogglingNotifications,
    isSavingKey,
    saveApiKey,
    toggleNotifications,
    history,
  } = useApp();

  const [keyInput, setKeyInput] = useState<string>("");
  const [showKey, setShowKey] = useState<boolean>(false);
  const [hasChanged, setHasChanged] = useState<boolean>(false);

  useEffect(() => {
    if (apiKey && !hasChanged) {
      setKeyInput(apiKey);
    }
  }, [apiKey, hasChanged]);

  const handleKeyChange = useCallback((text: string) => {
    setKeyInput(text);
    setHasChanged(true);
  }, []);

  const handleSave = useCallback(() => {
    if (Platform.OS !== "web") {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    saveApiKey(keyInput);
    setHasChanged(false);
    Alert.alert("Saved", "Your API key has been securely stored.");
  }, [keyInput, saveApiKey]);

  const handleClearKey = useCallback(() => {
    Alert.alert(
      "Clear API Key",
      "Are you sure you want to remove your API key?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setKeyInput("");
            saveApiKey("");
            setHasChanged(false);
          },
        },
      ]
    );
  }, [saveApiKey]);

  const handleToggleNotifications = useCallback(
    (value: boolean) => {
      if (Platform.OS !== "web") {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      toggleNotifications(value);
    },
    [toggleNotifications]
  );

  const displayValue = showKey
    ? keyInput
    : apiKey && !hasChanged
      ? `sk-ant-...${apiKey.slice(-8)}`
      : keyInput;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      testID="settings-screen"
    >
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Key size={18} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Anthropic API Key</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Your API key is stored securely on this device using encrypted storage.
          It never leaves your phone.
        </Text>

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={displayValue}
              onChangeText={handleKeyChange}
              placeholder="sk-ant-api03-..."
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showKey && !hasChanged}
              testID="api-key-input"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => {
                setShowKey((prev) => !prev);
                if (!showKey) setKeyInput(apiKey);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showKey ? (
                <EyeOff size={18} color={Colors.textTertiary} />
              ) : (
                <Eye size={18} color={Colors.textTertiary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!hasChanged || !keyInput.trim()) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!hasChanged || !keyInput.trim() || isSavingKey}
            activeOpacity={0.7}
            testID="save-key-button"
          >
            {isSavingKey ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Save size={14} color="#FFF" />
                <Text style={styles.saveButtonText}>Save Key</Text>
              </>
            )}
          </TouchableOpacity>

          {apiKey ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearKey}
              activeOpacity={0.7}
            >
              <Trash2 size={14} color={Colors.error} />
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.securityNote}>
          <Shield size={14} color={Colors.success} />
          <Text style={styles.securityText}>
            Encrypted with expo-secure-store
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          {notificationsEnabled ? (
            <Bell size={18} color={Colors.primary} />
          ) : (
            <BellOff size={18} color={Colors.textTertiary} />
          )}
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>
        <Text style={styles.sectionDescription}>
          When enabled, you'll receive coaching reminders at 9 scheduled times
          throughout the day. Notifications work even when the app is closed.
        </Text>

        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <Text style={styles.toggleLabel}>Push Notifications</Text>
            <Text style={styles.toggleSubtext}>
              {notificationsEnabled
                ? "9 daily coaching reminders active"
                : "Enable to receive coaching reminders"}
            </Text>
          </View>
          {isTogglingNotifications ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: "#E0DDD5", true: Colors.primaryMuted }}
              thumbColor={notificationsEnabled ? Colors.primary : "#FAFAFA"}
              testID="notifications-toggle"
            />
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Info size={18} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Fitness Plan</Text>
        </View>
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Cutting Phase</Text>
          <Text style={styles.planDetail}>~500 cal deficit daily</Text>
          <View style={styles.planDivider} />
          <Text style={styles.planSubheading}>Training Split</Text>
          <Text style={styles.planItem}>Mon: Chest + Triceps + HIIT</Text>
          <Text style={styles.planItem}>Tue: Back + Biceps + Cardio</Text>
          <Text style={styles.planItem}>Wed: Legs (Quads) + HIIT</Text>
          <Text style={styles.planItem}>Thu: Shoulders + Arms + Cardio</Text>
          <Text style={styles.planItem}>Fri: Legs (Hams/Glutes) + HIIT</Text>
          <Text style={styles.planItem}>Sat: Full Body + Cardio</Text>
          <Text style={styles.planItem}>Sun: Active Recovery</Text>
          <View style={styles.planDivider} />
          <Text style={styles.planSubheading}>Key Rules</Text>
          <Text style={styles.planItem}>3L+ water daily</Text>
          <Text style={styles.planItem}>7-8 hours sleep</Text>
          <Text style={styles.planItem}>High protein every meal</Text>
          <Text style={styles.planItem}>Minimal carbs at dinner</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{history.length}</Text>
            <Text style={styles.statLabel}>Messages Generated</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>claude-sonnet-4-20250514</Text>
            <Text style={styles.statLabel}>AI Model</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Osman Coach v1.0</Text>
        <Text style={styles.footerSubtext}>Built with Claude AI + Expo</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  sectionDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  inputRow: {
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    paddingVertical: 14,
  },
  eyeButton: {
    padding: 4,
  },
  buttonRow: {
    flexDirection: "row" as const,
    gap: 10,
    marginBottom: 10,
  },
  saveButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.textTertiary,
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  clearButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.errorLight,
    gap: 6,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.error,
  },
  securityNote: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  securityText: {
    fontSize: 12,
    color: Colors.success,
  },
  toggleRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  toggleLeft: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  toggleSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.primary,
    marginBottom: 2,
  },
  planDetail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  planDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 12,
  },
  planSubheading: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  planItem: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 22,
    paddingLeft: 8,
  },
  statsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 12,
  },
  statItem: {
    gap: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  footer: {
    alignItems: "center" as const,
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: "500" as const,
  },
  footerSubtext: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
