/**
 * פונקציה לניתוח התקדמות והמלצות אישיות
 * מנתחת את הנתונים ההיסטוריים ומציעה המלצות מותאמות אישית
 */

interface AnalyzeProgressRequest {
    userId: string;
    timeframe: 'week' | 'month' | 'all';
    workoutData: Array<{
        date: string;
        workout_type: string;
        completed: boolean;
        duration_minutes?: number;
    }>;
    nutritionData: Array<{
        date: string;
        total_calories: number;
        protein: number;
        carbs: number;
        fat: number;
    }>;
    weightData: Array<{
        date: string;
        weight: number;
    }>;
    userGoal: 'lose' | 'maintain' | 'gain';
    targetCalories: number;
}

interface AnalyzeProgressResponse {
    overallScore: number; // ציון כולל 0-100
    consistency: {
        workoutConsistency: number;
        nutritionConsistency: number;
        score: number;
    };
    performance: {
        workoutCompletion: number;
        calorieAdherence: number;
        proteinIntake: number;
        score: number;
    };
    progress: {
        weightTrend: 'on-track' | 'too-fast' | 'too-slow' | 'no-change' | 'insufficient-data';
        avgWeeklyChange: number | null;
        score: number;
    };
    insights: string[];
    actionItems: string[];
    motivationalMessage: string;
}

