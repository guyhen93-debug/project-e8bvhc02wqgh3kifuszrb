Deno.serve(async (req) => {
    try {
        const { workouts, nutrition, weights, targetCalories } = await req.json();

        const completedWorkouts = workouts.filter((w: any) => w.completed);
        const totalWorkouts = completedWorkouts.length;
        const completionRate = workouts.length > 0 ? (totalWorkouts / workouts.length) * 100 : 0;
        
        const workoutsByType: { [key: string]: number } = {};
        completedWorkouts.forEach((w: any) => {
            workoutsByType[w.workout_type] = (workoutsByType[w.workout_type] || 0) + 1;
        });

        const avgCalories = nutrition.length > 0
            ? nutrition.reduce((sum: number, n: any) => sum + n.total_calories, 0) / nutrition.length
            : 0;
        const avgProtein = nutrition.length > 0
            ? nutrition.reduce((sum: number, n: any) => sum + n.protein, 0) / nutrition.length
            : 0;
        const avgCarbs = nutrition.length > 0
            ? nutrition.reduce((sum: number, n: any) => sum + n.carbs, 0) / nutrition.length
            : 0;
        const avgFat = nutrition.length > 0
            ? nutrition.reduce((sum: number, n: any) => sum + n.fat, 0) / nutrition.length
            : 0;
        
        const calorieAdherence = targetCalories > 0
            ? (avgCalories / targetCalories) * 100
            : 0;

        const sortedWeights = weights.sort((a: any, b: any) => a.date.localeCompare(b.date));
        const startWeight = sortedWeights.length > 0 ? sortedWeights[0].weight : null;
        const endWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weight : null;
        const weightChange = startWeight && endWeight ? endWeight - startWeight : null;
        
        let trend = 'no-data';
        if (weightChange !== null) {
            if (Math.abs(weightChange) < 0.3) {
                trend = 'stable';
            } else if (weightChange > 0) {
                trend = 'increasing';
            } else {
                trend = 'decreasing';
            }
        }

        const achievements = [];
        if (totalWorkouts >= 3) achievements.push('✅ השלמת 3 אימונים או יותר השבוע!');
        if (completionRate >= 80) achievements.push('🔥 שיעור השלמת אימונים מעולה - מעל 80%!');
        if (calorieAdherence >= 90 && calorieAdherence <= 110) {
            achievements.push('🎯 עמדת ביעד הקלורי השבועי!');
        }
        if (weightChange && Math.abs(weightChange) >= 0.5) {
            achievements.push(`📊 שינוי משקל של ${Math.abs(weightChange).toFixed(1)} ק"ג!`);
        }

        const recommendations = [];
        if (totalWorkouts < 3) {
            recommendations.push('💪 נסה להגיע ל-3 אימונים בשבוע הבא');
        }
        if (avgProtein < 100) {
            recommendations.push('🥩 הגדל צריכת חלבון - שאף לפחות 2 גרם לק"ג משקל גוף');
        }
        if (calorieAdherence < 85) {
            recommendations.push('🍽️ נסה להיצמד יותר ליעד הקלורי היומי');
        }

        const summary = `דו"ח שבועי: ${totalWorkouts} אימונים הושלמו, ממוצע של ${Math.round(avgCalories)} קלוריות ליום${
            weightChange ? `, שינוי משקל של ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} ק"ג` : ''
        }.`;

        return new Response(JSON.stringify({
            summary,
            workoutStats: {
                totalWorkouts,
                completionRate: Math.round(completionRate),
                workoutsByType,
            },
            nutritionStats: {
                avgCalories: Math.round(avgCalories),
                avgProtein: Math.round(avgProtein * 10) / 10,
                avgCarbs: Math.round(avgCarbs * 10) / 10,
                avgFat: Math.round(avgFat * 10) / 10,
                calorieAdherence: Math.round(calorieAdherence),
            },
            weightStats: {
                startWeight: startWeight ? Math.round(startWeight * 10) / 10 : null,
                endWeight: endWeight ? Math.round(endWeight * 10) / 10 : null,
                weightChange: weightChange ? Math.round(weightChange * 10) / 10 : null,
                trend,
            },
            achievements,
            recommendations,
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error('Error in generateWeeklyReport:', error);
        return new Response(JSON.stringify({ error: 'שגיאה ביצירת דוח' }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});