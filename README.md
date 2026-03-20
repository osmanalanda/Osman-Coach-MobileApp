🥊 Osman Coach — AI-Powered Fitness Notification App

Built by a champion, coached by AI.


What is this?
Osman Coach is a personal Android app built for one person — Osman Alanda, 2018 Turkey Alt Minikler Boxing Champion — on a mission to cut from 105 kg to 90–92 kg in 10 weeks with lean muscle.
The app acts as a personal AI boxing coach living in your pocket. It calls the Claude AI API (Anthropic) on a schedule throughout the day and fires real push notifications telling you exactly what to eat, when to train, when to drink water, and when to sleep — personalised, direct, and relentless.
No generic fitness app. No one-size-fits-all advice. This is built around one athlete's exact plan.

Features

🔔 9 scheduled AI notifications per day — from 7 AM wake-up to 10:30 PM sleep reminder
🤖 Powered by Claude AI — every message is generated in real-time, aware of the time, day of the week, and current week of the 10-week cut
🥗 Meal-specific reminders — tells you exactly what to eat at each meal (breakfast, lunch, pre-workout, dinner, evening snack)
💪 Training-aware — knows your weekly training schedule (lift days, boxing days, cardio days, rest days)
📉 Progress-aware — tracks which week of the cut you're in and adjusts the tone accordingly
⚙️ API key settings screen — securely store your Anthropic API key on device
📴 Works with app closed — background notifications fire even when the app isn't open


The Training & Diet Plan (Built Into the App)
GoalCut from 105 kg → 90–92 kg, lean & athleticTimeline10 weeksDaily calories2,000–2,100 kcalProtein200g/dayLiftingMon / Wed / FriBoxingTue / Sat (run + shadow boxing + 3×3 weighted)CardioThu (30 min)Daily walk20 min every daySleep target7–8 hours

Notification Schedule
TimeType07:00Morning wake-up & motivation08:00Breakfast reminder10:30Mid-morning water & check-in12:30Lunch reminder15:00Afternoon check-in17:00Pre-workout meal & training reminder19:30Post-workout dinner21:30Evening snack (casein/cottage cheese)22:30Sleep reminder & day recap

Tech Stack

React Native / Expo — cross-platform Android app
Anthropic Claude API (claude-sonnet-4-20250514) — AI message generation
Expo Notifications — local and scheduled push notifications
AsyncStorage — secure local storage for API key
Android Studio — build & deployment to physical device
How It Works
Every scheduled notification triggers a call to the Claude API with:

A system prompt containing Osman's full fitness plan, diet, training schedule, and coaching persona
A user message with the current time, day, and week number — asking Claude to generate the right message for that moment

Claude responds like a boxing coach: direct, personal, no fluff. The response is displayed as a push notification on the phone.

Project Background
This app was built from scratch using Rork AI for code generation and Android Studio for device deployment. The entire concept, plan, and prompt architecture was designed in conversation with Claude (claude.ai) — making this genuinely an AI-to-AI pipeline: Claude helped design the system that runs on Claude.
The fitness plan powering the notifications was created specifically for Osman's 10-week cut, taking into account his athletic background (competitive boxing champion), current training frequency, sleep habits, and dietary patterns.

Cost
The Claude API costs roughly $1–2/month at 9 short messages per day. That's it.

License
Personal use. Built for one athlete.

"Train like a champion. Eat like an athlete. Sleep like it's part of the plan."
