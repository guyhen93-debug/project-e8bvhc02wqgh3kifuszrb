import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MealItem } from '@/components/MealItem';
import { DateSelector } from '@/components/DateSelector';
import { RefreshCw, AlertCircle, CheckSquare, X, Info, AlertTriangle, Flame, Check } from 'lucide-react';
import { BreadIcon } from '@/components/icons/BreadIcon';
import { ChickenIcon } from '@/components/icons/ChickenIcon';
import { VegetablesIcon } from '@/components/icons/VegetablesIcon';
import { RiceIcon } from '@/components/icons/RiceIcon';
import { EggsIcon } from '@/components/icons/EggsIcon';
import { CheeseIcon } from '@/components/icons/CheeseIcon';
import { ShakerIcon } from '@/components/icons/ShakerIcon';
import { SalmonIcon } from '@/components/icons/SalmonIcon';
import { SweetPotatoIcon } from '@/components/icons/SweetPotatoIcon';
import { FishIcon } from '@/components/icons/FishIcon';
import { SteakIcon } from '@/components/icons/SteakIcon';
import { ChallaIcon } from '@/components/icons/ChallaIcon';
import { RoastedVegetablesIcon } from '@/components/icons/RoastedVegetablesIcon';
import { MoroccanFishIcon } from '@/components/icons/MoroccanFishIcon';
import { ChickenDrumstickIcon } from '@/components/icons/ChickenDrumstickIcon';
import { BulgurSaladIcon } from '@/components/icons/BulgurSaladIcon';
import { SirloinSteakIcon } from '@/components/icons/SirloinSteakIcon';
import { useToast } from '@/hooks/use-toast';
import { NutritionLog } from '@/entities';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDate } from '@/contexts/DateContext';

