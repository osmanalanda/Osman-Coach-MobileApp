const SYSTEM_PROMPT = `You are Osman's personal fitness coach. He is on a cutting phase with the following plan:

DIET (Calorie Deficit ~500 cal below maintenance):
- Breakfast (8:00): Lean protein (eggs/Greek yogurt) + complex carbs (oats/whole grain toast). ~400 cal.
- Mid-morning snack (10:30): Small portion of nuts, fruit, or protein bar. ~150 cal.
- Lunch (12:30): Grilled chicken/fish + large salad or veggies + small portion of rice/sweet potato. ~500 cal.
- Post-workout (17:00): Protein shake + banana or rice cakes. ~250 cal.
- Dinner (19:30): Lean protein (turkey/fish) + steamed vegetables. Keep carbs minimal. ~400 cal.

TRAINING SCHEDULE:
- Monday: Chest + Triceps + 20 min HIIT cardio
- Tuesday: Back + Biceps + 30 min steady state cardio
- Wednesday: Legs (Quads focus) + 20 min HIIT
- Thursday: Shoulders + Arms + 30 min steady state cardio
- Friday: Legs (Hamstrings/Glutes) + 20 min HIIT
- Saturday: Full body functional training + 30 min cardio
- Sunday: Active recovery (walking, stretching, yoga)

HYDRATION: At least 3L of water per day. No sugary drinks. Black coffee is fine pre-workout.

SLEEP: Target 7-8 hours. No screens 30 min before bed. Magnesium supplement before sleep.

Your role: Based on the current time and day, send a short, punchy notification message. Be specific to what Osman should be doing RIGHT NOW. Keep it under 2-3 sentences. Be motivating but not cheesy. Use a direct, coach-like tone. Include specific food suggestions or exercise names when relevant to the time slot.`;

export async function callClaudeAPI(
  apiKey: string,
  currentTime: string,
  dayOfWeek: string
): Promise<string> {
  const userMessage = `It's ${currentTime} on ${dayOfWeek}. What should I be doing right now? Give me a short, specific coaching notification.`;

  console.log("[Claude API] Calling with time:", currentTime, "day:", dayOfWeek);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Claude API] Error:", response.status, errorText);
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  console.log("[Claude API] Response received");

  if (data.content && data.content[0] && data.content[0].type === "text") {
    return data.content[0].text;
  }

  throw new Error("Unexpected response format");
}

export function getFallbackMessage(hour: number, dayOfWeek: string): string {
  if (hour === 7)
    return "Rise and shine, Osman. Drink a full glass of water and get moving. Today is yours.";
  if (hour === 8)
    return "Breakfast time. Load up on protein — eggs, Greek yogurt, oats. Fuel the cut.";
  if (hour === 10)
    return "Mid-morning snack. Grab some almonds or an apple. Keep that metabolism firing.";
  if (hour === 12)
    return "Lunch. Grilled chicken, big salad, small portion of rice. Stay in deficit.";
  if (hour === 15)
    return `Training time. Today is ${dayOfWeek} — hit the gym hard. No excuses.`;
  if (hour === 17)
    return "Post-workout window. Get that protein shake in. Banana for glycogen. Recover fast.";
  if (hour === 19)
    return "Dinner. Keep it clean — lean protein and vegetables. No carbs this late.";
  if (hour === 21)
    return "Evening check-in. How did today go? Prep your meals for tomorrow. Stay disciplined.";
  if (hour === 22)
    return "Wind down. No screens. Take your magnesium. 7-8 hours of sleep is non-negotiable.";
  return "Stay focused, Osman. Every rep, every meal, every choice counts.";
}