export default async function analyzeProgress(
    req: AnalyzeProgressRequest
): Promise<AnalyzeProgressResponse> {
    const { workoutData, nutritionData, weightData, userGoal, targetCalories } = req;

    // ניתוח עקביות
    const totalDays = 30; // נניח חודש
    const workoutDays = new Set(workoutData.filter(w => w.completed).map(w => w.date)).size;
    const nutritionDays = new Set(nutritionData.map(n => n.date)).size;
    
    const workoutConsistency = (workoutDays / (totalDays / 2.5)) * 100; // ציפייה ל-12 אימונים בחודש (3 בשבוע)
    const nutritionConsistency = (nutritionDays / totalDays) * 100;
    const consistencyScore = (workoutConsistency * 0.4 + nutritionConsistency * 0.6);

    // ניתוח ביצועים
    const completedWorkouts = workoutData.filter(w => w.completed).length;
    const totalWorkouts = workoutData.length;
    const workoutCompletion = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;

    const avgCalories = nutritionData.length > 0
        ? nutritionData.reduce((sum, n) => sum + n.total_calories, 0) / nutritionData.length
        : 0;
    const calorieAdherence = targetCalories > 0
        ? Math.min((avgCalories / targetCalories) * 100, 120) // מקסימום 120% כדי לא להעניש יתר על המידה
        : 0;

    const avgProtein = nutritionData.length > 0
        ? nutritionData.reduce((sum, n) => sum + n.protein, 0) / nutritionData.length
        : 0;
    const proteinIntake = (avgProtein / 145) * 100; // 145 גרם היעד מהנתונים

    const performanceScore = (workoutCompletion * 0.3 + calorieAdherence * 0.4 + proteinIntake * 0.3);

    // ניתוח התקדמות במשקל
    const sortedWeights = weightData.sort((a, b) => a.date.localeCompare(b.date));
    let weightTrend: 'on-track' | 'too-fast' | 'too-slow' | 'no-change' | 'insufficient-data' = 'insufficient-data';
    let avgWeeklyChange: number | null = null;
    let progressScore = 50;

    if (sortedWeights.length >= 2) {
        const firstWeight = sortedWeights[0].weight;
        const lastWeight = sortedWeights[sortedWeights.length - 1].weight;
        const totalChange = lastWeight - firstWeight;
        const weeks = sortedWeights.length / 7; // הנחה גסה
        avgWeeklyChange = weeks > 0 ? totalChange / weeks : null;

        if (userGoal === 'lose') {
            if (avgWeeklyChange && avgWeeklyChange < -0.8) {
                weightTrend = 'too-fast';
                progressScore = 70;
            } else if (avgWeeklyChange && avgWeeklyChange < -0.3) {
                weightTrend = 'on-track';
                progressScore = 100;
            } else if (avgWeeklyChange && avgWeeklyChange < 0) {
                weightTrend = 'too-slow';
                progressScore = 60;
            } else {
                weightTrend = 'no-change';
                progressScore = 40;
            }
        } else if (userGoal === 'gain') {
            if (avgWeeklyChange && avgWeeklyChange > 0.5) {
                weightTrend = 'too-fast';
                progressScore = 70;
            } else if (avgWeeklyChange && avgWeeklyChange > 0.2) {
                weightTrend = 'on-track';
                progressScore = 100;
            } else {
                weightTrend = 'too-slow';
                progressScore = 60;
            }
        } else { // maintain
            if (avgWeeklyChange && Math.abs(avgWeeklyChange) < 0.2) {
                weightTrend = 'on-track';
                progressScore = 100;
            } else {
                weightTrend = 'no-change';
                progressScore = 70;
            }
        }
    }

    // ציון כולל
    const overallScore = Math.round(consistencyScore * 0.35 + performanceScore * 0.35 + progressScore * 0.3);

    // יצירת תובנות
    const insights: string[] = [];
    
    if (workoutConsistency < 70) {
        insights.push('💪 שמור על קביעות באימונים - זה המפתח להצלחה');
    }
    if (nutritionConsistency < 80) {
        insights.push('🍽️ תיעוד קבוע של הארוחות יעזור לך לעמוד ביעדים');
    }
    if (calorieAdherence < 90 || calorieAdherence > 110) {
        insights.push('🎯 נסה להתקרב יותר ליעד הקלורי היומי');
    }
    if (avgProtein < 130) {
        insights.push('🥩 הגבר את צריכת החלבון לשימור/בניית שריר');
    }
    if (weightTrend === 'too-fast') {
        insights.push('⚠️ ירידה/עלייה מהירה מדי במשקל - שקול התאמת הקלוריות');
    }
    if (weightTrend === 'too-slow' || weightTrend === 'no-change') {
        insights.push('📊 אם אין שינוי במשקל, שקול להתאים את התוכנית');
    }

    // פעולות מומלצות
    const actionItems: string[] = [];
    
    if (workoutConsistency < 60) {
        actionItems.push('הגדר תזכורות לאימונים בלוח השנה שלך');
    }
    if (nutritionConsistency < 70) {
        actionItems.push('הכן את הארוחות מראש לכל השבוע');
    }
    if (avgProtein < 120) {
        actionItems.push('הוסף מקור חלבון לכל ארוחה');
    }
    if (workoutCompletion < 80) {
        actionItems.push('מצא שותף לאימונים למוטיבציה נוספת');
    }

    // הודעה מוטיבציונית
    let motivationalMessage = '';
    if (overallScore >= 85) {
        motivationalMessage = '🔥 מדהים! אתה בדרך הנכונה! המשך כך!';
    } else if (overallScore >= 70) {
        motivationalMessage = '💪 עבודה טובה! עוד קצת מאמץ ותגיע למצוינות!';
    } else if (overallScore >= 50) {
        motivationalMessage = '👍 יש התקדמות! תתמקד בעקביות והתוצאות יבואו!';
    } else {
        motivationalMessage = '💙 אל תוותר! כל יום הוא הזדמנות חדשה להתחיל מחדש!';
    }

    return {
        overallScore,
        consistency: {
            workoutConsistency: Math.round(workoutConsistency),
            nutritionConsistency: Math.round(nutritionConsistency),
            score: Math.round(consistencyScore),
        },
        performance: {
            workoutCompletion: Math.round(workoutCompletion),
            calorieAdherence: Math.round(calorieAdherence),
            proteinIntake: Math.round(proteinIntake),
            score: Math.round(performanceScore),
        },
        progress: {
            weightTrend,
            avgWeeklyChange: avgWeeklyChange ? Math.round(avgWeeklyChange * 10) / 10 : null,
            score: Math.round(progressScore),
        },
        insights,
        actionItems,
        motivationalMessage,
    };
}