interface MealData {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface MealItemSelection {
    name: string;
    amount: number;
    checked: boolean;
}

interface MealItemDefinition {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    defaultAmount: number;
    unit: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
}

interface MealState {
    data: MealData;
    items: Record<string, MealItemSelection>;
}

// Meal definitions
const WEEKDAY_MEAL_1_DEFINITIONS: MealItemDefinition[] = [
    { name: 'לחם כוסמין', icon: BreadIcon, defaultAmount: 168, unit: 'גרם (4 פרוסות)', caloriesPer100g: 208.33, proteinPer100g: 5.95, carbsPer100g: 23.81, fatPer100g: 1.19 },
    { name: 'גבינה לבנה 5%', icon: CheeseIcon, defaultAmount: 100, unit: 'גרם', caloriesPer100g: 100, proteinPer100g: 10, carbsPer100g: 4, fatPer100g: 5 },
    { name: 'ביצים', icon: EggsIcon, defaultAmount: 136, unit: 'גרם (2 ביצים)', caloriesPer100g: 155.88, proteinPer100g: 9.56, carbsPer100g: 1.47, fatPer100g: 7.94 },
    { name: 'ירקות', icon: VegetablesIcon, defaultAmount: 200, unit: 'גרם', caloriesPer100g: 20, proteinPer100g: 0.5, carbsPer100g: 2, fatPer100g: 0.1 }
];

const WEEKDAY_MEAL_4_DEFINITIONS: MealItemDefinition[] = [
    { name: 'חזה עוף', icon: ChickenIcon, defaultAmount: 150, unit: 'גרם', caloriesPer100g: 166.67, proteinPer100g: 22, carbsPer100g: 0, fatPer100g: 2 },
    { name: 'אורז לבן', icon: RiceIcon, defaultAmount: 80, unit: 'גרם (לפני בישול)', caloriesPer100g: 350, proteinPer100g: 6.25, carbsPer100g: 100, fatPer100g: 1.25 },
    { name: 'ירקות', icon: VegetablesIcon, defaultAmount: 200, unit: 'גרם', caloriesPer100g: 7, proteinPer100g: 0.5, carbsPer100g: 2.5, fatPer100g: 0.25 }
];

const SHABBAT_MEAL_1_DEFINITIONS: MealItemDefinition[] = [
    { name: 'דג מרוקאי', icon: MoroccanFishIcon, defaultAmount: 160, unit: 'גרם (נתח דג)', caloriesPer100g: 125, proteinPer100g: 15.63, carbsPer100g: 0, fatPer100g: 6.25 },
    { name: 'חלה', icon: ChallaIcon, defaultAmount: 100, unit: 'גרם (חלה קטנה)', caloriesPer100g: 280, proteinPer100g: 9, carbsPer100g: 50, fatPer100g: 4.5 },
    { name: 'ירקות', icon: VegetablesIcon, defaultAmount: 200, unit: 'גרם', caloriesPer100g: 20, proteinPer100g: 0.5, carbsPer100g: 2.5, fatPer100g: 0.25 }
];

const SHABBAT_MEAL_2_DEFINITIONS: MealItemDefinition[] = [
    { name: 'כרעיי עוף', icon: ChickenDrumstickIcon, defaultAmount: 140, unit: 'גרם (שוק + ירך)', caloriesPer100g: 200, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 9.29 },
    { name: 'אורז', icon: RiceIcon, defaultAmount: 50, unit: 'גרם (לפני בישול)', caloriesPer100g: 360, proteinPer100g: 12, carbsPer100g: 100, fatPer100g: 3 },
    { name: 'ירקות', icon: VegetablesIcon, defaultAmount: 200, unit: 'גרם (סלט)', caloriesPer100g: 30, proteinPer100g: 0.5, carbsPer100g: 2.5, fatPer100g: 0.25 }
];

const SHABBAT_MEAL_3_DEFINITIONS: MealItemDefinition[] = [
    { name: 'סלמון', icon: SalmonIcon, defaultAmount: 120, unit: 'גרם', caloriesPer100g: 200, proteinPer100g: 20.83, carbsPer100g: 0, fatPer100g: 11.67 },
    { name: 'בטטה', icon: SweetPotatoIcon, defaultAmount: 200, unit: 'גרם', caloriesPer100g: 120, proteinPer100g: 4.5, carbsPer100g: 25, fatPer100g: 0.25 },
    { name: 'ירקות בתנור', icon: RoastedVegetablesIcon, defaultAmount: 300, unit: 'גרם', caloriesPer100g: 13.33, proteinPer100g: 0.33, carbsPer100g: 1.67, fatPer100g: 0.17 }
];

const SHABBAT_MEAL_4_DEFINITIONS: MealItemDefinition[] = [
    { name: 'סינטה', icon: SirloinSteakIcon, defaultAmount: 100, unit: 'גרם', caloriesPer100g: 280, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 13 },
    { name: 'סלט בורגול', icon: BulgurSaladIcon, defaultAmount: 50, unit: 'גרם', caloriesPer100g: 400, proteinPer100g: 18, carbsPer100g: 100, fatPer100g: 3 },
    { name: 'ירקות', icon: VegetablesIcon, defaultAmount: 300, unit: 'גרם', caloriesPer100g: 13.33, proteinPer100g: 0.33, carbsPer100g: 1.67, fatPer100g: 0.17 }
];

const emptyMealState: MealState = {
    data: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    items: {}
};

const Nutrition = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { selectedDate, isToday } = useDate();
    const [isShabbatMenu, setIsShabbatMenu] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
    const isInitialLoadRef = useRef(true);
    const userMadeChangeRef = useRef(false);
    const lastToastRef = useRef<number | null>(null);

    const weekdayMealsRef = useRef<Record<number, MealState>>({
        1: { ...emptyMealState },
        2: { ...emptyMealState },
        3: { ...emptyMealState },
        4: { ...emptyMealState },
    });
    const shabbatMealsRef = useRef<Record<number, MealState>>({
        1: { ...emptyMealState },
        2: { ...emptyMealState },
        3: { ...emptyMealState },
        4: { ...emptyMealState },
    });

    // Simplified state - one object per menu type
    const [weekdayMeals, setWeekdayMeals] = useState<Record<number, MealState>>({
        1: { ...emptyMealState },
        2: { ...emptyMealState },
        3: { ...emptyMealState },
        4: { ...emptyMealState },
    });

    const [shabbatMeals, setShabbatMeals] = useState<Record<number, MealState>>({
        1: { ...emptyMealState },
        2: { ...emptyMealState },
        3: { ...emptyMealState },
        4: { ...emptyMealState },
    });

    const currentMenuType = isShabbatMenu ? 'shabbat' : 'weekday';
    const currentMeals = isShabbatMenu ? shabbatMeals : weekdayMeals;
    const setCurrentMeals = isShabbatMenu ? setShabbatMeals : setWeekdayMeals;

