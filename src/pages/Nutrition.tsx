import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MealItem } from '@/components/MealItem';
import { CalorieChart } from '@/components/CalorieChart';
import { WaterTracker } from '@/components/WaterTracker';
import { DateSelector } from '@/components/DateSelector';
import { Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NutritionLog } from '@/entities';
import { useQuery } from '@tanstack/react-query';
import { useDate } from '@/contexts/DateContext';

interface MealData {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

const Nutrition = () => {
    const { toast } = useToast();
    const { selectedDate, isToday } = useDate();
    const [meal1Data, setMeal1Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [meal2Data, setMeal2Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [meal3Data, setMeal3Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [meal4Data, setMeal4Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    const { data: selectedDateMeals, refetch } = useQuery({
        queryKey: ['nutrition-logs', selectedDate],
        queryFn: async () => {
            try {
                const logs = await NutritionLog.filter({ date: selectedDate });
                console.log('Loaded nutrition logs for date:', selectedDate, logs);
                return logs;
            } catch (error) {
                console.error('Error loading nutrition logs:', error);
                return [];
            }
        },
    });

    useEffect(() => {
        console.log('Date changed to:', selectedDate);
        setMeal1Data({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        setMeal2Data({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        setMeal3Data({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        setMeal4Data({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        setHasChanges(false);
        refetch();
    }, [selectedDate, refetch]);

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
        try {
            setSaving(true);

            const existingLogs = await NutritionLog.filter({ date: selectedDate });
            for (const log of existingLogs) {
                await NutritionLog.delete(log.id);
            }

            const meals = [
                { number: 1, data: meal1Data },
                { number: 2, data: meal2Data },
                { number: 3, data: meal3Data },
                { number: 4, data: meal4Data },
            ];

            for (const meal of meals) {
                if (meal.data.calories > 0) {
                    await NutritionLog.create({
                        date: selectedDate,
                        meal_number: meal.number,
                        items_consumed: [],
                        total_calories: meal.data.calories,
                        protein: meal.data.protein,
                        carbs: meal.data.carbs,
                        fat: meal.data.fat,
                    });
                }
            }

            setHasChanges(false);
            toast({
                title: "נשמר בהצלחה! ✅",
                description: `התזונה של ${new Date(selectedDate).toLocaleDateString('he-IL')} נשמרה`,
            });
            refetch();
        } catch (error) {
            console.error('Error saving nutrition:', error);
            toast({
                title: "שגיאה",
                description: "לא הצלחנו לשמור את התזונה. נסה שוב.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        refetch();
        setHasChanges(false);
    };

    return (
        <div className="min-h-screen bg-oxygym-dark pb-32">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <h1 className="text-3xl font-bold text-white mb-2">תפריט תזונה</h1>
                <p className="text-muted-foreground mb-4">סמן מה אכלת</p>

                <div className="mb-6">
                    <DateSelector />
                </div>

                {!isToday && (
                    <div className="mb-4 p-3 bg-oxygym-yellow/10 border border-oxygym-yellow rounded-lg">
                        <p className="text-center text-sm text-white">
                            📅 עורך נתונים של {new Date(selectedDate).toLocaleDateString('he-IL')}
                        </p>
                    </div>
                )}

                <CalorieChart
                    protein={totalProtein}
                    carbs={totalCarbs}
                    fat={totalFat}
                    totalCalories={totalCalories}
                />

                <div className="my-6">
                    <WaterTracker />
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
                                mealNumber={1}
                                selectedDate={selectedDate}
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
                                mealNumber={1}
                                selectedDate={selectedDate}
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
                                mealNumber={1}
                                selectedDate={selectedDate}
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
                                mealNumber={1}
                                selectedDate={selectedDate}
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
                                mealNumber={2}
                                selectedDate={selectedDate}
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
                                mealNumber={3}
                                selectedDate={selectedDate}
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
                                mealNumber={4}
                                selectedDate={selectedDate}
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
                                mealNumber={4}
                                selectedDate={selectedDate}
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
                                mealNumber={4}
                                selectedDate={selectedDate}
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
                                disabled={saving}
                                className="flex-1 bg-oxygym-yellow hover:bg-yellow-500 text-black font-bold"
                            >
                                <Save className="w-4 h-4 ml-2" />
                                {saving ? 'שומר...' : 'שמור תזונה'}
                            </Button>
                            <Button
                                onClick={handleCancel}
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