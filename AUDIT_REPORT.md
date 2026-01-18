# דוח ביקורת קוד - OXYGYM Tracker
## Code Audit Report & Improvement Roadmap

**תאריך:** ינואר 2026
**מבצע הביקורת:** ארכיטקט תוכנה בכיר
**גרסה:** 1.0

---

## תוכן עניינים

1. [סיכום מנהלים](#סיכום-מנהלים)
2. [ניתוח זרימת נתונים](#1-ניתוח-זרימת-נתונים-contexts--ui)
3. [ביקורת חישובי תזונה](#2-ביקורת-nutrition-utilsts)
4. [ביקורת לוגיקת אימונים](#3-ביקורת-לוגיקת-אימונים)
5. [נקודות תורפה UX](#4-נקודות-תורפה-בחוויית-משתמש)
6. [תוכנית עבודה (Roadmap)](#5-תוכנית-עבודה---roadmap)

---

## סיכום מנהלים

האפליקציה בנויה בצורה נכונה מבחינה ארכיטקטונית עם הפרדה טובה בין רכיבים. עם זאת, זוהו מספר בעיות ביצועים, כפילויות קוד, ונקודות תורפה שעלולות לפגוע בחוויית המשתמש.

### ממצאים עיקריים:

| קטגוריה | חומרה | מספר ממצאים |
|---------|--------|-------------|
| **בעיית מודל דומיין** | 🔴 קריטית | 1 |
| ביצועים | 🔴 גבוהה | 4 |
| כפילויות קוד | 🟡 בינונית | 5 |
| בעיות UX | 🟠 בינונית-גבוהה | 6 |
| סיכוני נתונים | 🔴 גבוהה | 2 |

### 🚨 ממצא קריטי ביותר:

**מודל התזונה שגוי מבחינת הדומיין!**
- הקוד מתייחס לתפריט "שגרה" ו"שבת" כבלעדיים הדדית
- אבל הם **Presets בלבד** - המשתמש צריך יכולת לערבב ארוחות משניהם
- יעד הקלוריות היומי (2410) הוא **אחד** - לא לכל תפריט בנפרד
- ראה סעיף 2 לפירוט מלא

---

## 1. ניתוח זרימת נתונים (Contexts → UI)

### 1.1 DateContext - בעיות זוהות

**קובץ:** `src/contexts/DateContext.tsx`

#### בעיה #1: חישוב `isToday` בכל render
```typescript
// שורה 22 - נקרא בכל render
const isToday = selectedDate === getTodayString();
```

**השפעה:** `getTodayString()` יוצר אובייקט `Date` חדש ומבצע פעולות מחרוזת בכל render של כל רכיב שצורך את ה-context.

**פתרון מומלץ:** שימוש ב-`useMemo` עם dependency על `selectedDate` בלבד.

---

#### בעיה #2: אין טיפול במעבר חצות

כאשר האפליקציה פתוחה בזמן חצות, `isToday` לא מתעדכן אוטומטית.

**השפעה:** משתמש שמשאיר את האפליקציה פתוחה לילה שלם יראה נתונים של "היום" שכבר אינם רלוונטיים.

---

### 1.2 TimerContext - כפילויות ובעיות ארכיטקטורה

**קבצים:** `src/contexts/TimerContext.tsx`, `src/components/Timer.tsx`

#### בעיה #3: State כפול וחסר תועלת

```typescript
// TimerContext.tsx שורה 16
const [seconds, setSeconds] = useState(90); // תמיד 90, לעולם לא מתעדכן!
```

ה-state הזה לעולם לא משתנה - הספירה לאחור האמיתית מתבצעת ב-`Timer.tsx` עם state נפרד (`remainingSeconds`).

**השפעה:** קוד מבלבל ו-state מיותר ב-context.

---

#### בעיה #4: טיפול כפול באודיו

שני מנגנונים שונים מנהלים אודיו רקע:
1. `TimerContext.tsx` - יוצר `Audio` element ו-`AudioContext`
2. `Timer.tsx` - יוצר `silentAudioRef` נפרד

**השפעה:** בזבוז משאבים, התנהגות לא צפויה במכשירי iOS.

---

### 1.3 React Query - כפילויות בשאילתות

#### בעיה #5: שאילתות כפולות לנתוני אימונים שבועיים

**Index.tsx שורה 178:**
```typescript
queryKey: ['week-workouts', startOfWeek],
```

**Workouts.tsx שורה 22:**
```typescript
queryKey: ['workouts-week-summary', startOfWeek],
```

שתי השאילתות מושכות **אותם נתונים בדיוק** אבל עם מפתחות שונים, מה שמונע שיתוף cache.

---

#### בעיה #6: פונקציית `getStartOfWeek` מוגדרת פעמיים

אותו קוד מופיע ב-`Index.tsx:165-173` וב-`Workouts.tsx:8-16`.

---

### 1.4 Nutrition.tsx - שגיאה בחישוב סיכומים

#### בעיה #7: סכימה שגויה של שני סוגי תפריטים

**שורה 243-261:**
```typescript
const totals = useMemo(() => {
    // מחשב WEEKDAY + SHABBAT יחד!
    Object.values(weekdayMeals).forEach(meal => { ... });
    Object.values(shabbatMeals).forEach(meal => { ... });
    return { calories, protein, carbs, fat };
}, [weekdayMeals, shabbatMeals]);
```

**השפעה:** אם המשתמש מילא נתונים בשני סוגי התפריט, הסכום יכלול את שניהם - למרות שרק אחד רלוונטי.

**הערה:** המשתנה `totals` לא נמצא בשימוש בממשק! נראה שזהו קוד מת.

---

## 2. ביקורת nutrition-utils.ts - בעיית מודל דומיין

**קובץ:** `src/lib/nutrition-utils.ts`

### 2.1 🔴 בעיה קריטית: המודל הנוכחי שגוי מבחינת הדומיין

#### הבנת המודל העסקי הנכון:

```
┌─────────────────────────────────────────────────────────┐
│                  יעד יומי: 2410 קלוריות                  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Meal Templates (Presets בלבד)              │
│  ┌─────────────────┐      ┌─────────────────────────┐  │
│  │ תפריט שגרה      │      │ תפריט גמיש/שבת          │  │
│  │ ארוחה 1,2,3,4   │      │ סעודות 1,2,3,4          │  │
│  └─────────────────┘      └─────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│        המשתמש בוחר ארוחות מכל Template                  │
│        (אפשר לערבב בין התפריטים!)                       │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│   Sum(כל הארוחות שנבחרו) ≈ 2410 קלוריות (יעד יומי)     │
└─────────────────────────────────────────────────────────┘
```

**המודל הנוכחי בקוד (שגוי):**
- מתייחס ל-`weekday` ו-`shabbat` כתפריטים **בלעדיים**
- בוחר רק אחד מהם להצגה (לפי כמות קלוריות)
- **לא מאפשר** ערבוב ארוחות משני התפריטים

---

### 2.2 ניתוח הקוד הבעייתי

#### בעיה #8: `normalizeNutritionLogs` מסננת נתונים במקום לסכום

**שורות 53-66:**
```typescript
// 3. Find active menu_type (the one with the highest calorie sum)
let activeMenuType = 'weekday';
let maxCalories = -1;

groups.forEach((data, menuType) => {
    if (data.totalCalories > maxCalories) {
        maxCalories = data.totalCalories;
        activeMenuType = menuType;
    }
});

// 4. Return logs from the active menu type ONLY!
return (groups.get(activeMenuType)?.logs || [])...
```

**הבעיה:** הפונקציה מחזירה **רק** ארוחות מסוג תפריט אחד, במקום לסכום את כל הארוחות שנאכלו.

**תרחיש בעייתי:**
```
יום רגיל:
├── ארוחת בוקר מתפריט שגרה: 600 קל'
├── שייקר: 200 קל'
└── ארוחת ערב מתפריט שבת (סינטה): 500 קל'
                                    ─────────
                          סה"כ אמיתי: 1300 קל'

מה הקוד מציג: 600 קל' בלבד (רק תפריט שגרה)
```

---

#### בעיה #9: `Nutrition.tsx` - ה-totals הנכון קיים אך לא בשימוש!

**שורות 243-261:**
```typescript
const totals = useMemo(() => {
    let calories = 0;
    // סוכם weekday + shabbat - וזה נכון!
    Object.values(weekdayMeals).forEach(meal => { calories += meal.data.calories; });
    Object.values(shabbatMeals).forEach(meal => { calories += meal.data.calories; });
    return { calories, protein, carbs, fat };
}, [weekdayMeals, shabbatMeals]);
// אבל totals לא מוצג בממשק!
```

**הממצא:** החישוב הנכון כבר קיים בקוד, אבל הוא **קוד מת** - לא מוצג בשום מקום!

---

### 2.3 השוואה: Index.tsx vs Nutrition.tsx

| מיקום | מה מוצג | האם נכון? |
|-------|---------|-----------|
| `Index.tsx` (Dashboard) | רק menu_type אחד (via `normalizeNutritionLogs`) | ❌ שגוי |
| `Nutrition.tsx` (totals) | weekday + shabbat ביחד | ✅ נכון |
| `Nutrition.tsx` (UI) | totals לא מוצג | ❌ חסר |

---

### 2.4 בעיות נוספות בקוד

#### בעיה #10: יצירת אובייקטי Date מיותרת

**שורות 28-29:**
```typescript
const existingDate = new Date(existing.updated_at || ...).getTime();
const currentDate = new Date(log.updated_at || ...).getTime();
```

אפשר להשוות ISO strings ישירות (lexicographic comparison עובד לפורמט ISO).

---

### 2.5 הפתרון הנכון - שינוי מודל

#### אפשרות א': סכימה אוניברסלית (מומלץ)

```typescript
// nutrition-utils.ts - גרסה מתוקנת
export const normalizeNutritionLogs = (logs: any[]): any[] => {
    if (!logs?.length) return [];

    // De-duplicate by (menu_type, meal_number) - keep latest
    const deDuplicatedMap = new Map<string, any>();

    for (const log of logs) {
        const key = `${log.menu_type || 'weekday'}-${log.meal_number}`;
        const existing = deDuplicatedMap.get(key);

        if (!existing || (log.updated_at || '') > (existing.updated_at || '')) {
            deDuplicatedMap.set(key, log);
        }
    }

    // Return ALL logs (from both menu types), sorted by meal_number
    return Array.from(deDuplicatedMap.values())
        .sort((a, b) => (a.meal_number || 0) - (b.meal_number || 0));
};

// פונקציה חדשה לסיכום יומי
export const calculateDailyTotals = (logs: any[]): NutritionTotals => {
    const normalized = normalizeNutritionLogs(logs);

    return normalized.reduce((acc, log) => ({
        calories: acc.calories + (log.total_calories || 0),
        protein: acc.protein + (log.protein || 0),
        carbs: acc.carbs + (log.carbs || 0),
        fat: acc.fat + (log.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
};
```

#### אפשרות ב': הצגת totals קיים ב-Nutrition.tsx

הוספת סיכום יומי בתחתית הדף שמציג את `totals` הקיים.

---

### 2.6 אופטימיזציה משנית (לאחר תיקון המודל)

```typescript
// פסאודו-קוד לאופטימיזציה
export const normalizeNutritionLogs = (logs: any[]): any[] => {
    if (!logs?.length) return [];

    const groups = new Map<string, {
        latestByMeal: Map<number, any>,
        totalCalories: number
    }>();

    // מעבר יחיד - de-dup + grouping + sum
    for (const log of logs) {
        const menuType = log.menu_type || 'weekday';
        const mealNum = log.meal_number;

        if (!groups.has(menuType)) {
            groups.set(menuType, { latestByMeal: new Map(), totalCalories: 0 });
        }

        const group = groups.get(menuType)!;
        const existing = group.latestByMeal.get(mealNum);

        // השוואת timestamps כ-strings (ISO format מאפשר זאת)
        if (!existing || (log.updated_at || '') > (existing.updated_at || '')) {
            if (existing) {
                group.totalCalories -= existing.total_calories || 0;
            }
            group.latestByMeal.set(mealNum, log);
            group.totalCalories += log.total_calories || 0;
        }
    }

    // בחירת תפריט פעיל
    let activeType = 'weekday';
    let maxCal = -1;
    groups.forEach((data, type) => {
        if (data.totalCalories > maxCal) {
            maxCal = data.totalCalories;
            activeType = type;
        }
    });

    return Array.from(groups.get(activeType)?.latestByMeal.values() || [])
        .sort((a, b) => (a.meal_number || 0) - (b.meal_number || 0));
};
```

**שיפור צפוי:** ~40% פחות iterations, אין יצירת Date objects.

---

## 3. ביקורת לוגיקת אימונים

**קבצים:** `src/components/WorkoutTemplate.tsx`, `src/components/ExerciseRow.tsx`

### 3.1 בעיות ביצועים קריטיות

#### בעיה #10: שמירה אוטומטית ללא Debounce

**WorkoutTemplate.tsx שורות 226-227:**
```typescript
const handleExerciseDataChange = (data: any) => {
    // ...
    autoSave(); // נקרא על כל שינוי!
};
```

**השוואה:**
| רכיב | מנגנון שמירה |
|------|-------------|
| Nutrition.tsx | debounce של 1 שנייה ✅ |
| WorkoutTemplate.tsx | ללא debounce ❌ |

**השפעה:**
- הקלדה בשדה משקל "75" גורמת ל-2 קריאות DB (7 → 75)
- סימון 4 סטים = 4 קריאות DB

---

#### בעיה #11: Round-trip מיותר לפני כל שמירה

**שורות 160-163:**
```typescript
async function autoSave() {
    // ...
    const existingLogs = await WorkoutLog.filter({
        date: selectedDate,
        workout_type: workoutType
    }); // שאילתה לפני כל שמירה!
```

**השפעה:** כל פעולת שמירה כוללת שאילתת קריאה -> אפשר לחסוך 50% מהקריאות לDB.

---

#### בעיה #12: Race Conditions אפשריים

שמירות מרובות מתבצעות באופן אסינכרוני ללא סנכרון:

```
User clicks set 1 ✓ → autoSave() starts
User clicks set 2 ✓ → autoSave() starts (while first still running)
User clicks set 3 ✓ → autoSave() starts
```

**השפעה אפשרית:** נתונים עלולים להידרס אם שמירה מוקדמת מסתיימת אחרי שמירה מאוחרת יותר.

---

### 3.2 בעיות ב-ExerciseRow.tsx

#### בעיה #13: useEffect עם callback לא ממומו

**שורות 41-45:**
```typescript
useEffect(() => {
    if (onDataChange) {
        onDataChange({ sets: setData, weight, name });
    }
}, [setData, weight, name, onDataChange, isAbsExercise]);
```

`onDataChange` מועבר מ-WorkoutTemplate כ-inline function (לא עטוף ב-useCallback), מה שגורם ל-effect לרוץ בכל render של ה-parent.

---

#### בעיה #14: שליחת notification על כל סט

**שורות 58-68:**
```typescript
if (completed) {
    startTimer();
    notifyRestEnd({}) // נשלח על כל סימון!
        .then(...)
        .catch(...);
}
```

**השפעה:** אם משתמש מסמן 4 סטים ברצף מהיר, נשלחות 4 קריאות API.

---

## 4. נקודות תורפה בחוויית משתמש

### 4.1 סיכון לאובדן נתונים

| סיכון | מקור | חומרה |
|-------|------|--------|
| סגירה כפויה של האפליקציה | שמירה אסינכרונית לא מובטחת | 🔴 גבוהה |
| קריסת דפדפן | אין persistence מקומי | 🔴 גבוהה |
| בעיית רשת | אין retry mechanism עקבי | 🟡 בינונית |

**הסבר:** הדפוס הנוכחי של `userMadeChangeRef` אינו מספיק - אם האפליקציה נסגרת לפני ש-`autoSave()` מסתיים, הנתונים אובדים.

---

### 4.2 חוויית משתמש לא עקבית

#### #15: אינדיקציה מבלבלת של שמירה

WorkoutTemplate מציג "שומר אוטומטית..." בכל שינוי קטן, מה שיכול ליצור תחושה של איטיות או בעיות.

---

#### #16: אין feedback על הצלחת שמירה

אין indication ויזואלי כאשר השמירה הסתיימה בהצלחה. המשתמש לא יודע אם הנתונים באמת נשמרו.

---

### 4.3 בעיות טיימר באימון

#### #17: אמינות טיימר ברקע (iOS)

המנגנון הנוכחי של "silent audio" לשמירת האפליקציה ערה ברקע:
- לא עובד ב-Safari 17+ עקב הגבלות חדשות
- צורך סוללה מיותרת
- עלול להיכשל ללא הודעה

---

### 4.4 בעיות ניווט ותאריכים

#### #18: אין סנכרון תאריך בין דפים

כאשר משתמש בוחר תאריך ב-Index ואז עובר ל-Nutrition, התאריך נשמר (בגלל DateContext), אבל אין visual indicator ברור שהוא צופה בנתונים של יום אחר.

---

## 5. תוכנית עבודה - Roadmap

### 🔴 שלב 0: תיקון מודל הדומיין (עדיפות קריטית!)

#### 0.1 שינוי `nutrition-utils.ts` לסכום כל הארוחות

**הבעיה:** הפונקציה הנוכחית מחזירה רק menu_type אחד.

**הפתרון:**
```typescript
// src/lib/nutrition-utils.ts

/**
 * Normalizes NutritionLog records for a specific day.
 * De-duplicates by (menu_type, meal_number), keeping the latest version.
 * Returns ALL logs from BOTH menu types (since they're just presets).
 */
export const normalizeNutritionLogs = (logs: any[]): any[] => {
    if (!logs?.length) return [];

    const deDuplicatedMap = new Map<string, any>();

    for (const log of logs) {
        const key = `${log.menu_type || 'weekday'}-${log.meal_number}`;
        const existing = deDuplicatedMap.get(key);

        // Compare ISO strings directly (no Date objects needed)
        if (!existing || (log.updated_at || '') > (existing.updated_at || '')) {
            deDuplicatedMap.set(key, log);
        }
    }

    // Return ALL logs sorted by meal_number
    return Array.from(deDuplicatedMap.values())
        .sort((a, b) => (a.meal_number || 0) - (b.meal_number || 0));
};

/**
 * Calculate daily nutrition totals from all consumed meals.
 * One daily target, multiple meal templates, one total sum.
 */
export const calculateDailyTotals = (logs: any[]) => {
    const normalized = normalizeNutritionLogs(logs);

    return normalized.reduce((acc, log) => ({
        calories: acc.calories + (log.total_calories || 0),
        protein: acc.protein + (log.protein || 0),
        carbs: acc.carbs + (log.carbs || 0),
        fat: acc.fat + (log.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
};
```

---

#### 0.2 הוספת סיכום יומי ל-Nutrition.tsx

ה-`totals` useMemo קיים אבל לא מוצג. יש להוסיף Card עם הסיכום היומי:

```tsx
{/* Daily Summary Card - להוסיף בתחתית הדף */}
<Card className="bg-oxygym-darkGrey border-oxygym-yellow mb-6">
    <CardHeader>
        <CardTitle className="text-white">📊 סיכום יומי</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
        <div>
            <p className="text-muted-foreground text-sm">קלוריות</p>
            <p className="text-2xl text-white font-bold">
                {totals.calories.toFixed(0)} / 2410
            </p>
        </div>
        <div>
            <p className="text-muted-foreground text-sm">חלבון</p>
            <p className="text-2xl text-white font-bold">
                {totals.protein.toFixed(0)}ג' / 145ג'
            </p>
        </div>
    </CardContent>
</Card>
```

---

#### 0.3 עדכון Index.tsx להשתמש בסכימה הנכונה

```typescript
// במקום normalizeNutritionLogs שמחזיר menu_type אחד
import { calculateDailyTotals } from '@/lib/nutrition-utils';

const dailyTotals = useMemo(
    () => calculateDailyTotals(selectedDateNutrition || []),
    [selectedDateNutrition]
);
```

---

### שלב 1: תיקוני ביצועים קריטיים (עדיפות גבוהה)

#### 1.1 הוספת Debounce ל-WorkoutTemplate

**קבצים לעדכון:** `src/components/WorkoutTemplate.tsx`

**שינויים:**
```typescript
// הוספת debounce דומה ל-Nutrition.tsx
const saveTimeoutRef = useRef<NodeJS.Timeout>();

const handleExerciseDataChange = (data: any) => {
    setExerciseData(prev => {
        const updated = { ...prev, [data.name]: data };
        exerciseDataRef.current = updated;
        return updated;
    });

    if (!isInitialLoadRef.current) {
        userMadeChangeRef.current = true;

        // Debounce
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(autoSave, 1000);
    }
};
```

**תועלת צפויה:** הפחתה של ~70% בקריאות DB.

---

#### 1.2 אופטימיזציה של autoSave

**שינויים:**
- שמירת ה-log ID ב-state אחרי יצירה ראשונה
- שימוש ב-update ישיר במקום filter→update

```typescript
const existingLogIdRef = useRef<string | null>(null);

async function autoSave() {
    // ...
    if (existingLogIdRef.current) {
        // Update ישיר ללא query
        await WorkoutLog.update(existingLogIdRef.current, {...});
    } else {
        // חיפוש רק בפעם הראשונה
        const existingLogs = await WorkoutLog.filter({...});
        if (existingLogs.length > 0) {
            existingLogIdRef.current = existingLogs[0].id;
            await WorkoutLog.update(existingLogs[0].id, {...});
        } else {
            const newLog = await WorkoutLog.create({...});
            existingLogIdRef.current = newLog.id;
        }
    }
}
```

**תועלת צפויה:** הפחתה של 50% בקריאות DB.

---

### שלב 2: איחוד קוד כפול (עדיפות בינונית)

#### 2.1 יצירת utility משותף לחישובי תאריכים

**קובץ חדש:** `src/lib/date-utils.ts`

```typescript
export const getStartOfWeek = (): string => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 0 : dayOfWeek;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek.toISOString().split('T')[0];
};

export const getTodayString = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const isDateToday = (dateStr: string): boolean => {
    return dateStr === getTodayString();
};
```

---

#### 2.2 איחוד Query Keys לאימונים שבועיים

**שינויים ב-Workouts.tsx:**
```typescript
// שימוש באותו query key כמו Index.tsx
const { data: weekWorkouts } = useQuery({
    queryKey: ['week-workouts', startOfWeek], // אותו key!
    // ...
});
```

**תועלת:** שיתוף cache בין דפים, חיסכון בקריאות רשת.

---

### שלב 3: שיפור DateContext (עדיפות בינונית)

#### 3.1 מימוש עם useMemo ו-midnight handler

```typescript
export const DateProvider = ({ children }: { children: ReactNode }) => {
    const [selectedDate, setSelectedDate] = useState<string>(getTodayString);
    const [todayString, setTodayString] = useState<string>(getTodayString);

    // עדכון ב-midnight
    useEffect(() => {
        const now = new Date();
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
        const msUntilMidnight = midnight.getTime() - now.getTime();

        const timeout = setTimeout(() => {
            setTodayString(getTodayString());
        }, msUntilMidnight);

        return () => clearTimeout(timeout);
    }, [todayString]);

    const isToday = useMemo(() => selectedDate === todayString, [selectedDate, todayString]);

    return (
        <DateContext.Provider value={{ selectedDate, setSelectedDate, isToday }}>
            {children}
        </DateContext.Provider>
    );
};
```

---

### שלב 4: שיפור אמינות נתונים (עדיפות גבוהה)

#### 4.1 הוספת Local Storage backup

**רעיון:** שמירה מקומית לפני שליחה לשרת, מחיקה אחרי הצלחה.

```typescript
const PENDING_CHANGES_KEY = 'oxygym_pending_workout_changes';

async function autoSave() {
    const dataToSave = {
        date: selectedDate,
        workout_type: workoutType,
        exercises_completed,
        duration_minutes: cardioMinutes,
        timestamp: Date.now()
    };

    // שמירה מקומית ראשית
    localStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(dataToSave));

    try {
        // שליחה לשרת
        await WorkoutLog.create(dataToSave);
        // מחיקה אחרי הצלחה
        localStorage.removeItem(PENDING_CHANGES_KEY);
    } catch (error) {
        // הנתונים נשמרים ב-localStorage לשחזור
        console.error('Failed to save, data preserved locally');
    }
}

// בטעינה - בדיקה האם יש נתונים שלא נשמרו
useEffect(() => {
    const pending = localStorage.getItem(PENDING_CHANGES_KEY);
    if (pending) {
        // ניסיון לשחזר
        const data = JSON.parse(pending);
        // ... sync logic
    }
}, []);
```

---

### שלב 5: ניקוי TimerContext (עדיפות נמוכה)

#### 5.1 הסרת state מיותר

```typescript
// הסרה של:
const [seconds, setSeconds] = useState(90); // לא בשימוש

// שמירה רק על:
const [isActive, setIsActive] = useState(false);
const [restartToken, setRestartToken] = useState(0);
```

#### 5.2 איחוד ניהול אודיו

העברת כל לוגיקת האודיו ל-Timer.tsx בלבד, הסרה מ-TimerContext.

---

### שלב 6: שיפורי UX (עדיפות בינונית-נמוכה)

#### 6.1 הוספת toast להצלחת שמירה

```typescript
// רק אחרי שינוי משמעותי, לא על כל save
if (userMadeChangeRef.current && significantChange) {
    toast.success('הנתונים נשמרו', { duration: 1500 });
}
```

#### 6.2 אינדיקטור תאריך בולט יותר

הוספת banner קבוע בראש המסך כאשר צופים בתאריך שאינו היום.

---

## סיכום עדיפויות

| שלב | תיאור | עדיפות | מורכבות | השפעה |
|-----|-------|--------|---------|--------|
| **0.1** | **תיקון מודל תזונה** | 🔴 **קריטית** | בינונית | **קריטית** |
| **0.2** | **הצגת סיכום יומי** | 🔴 **קריטית** | נמוכה | **גבוהה** |
| **0.3** | **עדכון Index.tsx** | 🔴 **קריטית** | נמוכה | **גבוהה** |
| 1.1 | Debounce ל-Workout | 🔴 גבוהה | נמוכה | גבוהה |
| 1.2 | אופטימיזציה autoSave | 🔴 גבוהה | בינונית | גבוהה |
| 4.1 | Local Storage backup | 🔴 גבוהה | בינונית | גבוהה |
| 2.1 | Utils לתאריכים | 🟡 בינונית | נמוכה | בינונית |
| 2.2 | איחוד Query Keys | 🟡 בינונית | נמוכה | בינונית |
| 3.1 | שיפור DateContext | 🟡 בינונית | בינונית | בינונית |
| 5.x | ניקוי TimerContext | 🟢 נמוכה | נמוכה | נמוכה |
| 6.x | שיפורי UX | 🟢 נמוכה | נמוכה | בינונית |

### ⚡ המודל הנכון לתזונה:

```
One Daily Target (2410 קל')
    ↓
Multiple Meal Templates (presets)
    ↓
User selects from ANY template
    ↓
Sum(all selected) = Daily Total
```

---

## נספח: קבצים לעדכון

| קובץ | שלבים רלוונטיים |
|------|-----------------|
| `src/lib/nutrition-utils.ts` | **0.1 (קריטי!)** |
| `src/pages/Nutrition.tsx` | **0.2 (קריטי!)** |
| `src/pages/Index.tsx` | **0.3 (קריטי!)**, 2.1, 2.2 |
| `src/components/WorkoutTemplate.tsx` | 1.1, 1.2, 4.1 |
| `src/components/ExerciseRow.tsx` | 1.1 (עקיף) |
| `src/contexts/DateContext.tsx` | 3.1 |
| `src/contexts/TimerContext.tsx` | 5.1, 5.2 |
| `src/components/Timer.tsx` | 5.2 |
| `src/pages/Workouts.tsx` | 2.1, 2.2 |
| `src/lib/date-utils.ts` | 2.1 (חדש) |

---

*דוח זה נוצר על בסיס סריקת קוד מעמיקה ומייצג המלצות מקצועיות לשיפור האפליקציה.*