    const { data: allDateMeals, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['nutrition-logs', selectedDate],
        queryFn: async () => {
            const logs = await NutritionLog.filter({ date: selectedDate });
            console.log('Loaded ALL nutrition logs for date:', selectedDate, logs);
            return logs;
        },
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 5 * 60 * 1000,
    });

    // Reset change flag when date changes so we can load fresh data for the new date
    useEffect(() => {
        userMadeChangeRef.current = false;
        setLastSavedAt(null);
    }, [selectedDate]);

    useEffect(() => {
        if (lastSavedAt) {
            const timeout = setTimeout(() => {
                setLastSavedAt(null);
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [lastSavedAt]);

    // Load data when date changes or data is fetched
    useEffect(() => {
        if (!allDateMeals) return;
        
        if (userMadeChangeRef.current) {
            console.log('Skipping data load as user has pending changes');
            return;
        }

        console.log('Loading data for date:', selectedDate);
        isInitialLoadRef.current = true;
        userMadeChangeRef.current = false;

        const newWeekdayMeals: Record<number, MealState> = {
            1: { ...emptyMealState },
            2: { ...emptyMealState },
            3: { ...emptyMealState },
            4: { ...emptyMealState },
        };

        const newShabbatMeals: Record<number, MealState> = {
            1: { ...emptyMealState },
            2: { ...emptyMealState },
            3: { ...emptyMealState },
            4: { ...emptyMealState },
        };

        // Process weekday meals
        const weekdayLogs = allDateMeals.filter((log: any) => log.menu_type === 'weekday');
        weekdayLogs.forEach((log: any) => {
            const items: Record<string, MealItemSelection> = {};
            if (log.items_consumed && Array.isArray(log.items_consumed)) {
                log.items_consumed.forEach((item: any) => {
                    items[item.name] = {
                        name: item.name,
                        amount: item.amount,
                        checked: true,
                    };
                });
            }

            const mealNum = log.meal_number;
            if (mealNum >= 1 && mealNum <= 4) {
                newWeekdayMeals[mealNum] = {
                    data: {
                        calories: log.total_calories || 0,
                        protein: log.protein || 0,
                        carbs: log.carbs || 0,
                        fat: log.fat || 0
                    },
                    items
                };
            }
        });

        // Process shabbat meals
        const shabbatLogs = allDateMeals.filter((log: any) => log.menu_type === 'shabbat');
        shabbatLogs.forEach((log: any) => {
            const items: Record<string, MealItemSelection> = {};
            if (log.items_consumed && Array.isArray(log.items_consumed)) {
                log.items_consumed.forEach((item: any) => {
                    items[item.name] = {
                        name: item.name,
                        amount: item.amount,
                        checked: true,
                    };
                });
            }

            const mealNum = log.meal_number;
            if (mealNum >= 1 && mealNum <= 4) {
                newShabbatMeals[mealNum] = {
                    data: {
                        calories: log.total_calories || 0,
                        protein: log.protein || 0,
                        carbs: log.carbs || 0,
                        fat: log.fat || 0
                    },
                    items
                };
            }
        });

        setWeekdayMeals(newWeekdayMeals);
        setShabbatMeals(newShabbatMeals);

        // Update refs for robust auto-save
        weekdayMealsRef.current = newWeekdayMeals;
        shabbatMealsRef.current = newShabbatMeals;

        setTimeout(() => {
            isInitialLoadRef.current = false;
        }, 100);
    }, [selectedDate, allDateMeals]);

    // Calculate totals
    const totals = useMemo(() => {
        let calories = 0, protein = 0, carbs = 0, fat = 0;

        Object.values(weekdayMeals).forEach(meal => {
            calories += meal.data.calories;
            protein += meal.data.protein;
            carbs += meal.data.carbs;
            fat += meal.data.fat;
        });

        Object.values(shabbatMeals).forEach(meal => {
            calories += meal.data.calories;
            protein += meal.data.protein;
            carbs += meal.data.carbs;
            fat += meal.data.fat;
        });

        return { calories, protein, carbs, fat };
    }, [weekdayMeals, shabbatMeals]);

    const saveNutritionNow = async (
        weekdayMealsSnapshot: Record<number, MealState>,
        shabbatMealsSnapshot: Record<number, MealState>
    ) => {
        if (isInitialLoadRef.current) {
            return;
        }

        try {
            setSaving(true);
            
            // Fetch existing logs for the selected date once
            const existingLogs = await NutritionLog.filter({ date: selectedDate });

            // Helper to save one menu type
            const saveMenuType = async (menuType: 'weekday' | 'shabbat', meals: Record<number, MealState>) => {
                const hasAnyCalories = Object.values(meals).some(meal => meal.data.calories > 0);
                
                const logsToDelete = existingLogs.filter((log: any) => 
                    log.menu_type === menuType || (!log.menu_type && menuType === 'weekday')
                );

                for (const log of logsToDelete) {
                    await NutritionLog.delete(log.id);
                }

                if (!hasAnyCalories) return;

                for (let mealNum = 1; mealNum <= 4; mealNum++) {
                    const meal = meals[mealNum];
                    if (!meal || meal.data.calories <= 0) continue;

                    const itemsConsumed = Object.values(meal.items)
                        .filter(item => item.checked)
                        .map(item => ({ name: item.name, amount: item.amount }));

                    await NutritionLog.create({
                        date: selectedDate,
                        menu_type: menuType,
                        meal_number: mealNum,
                        items_consumed: itemsConsumed,
                        total_calories: meal.data.calories,
                        protein: meal.data.protein,
                        carbs: meal.data.carbs,
                        fat: meal.data.fat,
                    });
                }
            };

            await saveMenuType('weekday', weekdayMealsSnapshot);
            await saveMenuType('shabbat', shabbatMealsSnapshot);

            // Update React Query cache immediately with fresh data
            const freshLogs = await NutritionLog.filter({ date: selectedDate });
            queryClient.setQueryData(['nutrition-logs', selectedDate], freshLogs || []);
            
            // Mark changes as saved
            userMadeChangeRef.current = false;
            setLastSavedAt(Date.now());

            if (!lastToastRef.current || Date.now() - lastToastRef.current > 8000) {
                toast({
                    title: 'התזונה נשמרה',
                    description: 'השינויים בתפריט נשמרו בהצלחה.',
                    duration: 2500,
                });
                lastToastRef.current = Date.now();
            }
        } catch (error) {
            console.error('Error saving nutrition:', error);
        } finally {
            // Smooth the transition out
            setTimeout(() => {
                setSaving(false);
            }, 600);
        }
    };

    const handleMenuToggle = (nextIsShabbat: boolean) => {
        setIsShabbatMenu(nextIsShabbat);
    };

    const updateMeal = (mealNum: number, updates: Partial<MealState>) => {
        userMadeChangeRef.current = true;

        if (isShabbatMenu) {
            setShabbatMeals(prev => {
                const updated = {
                    ...prev,
                    [mealNum]: {
                        ...prev[mealNum],
                        ...updates,
                        data: updates.data ? { ...prev[mealNum].data, ...updates.data } : prev[mealNum].data,
                        items: updates.items ? { ...prev[mealNum].items, ...updates.items } : prev[mealNum].items,
                    },
                };
                shabbatMealsRef.current = updated;
                void saveNutritionNow(weekdayMealsRef.current, updated);
                return updated;
            });
        } else {
            setWeekdayMeals(prev => {
                const updated = {
                    ...prev,
                    [mealNum]: {
                        ...prev[mealNum],
                        ...updates,
                        data: updates.data ? { ...prev[mealNum].data, ...updates.data } : prev[mealNum].data,
                        items: updates.items ? { ...prev[mealNum].items, ...updates.items } : prev[mealNum].items,
                    },
                };
                weekdayMealsRef.current = updated;
                void saveNutritionNow(updated, shabbatMealsRef.current);
                return updated;
            });
        }
    };

    const handleMealItemToggle = (
        mealNum: number,
        itemName: string,
        checked: boolean,
        amount: number,
        calories: number,
        protein: number,
        carbs: number,
        fat: number
    ) => {
        const meal = currentMeals[mealNum];
        const newItems = {
            ...meal.items,
            [itemName]: { name: itemName, amount, checked }
        };

        const newData = { ...meal.data };
        if (checked) {
            newData.calories += calories;
            newData.protein += protein;
            newData.carbs += carbs;
            newData.fat += fat;
        } else {
            newData.calories = Math.max(0, newData.calories - calories);
            newData.protein = Math.max(0, newData.protein - protein);
            newData.carbs = Math.max(0, newData.carbs - carbs);
            newData.fat = Math.max(0, newData.fat - fat);
        }

        updateMeal(mealNum, { data: newData, items: newItems });
    };

    const selectAllMealItems = (mealNum: number, mealItems: MealItemDefinition[]) => {
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;

        const newItems: Record<string, MealItemSelection> = {};

        mealItems.forEach(item => {
            const multiplier = item.defaultAmount / 100;
            totalCalories += item.caloriesPer100g * multiplier;
            totalProtein += item.proteinPer100g * multiplier;
            totalCarbs += item.carbsPer100g * multiplier;
            totalFat += item.fatPer100g * multiplier;

            newItems[item.name] = {
                name: item.name,
                amount: item.defaultAmount,
                checked: true
            };
        });

        updateMeal(mealNum, {
            data: { calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fat: totalFat },
            items: newItems
        });
    };

    const clearAllMealItems = (mealNum: number) => {
        updateMeal(mealNum, {
            data: { calories: 0, protein: 0, carbs: 0, fat: 0 },
            items: {}
        });
    };

    const isAllSelected = (mealNum: number, mealItems: MealItemDefinition[]) => {
        const meal = currentMeals[mealNum];
        return mealItems.every(item => meal.items[item.name]?.checked === true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-oxygym-dark flex items-center justify-center pb-20">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-oxygym-yellow mb-4"></div>
                    <p className="text-white text-lg">טוען תזונה...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-oxygym-dark flex items-center justify-center pb-20 px-4">
                <Card className="bg-oxygym-darkGrey border-red-500 max-w-md w-full">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">אופס! משהו השתבש</h2>
                        <p className="text-muted-foreground mb-6">
                            לא הצלחנו לטעון את נתוני התזונה. בדוק את החיבור לאינטרנט ונסה שוב.
                        </p>
                        <Button onClick={() => refetch()} className="w-full bg-oxygym-yellow hover:bg-yellow-500 text-black font-bold">
                            <RefreshCw className="w-4 h-4 ml-2" />
                            נסה שוב
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-oxygym-dark pb-20">
            <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-3xl">
                <div className="mb-4 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">תפריט תזונה</h1>
                    <div className="flex items-center justify-between">
                        <p className="text-sm sm:text-base text-muted-foreground">סמן מה אכלת</p>
                        {saving ? (
                            <p className="text-xs text-oxygym-yellow animate-pulse">שומר אוטומטית...</p>
                        ) : lastSavedAt ? (
                            <div className="flex items-center gap-1 text-xs text-green-400 animate-in fade-in slide-in-from-top-1">
                                <Check className="w-3 h-3" />
                                <span>נשמר אוטומטית</span>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="mb-4 sm:mb-6">
                    <DateSelector />
                </div>

                {!isToday && (
                    <div className="mb-4 p-3 bg-oxygym-yellow/10 border border-oxygym-yellow rounded-lg">
                        <p className="text-center text-xs sm:text-sm text-white">
                            📅 עורך נתונים של {new Date(selectedDate).toLocaleDateString('he-IL')}
                        </p>
                    </div>
                )}

                {/* Menu Type Toggle */}
                <Card className="bg-oxygym-darkGrey border-oxygym-yellow/20 mb-4 sm:mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="menu-toggle" className="text-white font-bold text-sm sm:text-base cursor-pointer">
                                {isShabbatMenu ? '🕯️ תפריט שבת' : '📅 תפריט יומי'}
                            </Label>
                            <Switch
                                id="menu-toggle"
                                checked={isShabbatMenu}
                                onCheckedChange={handleMenuToggle}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {isShabbatMenu ? 'תפריט מיוחד לשבת' : 'תפריט רגיל לימי חול'}
                        </p>
                    </CardContent>
                </Card>

                {/* Shabbat Important Notes */}
                {isShabbatMenu && (
                    <div className="mb-4 space-y-3">
                        <Card className="bg-oxygym-yellow/20 border-2 border-oxygym-yellow">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-oxygym-yellow flex-shrink-0 mt-0.5" />
                                    <p className="text-sm sm:text-base text-white font-semibold">
                                        ארוחה כזאת מחליפה ארוחה אחת ביום
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-red-500/20 border-2 border-red-500">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-start gap-3">
                                    <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm sm:text-base text-white font-bold leading-relaxed">
                                            בקינוחים, בפיצוחים ובפירות - אומרים "לא"!
                                        </p>
                                        <p className="text-xs sm:text-sm text-red-200 mt-1 leading-relaxed">
                                            נמצאים בגירעון גם בשבת, וממשיכים לעבר משקל היעד!
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Weekday Meals */}
                {!isShabbatMenu && (
                    <>
                        <Card className="bg-oxygym-darkGrey border-oxygym-yellow/20 mb-4">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg sm:text-xl text-white">🌅 ארוחה 1 - בוקר (10:00)</CardTitle>
                                    <div className="flex gap-2">
                                        {!isAllSelected(1, WEEKDAY_MEAL_1_DEFINITIONS) ? (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => selectAllMealItems(1, WEEKDAY_MEAL_1_DEFINITIONS)}
                                                className="h-8 text-xs text-oxygym-yellow hover:text-oxygym-yellow hover:bg-oxygym-yellow/10"
                                            >
                                                <CheckSquare className="w-4 h-4 ml-1" />
                                                סמן הכל
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => clearAllMealItems(1)}
                                                className="h-8 text-xs text-red-400 hover:text-red-400 hover:bg-red-400/10"
                                            >
                                                <X className="w-4 h-4 ml-1" />
                                                נקה
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {currentMeals[1].data.calories.toFixed(0)} קלוריות | {currentMeals[1].data.protein.toFixed(0)}ג׳ חלבון
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                {WEEKDAY_MEAL_1_DEFINITIONS.map((item) => (
                                    <MealItem
                                        key={item.name}
                                        name={item.name}
                                        icon={item.icon}
                                        defaultAmount={item.defaultAmount}
                                        unit={item.unit}
                                        caloriesPer100g={item.caloriesPer100g}
                                        proteinPer100g={item.proteinPer100g}
                                        carbsPer100g={item.carbsPer100g}
                                        fatPer100g={item.fatPer100g}
                                        initialChecked={currentMeals[1].items[item.name]?.checked || false}
                                        initialAmount={currentMeals[1].items[item.name]?.amount}
                                        onToggle={(checked, amount, calories, protein, carbs, fat) =>
                                            handleMealItemToggle(1, item.name, checked, amount, calories, protein, carbs, fat)
                                        }
                                    />
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-oxygym-darkGrey border-oxygym-yellow/20 mb-4">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg sm:text-xl text-white">🥤 ארוחה 2 (12:30)</CardTitle>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {currentMeals[2].data.calories.toFixed(0)} קלוריות | {currentMeals[2].data.protein.toFixed(0)}ג׳ חלבון
                                </p>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-3">
                                    <MealItem
                                        name="שייקר חלבון"
                                        icon={ShakerIcon}
                                        defaultAmount={30}
                                        unit="גרם אבקה"
                                        caloriesPer100g={1940}
                                        proteinPer100g={75}
                                        carbsPer100g={300}
                                        fatPer100g={10}
                                        initialChecked={currentMeals[2].items['שייקר חלבון']?.checked || false}
                                        initialAmount={currentMeals[2].items['שייקר חלבון']?.amount}
                                        onToggle={(checked, amount, calories, protein, carbs, fat) =>
                                            handleMealItemToggle(2, 'שייקר חלבון', checked, amount, calories, protein, carbs, fat)
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-oxygym-darkGrey border-oxygym-yellow/20 mb-4">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg sm:text-xl text-white">⚡ ארוחה 3 (15:30)</CardTitle>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {currentMeals[3].data.calories.toFixed(0)} קלוריות | {currentMeals[3].data.protein.toFixed(0)}ג׳ חלבון
                                </p>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-3">
                                    <MealItem
                                        name="שייקר חלבון"
                                        icon={ShakerIcon}
                                        defaultAmount={30}
                                        unit="גרם אבקה"
                                        caloriesPer100g={1940}
                                        proteinPer100g={75}
                                        carbsPer100g={300}
                                        fatPer100g={10}
                                        initialChecked={currentMeals[3].items['שייקר חלבון']?.checked || false}
                                        initialAmount={currentMeals[3].items['שייקר חלבון']?.amount}
                                        onToggle={(checked, amount, calories, protein, carbs, fat) =>
                                            handleMealItemToggle(3, 'שייקר חלבון', checked, amount, calories, protein, carbs, fat)
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-oxygym-darkGrey border-oxygym-yellow/20 mb-6">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg sm:text-xl text-white">🌙 ארוחה 4 - ערב (22:00)</CardTitle>
                                    <div className="flex gap-2">
                                        {!isAllSelected(4, WEEKDAY_MEAL_4_DEFINITIONS) ? (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => selectAllMealItems(4, WEEKDAY_MEAL_4_DEFINITIONS)}
                                                className="h-8 text-xs text-oxygym-yellow hover:text-oxygym-yellow hover:bg-oxygym-yellow/10"
                                            >
                                                <CheckSquare className="w-4 h-4 ml-1" />
                                                סמן הכל
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => clearAllMealItems(4)}
                                                className="h-8 text-xs text-red-400 hover:text-red-400 hover:bg-red-400/10"
                                            >
                                                <X className="w-4 h-4 ml-1" />
                                                נקה
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {currentMeals[4].data.calories.toFixed(0)} קלוריות | {currentMeals[4].data.protein.toFixed(0)}ג׳ חלבון
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                {WEEKDAY_MEAL_4_DEFINITIONS.map((item) => (
                                    <MealItem
                                        key={item.name}
                                        name={item.name}
                                        icon={item.icon}
                                        defaultAmount={item.defaultAmount}
                                        unit={item.unit}
                                        caloriesPer100g={item.caloriesPer100g}
                                        proteinPer100g={item.proteinPer100g}
                                        carbsPer100g={item.carbsPer100g}
                                        fatPer100g={item.fatPer100g}
                                        initialChecked={currentMeals[4].items[item.name]?.checked || false}
                                        initialAmount={currentMeals[4].items[item.name]?.amount}
                                        onToggle={(checked, amount, calories, protein, carbs, fat) =>
                                            handleMealItemToggle(4, item.name, checked, amount, calories, protein, carbs, fat)
                                        }
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Shabbat Meals */}
                {isShabbatMenu && (
                    <>
                        <Card className="bg-oxygym-darkGrey border-oxygym-yellow/20 mb-4">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg sm:text-xl text-white">🕯️ סעודה ראשונה - ערב שבת</CardTitle>
                                    <div className="flex gap-2">
                                        {!isAllSelected(1, SHABBAT_MEAL_1_DEFINITIONS) ? (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => selectAllMealItems(1, SHABBAT_MEAL_1_DEFINITIONS)}
                                                className="h-8 text-xs text-oxygym-yellow hover:text-oxygym-yellow hover:bg-oxygym-yellow/10"
                                            >
                                                <CheckSquare className="w-4 h-4 ml-1" />
                                                סמן הכל
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => clearAllMealItems(1)}
                                                className="h-8 text-xs text-red-400 hover:text-red-400 hover:bg-red-400/10"
                                            >
                                                <X className="w-4 h-4 ml-1" />
                                                נקה
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {currentMeals[1].data.calories.toFixed(0)} קלוריות | {currentMeals[1].data.protein.toFixed(0)}ג׳ חלבון
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                {SHABBAT_MEAL_1_DEFINITIONS.map((item) => (
                                    <MealItem
                                        key={item.name}
                                        name={item.name}
                                        icon={item.icon}
                                        defaultAmount={item.defaultAmount}
                                        unit={item.unit}
                                        caloriesPer100g={item.caloriesPer100g}
                                        proteinPer100g={item.proteinPer100g}
                                        carbsPer100g={item.carbsPer100g}
                                        fatPer100g={item.fatPer100g}
                                        initialChecked={currentMeals[1].items[item.name]?.checked || false}
                                        initialAmount={currentMeals[1].items[item.name]?.amount}
                                        onToggle={(checked, amount, calories, protein, carbs, fat) =>
                                            handleMealItemToggle(1, item.name, checked, amount, calories, protein, carbs, fat)
                                        }
                                    />
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-oxygym-darkGrey border-oxygym-yellow/20 mb-4">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg sm:text-xl text-white">☀️ סעודה שנייה - יום שבת</CardTitle>
                                    <div className="flex gap-2">
                                        {!isAllSelected(2, SHABBAT_MEAL_2_DEFINITIONS) ? (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => selectAllMealItems(2, SHABBAT_MEAL_2_DEFINITIONS)}
                                                className="h-8 text-xs text-oxygym-yellow hover:text-oxygym-yellow hover:bg-oxygym-yellow/10"
                                            >
                                                <CheckSquare className="w-4 h-4 ml-1" />
                                                סמן הכל
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => clearAllMealItems(2)}
                                                className="h-8 text-xs text-red-400 hover:text-red-400 hover:bg-red-400/10"
                                            >
                                                <X className="w-4 h-4 ml-1" />
                                                נקה
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {currentMeals[2].data.calories.toFixed(0)} קלוריות | {currentMeals[2].data.protein.toFixed(0)}ג׳ חלבון
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                {SHABBAT_MEAL_2_DEFINITIONS.map((item) => (
                                    <MealItem
                                        key={item.name}
                                        name={item.name}
                                        icon={item.icon}
                                        defaultAmount={item.defaultAmount}
                                        unit={item.unit}
                                        caloriesPer100g={item.caloriesPer100g}
                                        proteinPer100g={item.proteinPer100g}
                                        carbsPer100g={item.carbsPer100g}
                                        fatPer100g={item.fatPer100g}
                                        initialChecked={currentMeals[2].items[item.name]?.checked || false}
                                        initialAmount={currentMeals[2].items[item.name]?.amount}
                                        onToggle={(checked, amount, calories, protein, carbs, fat) =>
                                            handleMealItemToggle(2, item.name, checked, amount, calories, protein, carbs, fat)
                                        }
                                    />
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-oxygym-darkGrey border-oxygym-yellow/20 mb-4">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg sm:text-xl text-white">🌆 סעודה שלישית - אחר הצהריים</CardTitle>
                                    <div className="flex gap-2">
                                        {!isAllSelected(3, SHABBAT_MEAL_3_DEFINITIONS) ? (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => selectAllMealItems(3, SHABBAT_MEAL_3_DEFINITIONS)}
                                                className="h-8 text-xs text-oxygym-yellow hover:text-oxygym-yellow hover:bg-oxygym-yellow/10"
                                            >
                                                <CheckSquare className="w-4 h-4 ml-1" />
                                                סמן הכל
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => clearAllMealItems(3)}
                                                className="h-8 text-xs text-red-400 hover:text-red-400 hover:bg-red-400/10"
                                            >
                                                <X className="w-4 h-4 ml-1" />
                                                נקה
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {currentMeals[3].data.calories.toFixed(0)} קלוריות | {currentMeals[3].data.protein.toFixed(0)}ג׳ חלבון
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                {SHABBAT_MEAL_3_DEFINITIONS.map((item) => (
                                    <MealItem
                                        key={item.name}
                                        name={item.name}
                                        icon={item.icon}
                                        defaultAmount={item.defaultAmount}
                                        unit={item.unit}
                                        caloriesPer100g={item.caloriesPer100g}
                                        proteinPer100g={item.proteinPer100g}
                                        carbsPer100g={item.carbsPer100g}
                                        fatPer100g={item.fatPer100g}
                                        initialChecked={currentMeals[3].items[item.name]?.checked || false}
                                        initialAmount={currentMeals[3].items[item.name]?.amount}
                                        onToggle={(checked, amount, calories, protein, carbs, fat) =>
                                            handleMealItemToggle(3, item.name, checked, amount, calories, protein, carbs, fat)
                                        }
                                    />
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-oxygym-darkGrey border-oxygym-yellow/20 mb-6">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg sm:text-xl text-white">🌙 סעודה רביעית - מוצאי שבת</CardTitle>
                                    <div className="flex gap-2">
                                        {!isAllSelected(4, SHABBAT_MEAL_4_DEFINITIONS) ? (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => selectAllMealItems(4, SHABBAT_MEAL_4_DEFINITIONS)}
                                                className="h-8 text-xs text-oxygym-yellow hover:text-oxygym-yellow hover:bg-oxygym-yellow/10"
                                            >
                                                <CheckSquare className="w-4 h-4 ml-1" />
                                                סמן הכל
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => clearAllMealItems(4)}
                                                className="h-8 text-xs text-red-400 hover:text-red-400 hover:bg-red-400/10"
                                            >
                                                <X className="w-4 h-4 ml-1" />
                                                נקה
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {currentMeals[4].data.calories.toFixed(0)} קלוריות | {currentMeals[4].data.protein.toFixed(0)}ג׳ חלבון
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                {SHABBAT_MEAL_4_DEFINITIONS.map((item) => (
                                    <MealItem
                                        key={item.name}
                                        name={item.name}
                                        icon={item.icon}
                                        defaultAmount={item.defaultAmount}
                                        unit={item.unit}
                                        caloriesPer100g={item.caloriesPer100g}
                                        proteinPer100g={item.proteinPer100g}
                                        carbsPer100g={item.carbsPer100g}
                                        fatPer100g={item.fatPer100g}
                                        initialChecked={currentMeals[4].items[item.name]?.checked || false}
                                        initialAmount={currentMeals[4].items[item.name]?.amount}
                                        onToggle={(checked, amount, calories, protein, carbs, fat) =>
                                            handleMealItemToggle(4, item.name, checked, amount, calories, protein, carbs, fat)
                                        }
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
};

export default Nutrition;
