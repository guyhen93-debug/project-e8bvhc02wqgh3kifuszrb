/**
 * פונקציה לחישוב BMR (Basal Metabolic Rate) ו-TDEE (Total Daily Energy Expenditure)
 * מחשבת את צריכת הקלוריות הבסיסית והיומית בהתאם לנתוני המשתמש
 */

interface CalculateMetricsRequest {
    weight: number; // משקל בק"ג
    height: number; // גובה בס"מ
    age: number; // גיל
    gender: 'male' | 'female'; // מגדר
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'; // רמת פעילות
    goal: 'lose' | 'maintain' | 'gain'; // יעד (ירידה/שמירה/עלייה במשקל)
}

interface CalculateMetricsResponse {
    bmr: number; // קלוריות בסיסיות
    tdee: number; // קלוריות יומיות
    targetCalories: number; // יעד קלוריות בהתאם למטרה
    protein: number; // חלבון מומלץ בגרם
    carbs: number; // פחמימות מומלצות בגרם
    fat: number; // שומן מומלץ בגרם
    waterIntake: number; // צריכת מים מומלצת בליטר
}

export default async function calculateMetrics(
    req: CalculateMetricsRequest
): Promise<CalculateMetricsResponse> {
    const { weight, height, age, gender, activityLevel, goal } = req;

    // חישוב BMR לפי נוסחת Mifflin-St Jeor
    let bmr: number;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // מקדמי פעילות
    const activityMultipliers = {
        sedentary: 1.2,      // ישיבה רוב היום
        light: 1.375,        // פעילות קלה 1-3 פעמים בשבוע
        moderate: 1.55,      // פעילות בינונית 3-5 פעמים בשבוע
        active: 1.725,       // פעילות אינטנסיבית 6-7 פעמים בשבוע
        very_active: 1.9,    // פעילות מאוד אינטנסיבית, עבודה פיזית
    };

    // חישוב TDEE
    const tdee = bmr * activityMultipliers[activityLevel];

    // חישוב יעד קלוריות בהתאם למטרה
    let targetCalories: number;
    if (goal === 'lose') {
        targetCalories = tdee - 500; // גירעון של 500 קלוריות ליום
    } else if (goal === 'gain') {
        targetCalories = tdee + 300; // עודף של 300 קלוריות ליום
    } else {
        targetCalories = tdee; // שמירה על משקל
    }

    // חישוב מקרו-נוטריינטים
    const proteinGrams = weight * 2; // 2 גרם חלבון לק"ג
    const fatGrams = (targetCalories * 0.25) / 9; // 25% מהקלוריות משומן
    const proteinCalories = proteinGrams * 4;
    const fatCalories = fatGrams * 9;
    const carbsCalories = targetCalories - proteinCalories - fatCalories;
    const carbsGrams = carbsCalories / 4;

    // חישוב צריכת מים (0.045 ליטר לכל ק"ג)
    const waterIntake = Math.round((weight * 0.045) * 10) / 10;

    return {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories: Math.round(targetCalories),
        protein: Math.round(proteinGrams * 10) / 10,
        carbs: Math.round(carbsGrams * 10) / 10,
        fat: Math.round(fatGrams * 10) / 10,
        waterIntake,
    };
}