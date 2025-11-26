Deno.serve(async (req) => {
    try {
        const { 
            workoutData, 
            nutritionData, 
            weightData, 
            userGoal, 
            targetCalories 
        } = await req.json();

        const totalDays = 30;
        const workoutDays = new Set(workoutData.filter((w: any) => w.completed).map((w: any) => w.date)).size;
        const nutritionDays = new Set(nutritionData.map((n: any) => n.date)).size;
        
        const workoutConsistency = (workoutDays / (totalDays / 2.5)) * 100;
        const nutritionConsistency = (nutritionDays / totalDays) * 100;
        const consistencyScore = (workoutConsistency * 0.4 + nutritionConsistency * 0.6);

        const completedWorkouts = workoutData.filter((w: any) => w.completed).length;
        const totalWorkouts = workoutData.length;
        const workoutCompletion = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;

        const avgCalories = nutritionData.length > 0
            ? nutritionData.reduce((sum: number, n: any) => sum + n.total_calories, 0) / nutritionData.length
            : 0;
        const calorieAdherence = targetCalories > 0
            ? Math.min((avgCalories / targetCalories) * 100, 120)
            : 0;

        const avgProtein = nutritionData.length > 0
            ? nutritionData.reduce((sum: number, n: any) => sum + n.protein, 0) / nutritionData.length
            : 0;
        const proteinIntake = (avgProtein / 145) * 100;

        const performanceScore = (workoutCompletion * 0.3 + calorieAdherence * 0.4 + proteinIntake * 0.3);

        const sortedWeights = weightData.sort((a: any, b: any) => a.date.localeCompare(b.date));
        let weightTrend = 'insufficient-data';
        let avgWeeklyChange = null;
        let progressScore = 50;

        if (sortedWeights.length >= 2) {
            const firstWeight = sortedWeights[0].weight;
            const lastWeight = sortedWeights[sortedWeights.length - 1].weight;
            const totalChange = lastWeight - firstWeight;
            const weeks = sortedWeights.length / 7;
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
            } else {
                if (avgWeeklyChange && Math.abs(avgWeeklyChange) < 0.2) {
                    weightTrend = 'on-track';
                    progressScore = 100;
                } else {
                    weightTrend = 'no-change';
                    progressScore = 70;
                }
            }
        }

        const overallScore = Math.round(consistencyScore * 0.35 + performanceScore * 0.35 + progressScore * 0.3);

        const insights = [];
        if (workoutConsistency < 70) insights.push('💪 שמור על קביעות באימונים - זה המפתח להצלחה');
        if (nutritionConsistency < 80) insights.push('🍽️ תיעוד קבוע של הארוחות יעזור לך לעמוד ביעדים');
        if (calorieAdherence < 90 || calorieAdherence > 110) insights.push('🎯 נסה להתקרב יותר ליעד הקלורי היומי');
        if (avgProtein < 130) insights.push('🥩 הגבר את צריכת החלבון לשימור/בניית שריר');

        const actionItems = [];
        if (workoutConsistency < 60) actionItems.push('הגדר תזכורות לאימונים בלוח השנה שלך');
        if (nutritionConsistency < 70) actionItems.push('הכן את הארוחות מראש לכל השבוע');
        if (avgProtein < 120) actionItems.push('הוסף מקור חלבון לכל ארוחה');

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

        return new Response(JSON.stringify({
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
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error('Error in analyzeProgress:', error);
        return new Response(JSON.stringify({ error: 'שגיאה בניתוח התקדמות' }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});