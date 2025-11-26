import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MealItem } from '@/components/MealItem';
import { CalorieChart } from '@/components/CalorieChart';
import { Droplet, Moon } from 'lucide-react';

interface MealData {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

const Nutrition = () => {
    const [meal1Data, setMeal1Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [meal2Data, setMeal2Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [meal3Data, setMeal3Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [meal4Data, setMeal4Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });

    const totalCalories = meal1Data.calories + meal2Data.calories + meal3Data.calories + meal4Data.calories;
    const totalProtein = meal1Data.protein + meal2Data.protein + meal3Data.protein + meal4Data.protein;
    const totalCarbs = meal1Data.carbs + meal2Data.carbs + meal3Data.carbs + meal4Data.carbs;
    const totalFat = meal1Data.fat + meal2Data.fat + meal3Data.fat + meal4Data.fat;

    const handleMealItemToggle = (
        mealSetter: React.Dispatch<React.SetStateAction<MealData>>,
        itemName: string,
        checked: boolean,
        calories: number,
        protein: number,
        carbs: number,
        fat: number
    ) => {
        mealSetter(prev => {
            if (checked) {
                return {
                    calories: prev.calories + calories,
                    protein: prev.protein + protein,
                    carbs: prev.carbs + carbs,
                    fat: prev.fat + fat,
                };
            } else {
                return {
                    calories: Math.max(0, prev.calories - calories),
                    protein: Math.max(0, prev.protein - protein),
                    carbs: Math.max(0, prev.carbs - carbs),
                    fat: Math.max(0, prev.fat - fat),
                };
            }
        });
    };

    return (
        <div className="min-h-screen bg-oxygym-dark pb-20">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <h1 className="text-3xl font-bold text-white mb-2">תפריט תזונה</h1>
                <p className="text-muted-foreground mb-8">סמן מה אכלת היום</p>

                <CalorieChart
                    protein={totalProtein}
                    carbs={totalCarbs}
                    fat={totalFat}
                    totalCalories={totalCalories}
                />

                <div className="grid grid-cols-2 gap-4 my-6">
                    <Card className="bg-oxygym-darkGrey border-border">
                        <CardContent className="p-4 flex items-center gap-3">
                            <Droplet className="w-8 h-8 text-blue-400" />
                            <div>
                                <p className="text-white font-semibold">3 ליטר מים</p>
                                <p className="text-sm text-muted-foreground">יעד יומי</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-oxygym-darkGrey border-border">
                        <CardContent className="p-4 flex items-center gap-3">
                            <Moon className="w-8 h-8 text-purple-400" />
                            <div>
                                <p className="text-white font-semibold">7-9 שעות</p>
                                <p className="text-sm text-muted-foreground">שינה</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-oxygym-darkGrey border-border">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center justify-between">
                                <span>ארוחה 1</span>
                                <span className="text-oxygym-yellow text-sm">עד 10:00</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <MealItem
                                name="לחם כוסמין"
                                defaultAmount={168}
                                unit="גרם (4 פרוסות)"
                                caloriesPer100g={216}
                                proteinPer100g={11.9}
                                carbsPer100g={47.6}
                                fatPer100g={1.9}
                                onToggle={(checked, amount, cals, prot, crbs, ft) => 
                                    handleMealItemToggle(setMeal1Data, 'bread', checked, cals, prot, crbs, ft)
                                }
                            />
                            <MealItem
                                name="גבינה לבנה 5%"
                                defaultAmount={100}
                                unit="גרם"
                                caloriesPer100g={98}
                                proteinPer100g={9}
                                carbsPer100g={4.3}
                                fatPer100g={5}
                                onToggle={(checked, amount, cals, prot, crbs, ft) => 
                                    handleMealItemToggle(setMeal1Data, 'cheese', checked, cals, prot, crbs, ft)
                                }
                            />
                            <MealItem
                                name="ביצים"
                                defaultAmount={136}
                                unit="גרם (2 ביצים)"
                                caloriesPer100g={155}
                                proteinPer100g={13}
                                carbsPer100g={1.1}
                                fatPer100g={11}
                                onToggle={(checked, amount, cals, prot, crbs, ft) => 
                                    handleMealItemToggle(setMeal1Data, 'eggs', checked, cals, prot, crbs, ft)
                                }
                            />
                            <MealItem
                                name="ירקות"
                                defaultAmount={200}
                                unit="גרם"
                                caloriesPer100g={30}
                                proteinPer100g={0.5}
                                carbsPer100g={6.5}
                                fatPer100g={0.2}
                                onToggle={(checked, amount, cals, prot, crbs, ft) => 
                                    handleMealItemToggle(setMeal1Data, 'veggies', checked, cals, prot, crbs, ft)
                                }
                            />
                        </CardContent>
                    </Card>

                    <Card className="bg-oxygym-darkGrey border-border">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center justify-between">
                                <span>ארוחה 2</span>
                                <span className="text-oxygym-yellow text-sm">עד 12:30</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <MealItem
                                name="גיינר עם מים"
                                defaultAmount={150}
                                unit="גרם (2 כפות)"
                                caloriesPer100g={388}
                                proteinPer100g={15}
                                carbsPer100g={75}
                                fatPer100g={3.1}
                                onToggle={(checked, amount, cals, prot, crbs, ft) => 
                                    handleMealItemToggle(setMeal2Data, 'gainer', checked, cals, prot, crbs, ft)
                                }
                            />
                        </CardContent>
                    </Card>

                    <Card className="bg-oxygym-darkGrey border-border">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center justify-between">
                                <span>ארוחה 3</span>
                                <span className="text-oxygym-yellow text-sm">עד 15:30</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <MealItem
                                name="גיינר עם מים"
                                defaultAmount={150}
                                unit="גרם (2 כפות)"
                                caloriesPer100g={388}
                                proteinPer100g={15}
                                carbsPer100g={75}
                                fatPer100g={3.1}
                                onToggle={(checked, amount, cals, prot, crbs, ft) => 
                                    handleMealItemToggle(setMeal3Data, 'gainer', checked, cals, prot, crbs, ft)
                                }
                            />
                        </CardContent>
                    </Card>

                    <Card className="bg-oxygym-darkGrey border-border">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center justify-between">
                                <span>ארוחה 4</span>
                                <span className="text-oxygym-yellow text-sm">עד 22:00</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <MealItem
                                name="חזה עוף"
                                defaultAmount={150}
                                unit="גרם"
                                caloriesPer100g={156}
                                proteinPer100g={31}
                                carbsPer100g={0}
                                fatPer100g={3.6}
                                onToggle={(checked, amount, cals, prot, crbs, ft) => 
                                    handleMealItemToggle(setMeal4Data, 'chicken', checked, cals, prot, crbs, ft)
                                }
                            />
                            <MealItem
                                name="אורז (לפני בישול)"
                                defaultAmount={80}
                                unit="גרם"
                                caloriesPer100g={350}
                                proteinPer100g={7.3}
                                carbsPer100g={78.5}
                                fatPer100g={0.7}
                                onToggle={(checked, amount, cals, prot, crbs, ft) => 
                                    handleMealItemToggle(setMeal4Data, 'rice', checked, cals, prot, crbs, ft)
                                }
                            />
                            <MealItem
                                name="ירקות"
                                defaultAmount={200}
                                unit="גרם"
                                caloriesPer100g={30}
                                proteinPer100g={0.5}
                                carbsPer100g={6.5}
                                fatPer100g={0.2}
                                onToggle={(checked, amount, cals, prot, crbs, ft) => 
                                    handleMealItemToggle(setMeal4Data, 'veggies', checked, cals, prot, crbs, ft)
                                }
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Nutrition;