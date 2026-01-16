# OXYGYM Tracker - Project Map

> A comprehensive fitness tracking application for managing workouts, nutrition, weight, sleep, and water intake with Telegram notifications.

---

## 📄 Pages Overview

### Core Dashboard & Home
- **`Index.tsx`** (`/`)
  Main dashboard displaying comprehensive fitness statistics and progress tracking. Features include:
  - Daily nutrition summary (calories, protein, carbs, fat)
  - Weekly workout progress (tracks completed workouts A, B, C)
  - Water and sleep tracking widgets
  - Weight logging dialog
  - Telegram notification setup
  - Daily sync button for automated meal reminders
  - Weigh-in reminder component
  - Date selector for viewing historical data
  - Onboarding tutorial for new users

- **`Home.tsx`** (`/home`)
  Simplified version of the dashboard with basic stats and charts. Shows today's workouts, meals, and calorie tracking with weight chart visualization.

- **`Dashboard.tsx`** (`/dashboard`)
  Alias/redirect to the Workouts page - serves as an alternative entry point to workout management.

### Workout Management
- **`Workouts.tsx`** (`/workouts`)
  Workout selection hub showing three available workout programs with weekly progress tracking:
  - Displays completed workouts count (target: 3/week)
  - Shows cardio minutes accumulated (target: 60 minutes/week)
  - Visual indicators for completed workout types (A, B, C)
  - Workout cards with images and descriptions

- **`WorkoutA.tsx`** (`/workout-a`)
  Legs and shoulders workout program with 9 exercises:
  - Leg press machine, squats, leg extension, leg curl
  - Shoulder press, lateral raises, rear delts
  - Ab exercises (straight abs, leg raises)
  - 4 sets of 8-12 reps for strength exercises
  - 3 sets of 15 reps for ab exercises

- **`WorkoutB.tsx`** (`/workout-b`)
  Chest and biceps workout program with 9 exercises:
  - Barbell bench press, incline dumbbell press
  - Cable crossover, pec deck machine
  - W-bar curls, dumbbell curls, hammer curls
  - Ab exercises (straight abs, leg raises)

- **`WorkoutC.tsx`** (`/workout-c`)
  Back and triceps workout program with 9 exercises:
  - Wide lat pulldown, close lat pulldown, close row
  - T-bar row
  - Straight bar pushdown, rope pushdown, overhead extension
  - Ab exercises (straight abs, leg raises)

### Nutrition & Health Tracking
- **`Nutrition.tsx`** (`/nutrition`)
  Comprehensive nutrition tracking system with dual menu support:
  - **Weekday Menu**: 4 meals with specific meal times (10:00, 12:30, 15:30, 22:00)
    - Meal 1: Whole wheat bread, cottage cheese, eggs, vegetables
    - Meal 2 & 3: Protein shakes
    - Meal 4: Chicken breast, rice, vegetables
  - **Shabbat Menu**: 4 special Shabbat meals
    - Moroccan fish, challah, roasted vegetables
    - Chicken drumsticks, rice, salad
    - Salmon, sweet potato, roasted vegetables
    - Sirloin steak, bulgur salad, vegetables
  - Auto-save functionality for meal selections
  - Calorie and macro tracking per meal
  - Toggle for meal reminder notifications (Telegram)
  - Date selector for historical tracking

- **`WeightHistory.tsx`** (`/weight-history`)
  Complete weight tracking history with visualizations:
  - Line chart showing weight trends over time
  - Summary statistics (current weight, recent change, total change)
  - Chronological list of all weight entries with notes
  - Support for up to 365 daily weight logs

- **`Calendar.tsx`** (`/calendar`)
  Monthly calendar view with daily activity tracking:
  - Visual calendar grid with selectable dates
  - Day-detail view showing:
    - Completed workouts with exercise progress
    - Cardio minutes (target: 20 min/day)
    - Nutrition logs with calorie/protein totals
    - Water intake (target: 12 glasses/3L)
    - Sleep hours (target: 7-9 hours)
    - Weight measurements
  - Quick navigation to nutrition/workout pages for specific dates
  - Daily goal achievement indicators

### Settings & Configuration
- **`TelegramSettings.tsx`** (`/telegram-settings`)
  Telegram bot integration configuration:
  - Chat ID input for receiving notifications
  - Bot token display (stored locally)
  - Test message functionality to verify setup
  - Instructions for finding Chat ID using @userinfobot
  - Auto-saves settings to localStorage

