export interface ScheduleSlot {
  id: string;
  hour: number;
  minute: number;
  label: string;
  category: "meal" | "training" | "motivation";
  description: string;
  icon: string;
}

export const SCHEDULE: ScheduleSlot[] = [
  {
    id: "morning-wake",
    hour: 7,
    minute: 0,
    label: "Morning Kickstart",
    category: "motivation",
    description: "Wake up motivation & hydration reminder",
    icon: "Sun",
  },
  {
    id: "breakfast",
    hour: 8,
    minute: 0,
    label: "Breakfast",
    category: "meal",
    description: "Lean protein + complex carbs",
    icon: "UtensilsCrossed",
  },
  {
    id: "mid-morning",
    hour: 10,
    minute: 30,
    label: "Mid-Morning Snack",
    category: "meal",
    description: "Light snack to maintain metabolism",
    icon: "Apple",
  },
  {
    id: "lunch",
    hour: 12,
    minute: 30,
    label: "Lunch",
    category: "meal",
    description: "High protein, moderate carbs",
    icon: "Salad",
  },
  {
    id: "afternoon-training",
    hour: 15,
    minute: 0,
    label: "Training Reminder",
    category: "training",
    description: "Cardio + weights session",
    icon: "Dumbbell",
  },
  {
    id: "post-workout",
    hour: 17,
    minute: 0,
    label: "Post-Workout Meal",
    category: "meal",
    description: "Recovery nutrition window",
    icon: "Zap",
  },
  {
    id: "dinner",
    hour: 19,
    minute: 30,
    label: "Dinner",
    category: "meal",
    description: "Light dinner, high protein",
    icon: "ChefHat",
  },
  {
    id: "evening-wind",
    hour: 21,
    minute: 30,
    label: "Evening Check-in",
    category: "motivation",
    description: "Daily progress & tomorrow prep",
    icon: "Moon",
  },
  {
    id: "sleep-prep",
    hour: 22,
    minute: 30,
    label: "Sleep Prep",
    category: "motivation",
    description: "Wind down for recovery",
    icon: "BedDouble",
  },
];

export function getTimeString(slot: ScheduleSlot): string {
  const h = slot.hour.toString().padStart(2, "0");
  const m = slot.minute.toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function getSlotStatus(
  slot: ScheduleSlot,
  now: Date
): "completed" | "active" | "upcoming" {
  const slotMinutes = slot.hour * 60 + slot.minute;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (nowMinutes > slotMinutes + 30) return "completed";
  if (nowMinutes >= slotMinutes - 15 && nowMinutes <= slotMinutes + 30)
    return "active";
  return "upcoming";
}
