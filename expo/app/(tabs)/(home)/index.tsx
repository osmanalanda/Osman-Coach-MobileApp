import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import {
  Sun,
  UtensilsCrossed,
  Apple,
  Salad,
  Dumbbell,
  Zap,
  ChefHat,
  Moon,
  BedDouble,
  Play,
  CheckCircle,
  Clock,
  Flame,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { SCHEDULE, getTimeString, getSlotStatus } from "@/constants/schedule";
import type { ScheduleSlot } from "@/constants/schedule";
import { useApp } from "@/providers/AppProvider";

const ICON_MAP: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  Sun,
  UtensilsCrossed,
  Apple,
  Salad,
  Dumbbell,
  Zap,
  ChefHat,
  Moon,
  BedDouble,
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  meal: { bg: "#FFF3E0", text: "#E65100", dot: "#FF9800" },
  training: { bg: "#E8F5E9", text: "#1B5E20", dot: "#4CAF50" },
  motivation: { bg: "#FFF8E1", text: "#F57F17", dot: Colors.primary },
};

function getDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(date: Date): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

interface ScheduleCardProps {
  slot: ScheduleSlot;
  status: "completed" | "active" | "upcoming";
  isLast: boolean;
  onGenerate: () => void;
  isGenerating: boolean;
  latestMessage?: string;
}

const ScheduleCard = React.memo(function ScheduleCard({
  slot,
  status,
  isLast,
  onGenerate,
  isGenerating,
  latestMessage,
}: ScheduleCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const IconComponent = ICON_MAP[slot.icon] ?? Sun;
  const catColor = CATEGORY_COLORS[slot.category] ?? CATEGORY_COLORS.motivation;

  const handlePress = useCallback(() => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
    onGenerate();
  }, [onGenerate, scaleAnim]);

  return (
    <View style={styles.cardRow}>
      <View style={styles.timelineColumn}>
        <View
          style={[
            styles.timelineDot,
            status === "active" && styles.timelineDotActive,
            status === "completed" && styles.timelineDotCompleted,
          ]}
        >
          {status === "completed" ? (
            <CheckCircle size={12} color={Colors.success} />
          ) : status === "active" ? (
            <Flame size={12} color={Colors.primary} />
          ) : (
            <Clock size={10} color={Colors.textTertiary} />
          )}
        </View>
        {!isLast && (
          <View
            style={[
              styles.timelineLine,
              status === "completed" && styles.timelineLineCompleted,
            ]}
          />
        )}
      </View>

      <Animated.View
        style={[
          styles.card,
          status === "active" && styles.cardActive,
          status === "completed" && styles.cardCompleted,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <Text
              style={[
                styles.cardTime,
                status === "active" && styles.cardTimeActive,
                status === "completed" && styles.cardTimeCompleted,
              ]}
            >
              {getTimeString(slot)}
            </Text>
            <View style={[styles.categoryBadge, { backgroundColor: catColor.bg }]}>
              <View style={[styles.categoryDot, { backgroundColor: catColor.dot }]} />
              <Text style={[styles.categoryText, { color: catColor.text }]}>
                {slot.category}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: status === "active" ? Colors.primaryFaint : "#F5F5F2" },
            ]}
          >
            <IconComponent
              color={status === "active" ? Colors.primary : Colors.textTertiary}
              size={18}
            />
          </View>
        </View>

        <Text
          style={[
            styles.cardLabel,
            status === "completed" && styles.cardLabelCompleted,
          ]}
        >
          {slot.label}
        </Text>
        <Text style={styles.cardDescription}>{slot.description}</Text>

        {latestMessage ? (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{latestMessage}</Text>
          </View>
        ) : null}

        {status === "active" && (
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handlePress}
            disabled={isGenerating}
            activeOpacity={0.7}
            testID={`generate-${slot.id}`}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Play size={14} color="#FFF" />
                <Text style={styles.generateButtonText}>Get Coach Message</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
});

export default function HomeScreen() {
  const { history, isGenerating, generateMessage, apiKey, notificationsEnabled } = useApp();
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const getLatestMessage = useCallback(
    (slotId: string) => {
      const today = new Date().toDateString();
      const entry = history.find(
        (h) => h.slotId === slotId && new Date(h.timestamp).toDateString() === today
      );
      return entry?.message;
    },
    [history]
  );

  const completedCount = SCHEDULE.filter(
    (s) => getSlotStatus(s, now) === "completed"
  ).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      testID="home-screen"
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>{getDayGreeting()}, Osman</Text>
        <Text style={styles.date}>{formatDate(now)}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{SCHEDULE.length - completedCount}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: notificationsEnabled
                  ? Colors.success
                  : Colors.textTertiary,
              },
            ]}
          />
          <Text style={styles.statLabel}>
            {notificationsEnabled ? "Active" : "Paused"}
          </Text>
        </View>
      </View>

      {!apiKey && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            Add your Anthropic API key in Settings to get AI-powered coaching messages.
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Today's Schedule</Text>

      {SCHEDULE.map((slot, index) => (
        <ScheduleCard
          key={slot.id}
          slot={slot}
          status={getSlotStatus(slot, now)}
          isLast={index === SCHEDULE.length - 1}
          onGenerate={() => generateMessage(slot.id, slot.label, slot.hour)}
          isGenerating={isGenerating}
          latestMessage={getLatestMessage(slot.id)}
        />
      ))}

      <View style={styles.bottomSpacer} />
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
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row" as const,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  statCard: {
    flex: 1,
    alignItems: "center" as const,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.divider,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  warningBanner: {
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  warningText: {
    fontSize: 13,
    color: "#5D4037",
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 16,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  cardRow: {
    flexDirection: "row" as const,
    marginBottom: 4,
  },
  timelineColumn: {
    width: 28,
    alignItems: "center" as const,
    paddingTop: 18,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F0EDE6",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    zIndex: 1,
  },
  timelineDotActive: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  timelineDotCompleted: {
    backgroundColor: Colors.successLight,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.divider,
    marginTop: -2,
  },
  timelineLineCompleted: {
    backgroundColor: "#C8E6C9",
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginLeft: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  cardActive: {
    borderColor: Colors.upcomingBorder,
    backgroundColor: Colors.upcoming,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardCompleted: {
    opacity: 0.65,
  },
  cardHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  cardLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  cardTime: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    fontVariant: ["tabular-nums" as const],
  },
  cardTimeActive: {
    color: Colors.primary,
    fontWeight: "700" as const,
  },
  cardTimeCompleted: {
    color: Colors.textTertiary,
  },
  categoryBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600" as const,
    textTransform: "capitalize" as const,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  cardLabelCompleted: {
    textDecorationLine: "line-through" as const,
    color: Colors.textTertiary,
  },
  cardDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  messageContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#F9F7F2",
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  messageText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 19,
    fontStyle: "italic" as const,
  },
  generateButton: {
    marginTop: 12,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  generateButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  bottomSpacer: {
    height: 30,
  },
});
