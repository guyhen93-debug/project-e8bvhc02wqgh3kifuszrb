Deno.serve(async (req) => {
    try {
        const { weight, height, age, gender, activityLevel, goal } = await req.json();

        let bmr;
        if (gender === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        const activityMultipliers: { [key: string]: number } = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            very_active: 1.9,
        };

        const tdee = bmr * activityMultipliers[activityLevel];

        let targetCalories;
        if (goal === 'lose') {
            targetCalories = tdee - 500;
        } else if (goal === 'gain') {
            targetCalories = tdee + 300;
        } else {
            targetCalories = tdee;
        }

        const proteinGrams = weight * 2;
        const fatGrams = (targetCalories * 0.25) / 9;
        const proteinCalories = proteinGrams * 4;
        const fatCalories = fatGrams * 9;
        const carbsCalories = targetCalories - proteinCalories - fatCalories;
        const carbsGrams = carbsCalories / 4;

        const waterIntake = Math.round((weight * 0.045) * 10) / 10;

        return new Response(JSON.stringify({
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            targetCalories: Math.round(targetCalories),
            protein: Math.round(proteinGrams * 10) / 10,
            carbs: Math.round(carbsGrams * 10) / 10,
            fat: Math.round(fatGrams * 10) / 10,
            waterIntake,
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error('Error in calculateMetrics:', error);
        return new Response(JSON.stringify({ error: 'שגיאה בחישוב מדדים' }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});