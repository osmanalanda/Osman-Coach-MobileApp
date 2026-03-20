import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { SCHEDULE } from "@/constants/schedule";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  } as Notifications.NotificationBehavior),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") {
    console.log("[Notifications] Web platform, skipping permissions");
    return false;
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("[Notifications] Permission denied");
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("coaching", {
      name: "Coaching Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#D4A025",
    });
  }

  console.log("[Notifications] Permission granted");
  return true;
}

export async function scheduleAllNotifications(): Promise<void> {
  if (Platform.OS === "web") {
    console.log("[Notifications] Web platform, skipping scheduling");
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log("[Notifications] Cleared existing notifications");

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  for (const slot of SCHEDULE) {
    const now = new Date();
    const dayOfWeek = dayNames[now.getDay()];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔥 ${slot.label}`,
        body: getDefaultBody(slot.hour, dayOfWeek),
        data: {
          slotId: slot.id,
          hour: slot.hour,
          minute: slot.minute,
        },
        ...(Platform.OS === "android" && { channelId: "coaching" }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: slot.hour,
        minute: slot.minute,
      },
    });

    console.log(
      `[Notifications] Scheduled: ${slot.label} at ${slot.hour}:${String(slot.minute).padStart(2, "0")}`
    );
  }

  console.log("[Notifications] All notifications scheduled");
}

export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log("[Notifications] All notifications cancelled");
}

function getDefaultBody(hour: number, dayOfWeek: string): string {
  if (hour === 7) return "Time to start your day. Hydrate and get moving!";
  if (hour === 8) return "Breakfast time — fuel up with lean protein and complex carbs.";
  if (hour === 10) return "Grab a healthy snack to keep your metabolism running.";
  if (hour === 12) return "Lunch — grilled protein, big salad, small carbs.";
  if (hour === 15)
    return `Training time! Today is ${dayOfWeek} — crush your workout.`;
  if (hour === 17) return "Post-workout: protein shake and a banana. Recover strong.";
  if (hour === 19) return "Dinner — lean protein and vegetables. Stay clean.";
  if (hour === 21) return "Evening check-in. Review your day and prep for tomorrow.";
  if (hour === 22) return "Wind down. Magnesium, no screens, sleep well.";
  return "Stay on track, Osman. You've got this.";
}