- **`Status.tsx`** (`/status`)
  System health check and database connectivity page:
  - Verifies access to UserProfile data
  - Checks NutritionLog database connection
  - Tests WorkoutLog database access
  - Visual status indicators (healthy, warning, error)
  - Record count display for each entity
  - Technical troubleshooting information

### Error Handling
- **`NotFound.tsx`** (`/404`)
  404 error page for non-existent routes with link back to homepage.

---

## 💾 Data Models

The application uses a cloud-based entity system via Superdev Client. Data models include:

### Core Entities
- **`UserProfile`**
  Stores user profile information and settings.

- **`WorkoutLog`**
  Tracks workout sessions with fields:
  - `date`: Session date
  - `workout_type`: Type identifier (A, B, or C)
  - `completed`: Boolean completion status
  - `exercises_completed`: Array of exercises with sets/reps data
  - `duration_minutes`: Cardio/workout duration

- **`NutritionLog`**
  Records meal consumption with:
  - `date`: Meal date
  - `menu_type`: 'weekday' or 'shabbat'
  - `meal_number`: 1-4 for different meals
  - `items_consumed`: Array of food items with amounts
  - `total_calories`: Calculated total calories
  - `protein`, `carbs`, `fat`: Macronutrient totals

- **`WeightLog`**
  Weight measurements over time:
  - `date`: Measurement date
  - `weight`: Weight in kilograms
  - `notes`: Optional notes about conditions

- **`WaterLog`**
  Daily water intake tracking:
  - `date`: Log date
  - `glasses`: Number of glasses consumed (1 glass ≈ 0.25L)

- **`SleepLog`**
  Sleep duration tracking:
  - `date`: Sleep date
  - `hours`: Hours slept (decimal format)

- **`User` (Auth)**
  Authentication and user session management.

---

## ⚙️ Backend Functions

The application integrates serverless functions for enhanced functionality:

- **`analyzeProgress`**
  Analyzes user fitness progress over time.

- **`calculateMetrics`**
  Computes workout and nutrition metrics.

- **`generateWeeklyReport`**
  Creates weekly summary reports of user activity.

- **`sendReminder`**
  Generic reminder notification system.

- **`telegramSendMessage`**
  Sends notifications via Telegram bot API.

- **`notifyRestEnd`**
  Alerts when rest period between sets ends.

- **`scheduleNtfyReminder`**
  Schedules delayed notifications via ntfy.sh service for meal/weigh-in reminders.

---

## 🎯 Key Features Summary

### Workout Tracking
- 3 distinct workout programs (A, B, C) with detailed exercise lists
- Set and rep tracking with completion status
- Weekly progress monitoring (3 workouts/week target)
- Cardio duration tracking (60 min/week target)

### Nutrition Management
- Dual menu system (weekday vs. Shabbat)
- Detailed meal planning with specific portions
- Real-time calorie and macro calculation
- Daily targets: 2,410 calories, 145g protein
- Auto-save meal selections

### Health Monitoring
- Weight tracking with historical charts
- Water intake logging (12 glasses/day target)
- Sleep tracking (7-9 hours target)
- Calendar view for comprehensive daily overview

### Notifications & Reminders
- Telegram bot integration for push notifications
- Automated meal reminders at scheduled times
- Weekly weigh-in reminders (Thursdays 6:30 AM)
- Rest timer notifications during workouts

### Progress Visualization
- Line charts for weight trends
- Calorie distribution pie charts
- Weekly workout completion badges
- Daily goal achievement indicators

---

## 🏗️ Architecture Notes

- **Frontend**: React with TypeScript, using React Query for data management
- **Routing**: React Router for navigation
- **State Management**: React Context API (DateContext) + React Query cache
- **UI Components**: Custom component library with Tailwind CSS (oxygym theme)
- **Data Storage**: Cloud-based via Superdev Client (entity system)
- **Local Storage**: Settings (Telegram config), onboarding state
- **Charts**: Recharts library for data visualization
- **Notifications**: Telegram Bot API + ntfy.sh for scheduled reminders

---

## 📱 User Flow

1. **Onboarding**: First-time users see tutorial on Index page
2. **Daily Tracking**: Users log meals, workouts, water, sleep via dedicated pages
3. **Progress Monitoring**: Dashboard and Calendar show progress toward goals
4. **Workouts**: Select and complete workouts A/B/C with exercise tracking
5. **Notifications**: Optional Telegram reminders for meals and weigh-ins
6. **History Review**: Weight history and calendar provide long-term insights

---

*This project map was generated on 2026-01-16*
