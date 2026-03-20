# Osman Coach — Fitness Notification App


## Features

- **Scheduled notifications** at 9 specific times throughout the day (07:00, 08:00, 10:30, 12:30, 15:00, 17:00, 19:30, 21:30, 22:30)
- **AI-powered messages** — each notification calls Claude API to generate a context-aware meal reminder, training reminder, or motivational message based on the time of day
- **Cutting fitness plan** baked into the system prompt — calorie deficit focus, lean meals, cardio + weights schedule
- **Secure API key storage** — your Anthropic API key is stored securely on device
- **Today's schedule view** — see all 9 notification times with labels (what type of reminder each one is)
- **Notification history** — see past messages that were generated
- **Settings screen** — enter/update your Anthropic API key, toggle notifications on/off

## Design

- **Clean, minimal light theme** with warm off-white background
- **Gold/amber accent color** for active states, icons, and highlights
- **Soft card-based layout** with subtle shadows for schedule items
- **Warm typography** — readable, calm feel
- Inspired by premium health apps like Noom and Eight Sleep
- Schedule items show time, label (e.g. "Morning Meal"), and status indicator (upcoming/completed)
- Settings screen with clean input field for API key (masked)

## Screens

1. **Home (Schedule)** — Shows today's date, a vertical timeline of all 9 notification slots with time, category label, and status. Next upcoming notification is highlighted in gold.
2. **Settings** — API key input (securely stored), notification toggle, and info about the fitness plan prompt.

## App Icon

- Minimal gold/amber shield or flame icon on a clean white/cream background — representing coaching and motivation

## Important Notes

- Notifications use `expo-notifications` with scheduled local notifications
- Background notification delivery relies on scheduled local notifications (not background fetch), so they will fire on time even when the app is closed
- The Claude API call happens when the app is open or via a background task where supported; on platforms without background execution, notifications will still fire with a default motivational message
