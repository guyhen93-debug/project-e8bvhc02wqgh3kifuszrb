import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MealItem } from '@/components/MealItem';
import { CalorieChart } from '@/components/CalorieChart';
import { Droplet, Moon, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NutritionLog } from '@/entities';

interface MealData {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

const Nutrition = () => {
    const { toast } = useToast();
    const [meal1Data, setMeal1Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [meal2Data, setMeal2Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [meal3Data, setMeal3Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [meal4Data, setMeal4Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
                setHasChanges(true);
                return {
                    calories: prev.calories + calories,
                    protein: prev.protein + protein,
                    carbs: prev.carbs + carbs,
                    fat: prev.fat + fat,
                };
            } else {
                setHasChanges(true);
                return {
                    calories: Math.max(0, prev.calories - calories),
                    protein: Math.max(0, prev.protein - protein),
                    carbs: Math.max(0, prev.carbs - carbs),
                    fat: Math.max(0, prev.fat - fat),
                };
            }
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            
            // שמירת כל ארוחה למסד הנתונים
            const meals = [
                { number: 1, data: meal1Data },
                { number: 2, data: meal2Data },
                { number: 3, data: meal3Data },
                { number: 4, data: meal4Data },
            ];

            for (const meal of meals) {
                if (meal.data.calories > 0) {
                    await NutritionLog.create({
                        date: today,
                        meal_number: meal.number,
                        items_consumed: [], // ניתן להוסיף מידע נוסף בעתיד
                        total_calories: meal.data.calories,
                        protein: meal.data.protein,
                        carbs: meal.data.carbs,
                        fat: meal.data.fat,
                    });
                }
            }

            // שמירה גם ל-localStorage
            localStorage.setItem('nutrition-data', JSON.stringify({
                meal1: meal1Data,
                meal2: meal2Data,
                meal3: meal3Data,
                meal4: meal4Data,
                date: today
            }));

            setHasChanges(false);
            toast({
                title: "נשמר בהצלחה! ✅",
                description: "התזונה היומית נשמרה במערכת",
            });
        } catch (error) {
            console.error('Error saving nutrition:', error);
            toast({
                title: "שגיאה בשמירה",
                description: "אנא נסה שוב",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-oxygym-dark pb-32">
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

                <div className="space-y-6 mb-6">
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

                {hasChanges && (
                    <div className="fixed bottom-20 left-0 right-0 bg-oxygym-darkGrey border-t border-border p-4">
                        <div className="container mx-auto max-w-3xl flex gap-3">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 bg-oxygym-yellow hover:bg-yellow-500 text-black font-bold"
                            >
                                <Save className="w-4 h-4 ml-2" />
                                {isSaving ? 'שומר...' : 'שמור תזונה'}
                            </Button>
                            <Button
                                onClick={handleCancel}
                                disabled={isSaving}
                                variant="outline"
                                className="flex-1 border-border text-white hover:bg-red-600 hover:text-white"
                            >
                                <X className="w-4 h-4 ml-2" />
                                בטל
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Nutrition;