import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MealItem } from '@/components/MealItem';
import { CalorieChart } from '@/components/CalorieChart';
import { WaterTracker } from '@/components/WaterTracker';
import { DateSelector } from '@/components/DateSelector';
import { RefreshCw, AlertCircle, CheckSquare, X } from 'lucide-react';
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
import { useQuery } from '@tanstack/react-query';
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

// Meal definitions
const WEEKDAY_MEAL_1_DEFINITIONS: MealItemDefinition[] = [
    { name: 'לחם כוסמין', icon: BreadIcon, defaultAmount: 168, unit: 'גרם (4 פרוסות)', caloriesPer100g: 216, proteinPer100g: 11.9, carbsPer100g: 47.6, fatPer100g: 1.9 },
    { name: 'גבינה לבנה 5%', icon: CheeseIcon, defaultAmount: 100, unit: 'גרם', caloriesPer100g: 98, proteinPer100g: 9, carbsPer100g: 4.3, fatPer100g: 5 },
    { name: 'ביצים', icon: EggsIcon, defaultAmount: 136, unit: 'גרם (2 ביצים)', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11 },
    { name: 'ירקות', icon: VegetablesIcon, defaultAmount: 200, unit: 'גרם', caloriesPer100g: 30, proteinPer100g: 0.5, carbsPer100g: 6.5, fatPer100g: 0.2 }
];

const WEEKDAY_MEAL_4_DEFINITIONS: MealItemDefinition[] = [
    { name: 'חזה עוף', icon: ChickenIcon, defaultAmount: 150, unit: 'גרם', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
    { name: 'אורז לבן', icon: RiceIcon, defaultAmount: 80, unit: 'גרם (לפני בישול)', caloriesPer100g: 349, proteinPer100g: 7.3, carbsPer100g: 78.5, fatPer100g: 0.7 },
    { name: 'ירקות', icon: VegetablesIcon, defaultAmount: 200, unit: 'גרם', caloriesPer100g: 30, proteinPer100g: 0.5, carbsPer100g: 6.5, fatPer100g: 0.2 }
];

const SHABBAT_MEAL_1_DEFINITIONS: MealItemDefinition[] = [
    { name: 'דג מרוקאי', icon: MoroccanFishIcon, defaultAmount: 160, unit: 'גרם (נתח דג)', caloriesPer100g: 128, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 2.7 },
    { name: 'חלה', icon: ChallaIcon, defaultAmount: 100, unit: 'גרם (חלה קטנה)', caloriesPer100g: 239, proteinPer100g: 8, carbsPer100g: 48, fatPer100g: 1.7 },
    { name: 'ירקות', icon: VegetablesIcon, defaultAmount: 200, unit: 'גרם', caloriesPer100g: 30, proteinPer100g: 0.5, carbsPer100g: 6.5, fatPer100g: 0.2 }
];

const SHABBAT_MEAL_2_DEFINITIONS: MealItemDefinition[] = [
    { name: 'כרעיי עוף', icon: ChickenDrumstickIcon, defaultAmount: 140, unit: 'גרם (שוק + ירך)', caloriesPer100g: 234, proteinPer100g: 27, carbsPer100g: 0, fatPer100g: 14 },
    { name: 'אורז', icon: RiceIcon, defaultAmount: 50, unit: 'גרם (לפני בישול)', caloriesPer100g: 349, proteinPer100g: 7.3, carbsPer100g: 78.5, fatPer100g: 0.7 },
    { name: 'ירקות', icon: VegetablesIcon, defaultAmount: 200, unit: 'גרם (סלט)', caloriesPer100g: 30, proteinPer100g: 0.5, carbsPer100g: 6.5, fatPer100g: 0.2 }
];

const SHABBAT_MEAL_3_DEFINITIONS: MealItemDefinition[] = [
    { name: 'סלמון', icon: SalmonIcon, defaultAmount: 120, unit: 'גרם', caloriesPer100g: 203, proteinPer100g: 20.4, carbsPer100g: 0, fatPer100g: 13.4 },
    { name: 'בטטה', icon: SweetPotatoIcon, defaultAmount: 200, unit: 'גרם', caloriesPer100g: 87, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1 },
    { name: 'ירקות בתנור', icon: RoastedVegetablesIcon, defaultAmount: 300, unit: 'גרם', caloriesPer100g: 30, proteinPer100g: 0.5, carbsPer100g: 6.5, fatPer100g: 0.2 }
];

const SHABBAT_MEAL_4_DEFINITIONS: MealItemDefinition[] = [
    { name: 'סינטה', icon: SirloinSteakIcon, defaultAmount: 100, unit: 'גרם', caloriesPer100g: 234, proteinPer100g: 27, carbsPer100g: 0, fatPer100g: 14 },
    { name: 'סלט בורגול', icon: BulgurSaladIcon, defaultAmount: 50, unit: 'גרם', caloriesPer100g: 364, proteinPer100g: 12, carbsPer100g: 76, fatPer100g: 1.3 },
    { name: 'ירקות', icon: VegetablesIcon, defaultAmount: 300, unit: 'גרם', caloriesPer100g: 30, proteinPer100g: 0.5, carbsPer100g: 6.5, fatPer100g: 0.2 }
];

const Nutrition = () => {
    const { toast } = useToast();
    const { selectedDate, isToday } = useDate();
    const [isShabbatMenu, setIsShabbatMenu] = useState(false);
    
    // Weekday meals state
    const [weekdayMeal1Data, setWeekdayMeal1Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [weekdayMeal2Data, setWeekdayMeal2Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [weekdayMeal3Data, setWeekdayMeal3Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [weekdayMeal4Data, setWeekdayMeal4Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [weekdayMeal1Items, setWeekdayMeal1Items] = useState<Record<string, MealItemSelection>>({});
    const [weekdayMeal2Items, setWeekdayMeal2Items] = useState<Record<string, MealItemSelection>>({});
    const [weekdayMeal3Items, setWeekdayMeal3Items] = useState<Record<string, MealItemSelection>>({});
    const [weekdayMeal4Items, setWeekdayMeal4Items] = useState<Record<string, MealItemSelection>>({});

    // Shabbat meals state
    const [shabbatMeal1Data, setShabbatMeal1Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [shabbatMeal2Data, setShabbatMeal2Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [shabbatMeal3Data, setShabbatMeal3Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [shabbatMeal4Data, setShabbatMeal4Data] = useState<MealData>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [shabbatMeal1Items, setShabbatMeal1Items] = useState<Record<string, MealItemSelection>>({});
    const [shabbatMeal2Items, setShabbatMeal2Items] = useState<Record<string, MealItemSelection>>({});
    const [shabbatMeal3Items, setShabbatMeal3Items] = useState<Record<string, MealItemSelection>>({});
    const [shabbatMeal4Items, setShabbatMeal4Items] = useState<Record<string, MealItemSelection>>({});

    const [saving, setSaving] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout>();
    const isInitialLoadRef = useRef(true);
    const userMadeChangeRef = useRef(false);

    const currentMenuType = isShabbatMenu ? 'shabbat' : 'weekday';

    // Display data based on current menu
    const meal1Data = isShabbatMenu ? shabbatMeal1Data : weekdayMeal1Data;
    const meal2Data = isShabbatMenu ? shabbatMeal2Data : weekdayMeal2Data;
    const meal3Data = isShabbatMenu ? shabbatMeal3Data : weekdayMeal3Data;
    const meal4Data = isShabbatMenu ? shabbatMeal4Data : weekdayMeal4Data;
    const meal1Items = isShabbatMenu ? shabbatMeal1Items : weekdayMeal1Items;
    const meal2Items = isShabbatMenu ? shabbatMeal2Items : weekdayMeal2Items;
    const meal3Items = isShabbatMenu ? shabbatMeal3Items : weekdayMeal3Items;
    const meal4Items = isShabbatMenu ? shabbatMeal4Items : weekdayMeal4Items;

    // Setters based on current menu
    const setMeal1Data = isShabbatMenu ? setShabbatMeal1Data : setWeekdayMeal1Data;
    const setMeal2Data = isShabbatMenu ? setShabbatMeal2Data : setWeekdayMeal2Data;
    const setMeal3Data = isShabbatMenu ? setShabbatMeal3Data : setWeekdayMeal3Data;
    const setMeal4Data = isShabbatMenu ? setShabbatMeal4Data : setWeekdayMeal4Data;
    const setMeal1Items = isShabbatMenu ? setShabbatMeal1Items : setWeekdayMeal1Items;
    const setMeal2Items = isShabbatMenu ? setShabbatMeal2Items : setWeekdayMeal2Items;
    const setMeal3Items = isShabbatMenu ? setShabbatMeal3Items : setWeekdayMeal3Items;
    const setMeal4Items = isShabbatMenu ? setShabbatMeal4Items : setWeekdayMeal4Items;

    const { data: allDateMeals, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['nutrition-logs', selectedDate],
        queryFn: async () => {
            const logs = await NutritionLog.filter({ date: selectedDate });
            console.log('Loaded ALL nutrition logs for date:', selectedDate, logs);
            return logs;
        },
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        staleTime: 30000,
    });

    // Load data from DB when date changes
    useEffect(() => {
        console.log('Date changed to:', selectedDate);
        isInitialLoadRef.current = true;
        userMadeChangeRef.current = false;
        
        // Reset all states
        setWeekdayMeal1Data({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        setWeekdayMeal2Data({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        setWeekdayMeal3Data({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        setWeekdayMeal4Data({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        setWeekdayMeal1Items({});
        setWeekdayMeal2Items({});
        setWeekdayMeal3Items({});
        setWeekdayMeal4Items({});
        
        setShabbatMeal1Data({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        setShabbatMeal2Data({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        setShabbatMeal3Data({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        setShabbatMeal4Data({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        setShabbatMeal1Items({});
        setShabbatMeal2Items({});
        setShabbatMeal3Items({});
        setShabbatMeal4Items({});
        
        setDataLoaded(false);
        
        if (allDateMeals && allDateMeals.length > 0) {
            console.log('Processing loaded meals for both menus');
            
            // Process weekday meals
            const weekdayMeals = allDateMeals.filter((log: any) => log.menu_type === 'weekday');
            weekdayMeals.forEach((log: any) => {
                const items: Record<string, MealItemSelection> = {};
                
                if (log.items_consumed && Array.isArray(log.items_consumed) && log.items_consumed.length > 0) {
                    console.log(`Weekday Meal ${log.meal_number} items from DB:`, log.items_consumed);
                    log.items_consumed.forEach((item: any) => {
                        items[item.name] = {
                            name: item.name,
                            amount: item.amount,
                            checked: true,
                        };
                    });
                }

                switch (log.meal_number) {
                    case 1:
                        setWeekdayMeal1Items(items);
                        setWeekdayMeal1Data({
                            calories: log.total_calories || 0,
                            protein: log.protein || 0,
                            carbs: log.carbs || 0,
                            fat: log.fat || 0
                        });
                        break;
                    case 2:
                        setWeekdayMeal2Items(items);
                        setWeekdayMeal2Data({
                            calories: log.total_calories || 0,
                            protein: log.protein || 0,
                            carbs: log.carbs || 0,
                            fat: log.fat || 0
                        });
                        break;
                    case 3:
                        setWeekdayMeal3Items(items);
                        setWeekdayMeal3Data({
                            calories: log.total_calories || 0,
                            protein: log.protein || 0,
                            carbs: log.carbs || 0,
                            fat: log.fat || 0
                        });
                        break;
                    case 4:
                        setWeekdayMeal4Items(items);
                        setWeekdayMeal4Data({
                            calories: log.total_calories || 0,
                            protein: log.protein || 0,
                            carbs: log.carbs || 0,
                            fat: log.fat || 0
                        });
                        break;
                }
            });

            // Process shabbat meals
            const shabbatMeals = allDateMeals.filter((log: any) => log.menu_type === 'shabbat');
            shabbatMeals.forEach((log: any) => {
                const items: Record<string, MealItemSelection> = {};
                
                if (log.items_consumed && Array.isArray(log.items_consumed) && log.items_consumed.length > 0) {
                    console.log(`Shabbat Meal ${log.meal_number} items from DB:`, log.items_consumed);
                    log.items_consumed.forEach((item: any) => {
                        items[item.name] = {
                            name: item.name,
                            amount: item.amount,
                            checked: true,
                        };
                    });
                }

                switch (log.meal_number) {
                    case 1:
                        setShabbatMeal1Items(items);
                        setShabbatMeal1Data({
                            calories: log.total_calories || 0,
                            protein: log.protein || 0,
                            carbs: log.carbs || 0,
                            fat: log.fat || 0
                        });
                        break;
                    case 2:
                        setShabbatMeal2Items(items);
                        setShabbatMeal2Data({
                            calories: log.total_calories || 0,
                            protein: log.protein || 0,
                            carbs: log.carbs || 0,
                            fat: log.fat || 0
                        });
                        break;
                    case 3:
                        setShabbatMeal3Items(items);
                        setShabbatMeal3Data({
                            calories: log.total_calories || 0,
                            protein: log.protein || 0,
                            carbs: log.carbs || 0,
                            fat: log.fat || 0
                        });
                        break;
                    case 4:
                        setShabbatMeal4Items(items);
                        setShabbatMeal4Data({
                            calories: log.total_calories || 0,
                            protein: log.protein || 0,
                            carbs: log.carbs || 0,
                            fat: log.fat || 0
                        });
                        break;
                }
            });
        }
        
        setDataLoaded(true);
        setTimeout(() => {
            isInitialLoadRef.current = false;
        }, 100);
    }, [selectedDate, allDateMeals]);

    // Calculate COMBINED totals from BOTH menus
    const totalCalories = 
        weekdayMeal1Data.calories + weekdayMeal2Data.calories + weekdayMeal3Data.calories + weekdayMeal4Data.calories +
        shabbatMeal1Data.calories + shabbatMeal2Data.calories + shabbatMeal3Data.calories + shabbatMeal4Data.calories;
    
    const totalProtein = 
        weekdayMeal1Data.protein + weekdayMeal2Data.protein + weekdayMeal3Data.protein + weekdayMeal4Data.protein +
        shabbatMeal1Data.protein + shabbatMeal2Data.protein + shabbatMeal3Data.protein + shabbatMeal4Data.protein;
    
    const totalCarbs = 
        weekdayMeal1Data.carbs + weekdayMeal2Data.carbs + weekdayMeal3Data.carbs + weekdayMeal4Data.carbs +
        shabbatMeal1Data.carbs + shabbatMeal2Data.carbs + shabbatMeal3Data.carbs + shabbatMeal4Data.carbs;
    
    const totalFat = 
        weekdayMeal1Data.fat + weekdayMeal2Data.fat + weekdayMeal3Data.fat + weekdayMeal4Data.fat +
        shabbatMeal1Data.fat + shabbatMeal2Data.fat + shabbatMeal3Data.fat + shabbatMeal4Data.fat;

    const autoSave = async () => {
        if (isInitialLoadRef.current || !userMadeChangeRef.current) {
            console.log('Skipping auto-save during initial load or no user changes');
            return;
        }

        try {
            setSaving(true);

            const existingLogs = await NutritionLog.filter({ date: selectedDate });
            const logsToDelete = existingLogs.filter((log: any) => log.menu_type === currentMenuType);
            
            console.log('Deleting existing logs for', currentMenuType, logsToDelete);
            for (const log of logsToDelete) {
                await NutritionLog.delete(log.id);
            }

            const meals = [
                { number: 1, data: meal1Data, items: meal1Items },
                { number: 2, data: meal2Data, items: meal2Items },
                { number: 3, data: meal3Data, items: meal3Items },
                { number: 4, data: meal4Data, items: meal4Items },
            ];

            for (const meal of meals) {
                if (meal.data.calories > 0) {
                    const itemsConsumed = Object.values(meal.items)
                        .filter(item => item.checked)
                        .map(item => ({
                            name: item.name,
                            amount: item.amount
                        }));

                    console.log(`Auto-saving meal ${meal.number} (${currentMenuType}) with items:`, itemsConsumed);

                    await NutritionLog.create({
                        date: selectedDate,
                        menu_type: currentMenuType,
                        meal_number: meal.number,
                        items_consumed: itemsConsumed,
                        total_calories: meal.data.calories,
                        protein: meal.data.protein,
                        carbs: meal.data.carbs,
                        fat: meal.data.fat,
                    });
                }
            }

            console.log('Auto-saved nutrition for', currentMenuType);
        } catch (error) {
            console.error('Error auto-saving nutrition:', error);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            autoSave();
        }, 1000);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [
        weekdayMeal1Data, weekdayMeal2Data, weekdayMeal3Data, weekdayMeal4Data,
        weekdayMeal1Items, weekdayMeal2Items, weekdayMeal3Items, weekdayMeal4Items,
        shabbatMeal1Data, shabbatMeal2Data, shabbatMeal3Data, shabbatMeal4Data,
        shabbatMeal1Items, shabbatMeal2Items, shabbatMeal3Items, shabbatMeal4Items,
        currentMenuType
    ]);

    const handleMealItemToggle = (
        mealSetter: React.Dispatch<React.SetStateAction<MealData>>,
        itemsSetter: React.Dispatch<React.SetStateAction<Record<string, MealItemSelection>>>,
        itemName: string,
        checked: boolean,
        amount: number,
        calories: number,
        protein: number,
        carbs: number,
        fat: number
    ) => {
        userMadeChangeRef.current = true;
        
        itemsSetter(prev => ({
            ...prev,
            [itemName]: { name: itemName, amount, checked }
        }));

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

    const selectAllMealItems = (mealItems: MealItemDefinition[], itemsSetter: React.Dispatch<React.SetStateAction<Record<string, MealItemSelection>>>, mealSetter: React.Dispatch<React.SetStateAction<MealData>>) => {
        userMadeChangeRef.current = true;

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

        itemsSetter(newItems);
        mealSetter({
            calories: totalCalories,
            protein: totalProtein,
            carbs: totalCarbs,
            fat: totalFat
        });
    };

    const clearAllMealItems = (itemsSetter: React.Dispatch<React.SetStateAction<Record<string, MealItemSelection>>>, mealSetter: React.Dispatch<React.SetStateAction<MealData>>) => {
        userMadeChangeRef.current = true;
        itemsSetter({});
        mealSetter({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    };

    const isAllSelected = (mealItems: MealItemDefinition[], currentItems: Record<string, MealItemSelection>) => {
        return mealItems.every(item => currentItems[item.name]?.checked === true);
    };

    if (isLoading || !dataLoaded) {
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
                        <Button
                            onClick={() => refetch()}
                            className="w-full bg-oxygym-yellow hover:bg-yellow-500 text-black font-bold"
                        >
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
                        {saving && (
                            <p className="text-xs text-oxygym-yellow">שומר אוטומטית...</p>
                        )}
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

                <div className="mb-4 sm:mb-6 flex justify-center">
                    <div className="inline-flex bg-oxygym-darkGrey rounded-lg p-1 border border-border">
                        <button
                            onClick={() => setIsShabbatMenu(false)}
                            className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                                !isShabbatMenu 
                                    ? 'bg-oxygym-yellow text-black' 
                                    : 'text-white hover:text-oxygym-yellow'
                            }`}
                        >
                            תפריט חול
                        </button>
                        <button
                            onClick={() => setIsShabbatMenu(true)}
                            className={`px-6 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${
                                isShabbatMenu 
                                    ? 'bg-oxygym-yellow text-black' 
                                    : 'text-white hover:text-oxygym-yellow'
                            }`}
                        >
                            ⭐ תפריט שבת
                        </button>
                    </div>
                </div>

                {isShabbatMenu && (
                    <div className="mb-4 p-3 bg-oxygym-yellow/10 border border-oxygym-yellow rounded-lg">
                        <p className="text-center text-xs sm:text-sm text-white font-semibold">
                            💡 כל סעודת שבת מחליפה ארוחה אחת ביום החול
                        </p>
                    </div>
                )}

                <div className="mb-4 sm:mb-6">
                    <CalorieChart
                        protein={totalProtein}
                        carbs={totalCarbs}
                        fat={totalFat}
                        totalCalories={totalCalories}
                    />
                </div>

                <div className="mb-4 sm:mb-6">
                    <WaterTracker />
                </div>

                {!isShabbatMenu ? (
                    <div className="space-y-3 sm:space-y-4 mb-6">
                        <Card className="bg-oxygym-darkGrey border-border overflow-hidden">
                            <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-[#F5E6D3] flex items-center justify-center p-2">
                                <img 
                                    src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1765106594587-1.png"
                                    alt="ארוחת בוקר"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            <CardHeader className="p-3 sm:p-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-white text-base sm:text-lg">
                                        ארוחה 1
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {isAllSelected(WEEKDAY_MEAL_1_DEFINITIONS, meal1Items) ? (
                                            <Button
                                                onClick={() => clearAllMealItems(setMeal1Items, setMeal1Data)}
                                                size="sm"
                                                className="bg-red-600 hover:bg-red-700 text-white text-xs h-7"
                                            >
                                                <X className="w-3 h-3 ml-1" />
                                                בטל הכל
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => selectAllMealItems(WEEKDAY_MEAL_1_DEFINITIONS, setMeal1Items, setMeal1Data)}
                                                size="sm"
                                                className="bg-oxygym-yellow hover:bg-yellow-500 text-black text-xs h-7"
                                            >
                                                <CheckSquare className="w-3 h-3 ml-1" />
                                                סמן הכל
                                            </Button>
                                        )}
                                        <span className="text-oxygym-yellow text-xs sm:text-sm">עד 10:00</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 pt-0">
                                {WEEKDAY_MEAL_1_DEFINITIONS.map(item => (
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
                                        initialChecked={meal1Items[item.name]?.checked || false}
                                        initialAmount={meal1Items[item.name]?.amount}
                                        onToggle={(checked, amount, cals, prot, crbs, ft) => 
                                            handleMealItemToggle(setMeal1Data, setMeal1Items, item.name, checked, amount, cals, prot, crbs, ft)
                                        }
                                    />
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-oxygym-darkGrey border-border overflow-hidden">
                            <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-[#F5E6D3] flex items-center justify-center p-2">
                                <img 
                                    src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1765106594588-2.png"
                                    alt="ארוחה 2"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            <CardHeader className="p-3 sm:p-4">
                                <CardTitle className="text-white flex items-center justify-between text-base sm:text-lg">
                                    <span>ארוחה 2</span>
                                    <span className="text-oxygym-yellow text-xs sm:text-sm">עד 12:30</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 pt-0">
                                <MealItem
                                    name="גיינר עם מים"
                                    icon={ShakerIcon}
                                    defaultAmount={150}
                                    unit="גרם (2 כפות)"
                                    caloriesPer100g={388}
                                    proteinPer100g={15}
                                    carbsPer100g={75}
                                    fatPer100g={3.1}
                                    initialChecked={meal2Items['גיינר עם מים']?.checked || false}
                                    initialAmount={meal2Items['גיינר עם מים']?.amount}
                                    onToggle={(checked, amount, cals, prot, crbs, ft) => 
                                        handleMealItemToggle(setMeal2Data, setMeal2Items, 'גיינר עם מים', checked, amount, cals, prot, crbs, ft)
                                    }
                                />
                            </CardContent>
                        </Card>

                        <Card className="bg-oxygym-darkGrey border-border overflow-hidden">
                            <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-[#F5E6D3] flex items-center justify-center p-2">
                                <img 
                                    src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1765106594588-2.png"
                                    alt="ארוחה 3"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            <CardHeader className="p-3 sm:p-4">
                                <CardTitle className="text-white flex items-center justify-between text-base sm:text-lg">
                                    <span>ארוחה 3</span>
                                    <span className="text-oxygym-yellow text-xs sm:text-sm">עד 15:30</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 pt-0">
                                <MealItem
                                    name="גיינר עם מים"
                                    icon={ShakerIcon}
                                    defaultAmount={150}
                                    unit="גרם (2 כפות)"
                                    caloriesPer100g={388}
                                    proteinPer100g={15}
                                    carbsPer100g={75}
                                    fatPer100g={3.1}
                                    initialChecked={meal3Items['גיינר עם מים']?.checked || false}
                                    initialAmount={meal3Items['גיינר עם מים']?.amount}
                                    onToggle={(checked, amount, cals, prot, crbs, ft) => 
                                        handleMealItemToggle(setMeal3Data, setMeal3Items, 'גיינר עם מים', checked, amount, cals, prot, crbs, ft)
                                    }
                                />
                            </CardContent>
                        </Card>

                        <Card className="bg-oxygym-darkGrey border-border overflow-hidden">
                            <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-[#F5E6D3] flex items-center justify-center p-2">
                                <img 
                                    src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1765106594588-4.png"
                                    alt="ארוחה 4"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            <CardHeader className="p-3 sm:p-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-white text-base sm:text-lg">
                                        ארוחה 4
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {isAllSelected(WEEKDAY_MEAL_4_DEFINITIONS, meal4Items) ? (
                                            <Button
                                                onClick={() => clearAllMealItems(setMeal4Items, setMeal4Data)}
                                                size="sm"
                                                className="bg-red-600 hover:bg-red-700 text-white text-xs h-7"
                                            >
                                                <X className="w-3 h-3 ml-1" />
                                                בטל הכל
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => selectAllMealItems(WEEKDAY_MEAL_4_DEFINITIONS, setMeal4Items, setMeal4Data)}
                                                size="sm"
                                                className="bg-oxygym-yellow hover:bg-yellow-500 text-black text-xs h-7"
                                            >
                                                <CheckSquare className="w-3 h-3 ml-1" />
                                                סמן הכל
                                            </Button>
                                        )}
                                        <span className="text-oxygym-yellow text-xs sm:text-sm">עד 22:00</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 pt-0">
                                {WEEKDAY_MEAL_4_DEFINITIONS.map(item => (
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
                                        initialChecked={meal4Items[item.name]?.checked || false}
                                        initialAmount={meal4Items[item.name]?.amount}
                                        onToggle={(checked, amount, cals, prot, crbs, ft) => 
                                            handleMealItemToggle(setMeal4Data, setMeal4Items, item.name, checked, amount, cals, prot, crbs, ft)
                                        }
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4 mb-6">
                        <Card className="bg-oxygym-darkGrey border-oxygym-yellow border-2 overflow-hidden">
                            <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-[#F5E6D3] flex items-center justify-center p-2">
                                <img 
                                    src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1765350340296-1.png"
                                    alt="סעודה 1 שבת - דג מרוקאי וחלה"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            <CardHeader className="p-3 sm:p-4 bg-oxygym-yellow/5">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2">
                                        <span>⭐</span>
                                        <span>סעודה 1 - שבת</span>
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {isAllSelected(SHABBAT_MEAL_1_DEFINITIONS, meal1Items) ? (
                                            <Button
                                                onClick={() => clearAllMealItems(setMeal1Items, setMeal1Data)}
                                                size="sm"
                                                className="bg-red-600 hover:bg-red-700 text-white text-xs h-7"
                                            >
                                                <X className="w-3 h-3 ml-1" />
                                                בטל הכל
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => selectAllMealItems(SHABBAT_MEAL_1_DEFINITIONS, setMeal1Items, setMeal1Data)}
                                                size="sm"
                                                className="bg-oxygym-yellow hover:bg-yellow-500 text-black text-xs h-7"
                                            >
                                                <CheckSquare className="w-3 h-3 ml-1" />
                                                סמן הכל
                                            </Button>
                                        )}
                                        <span className="text-oxygym-yellow text-xs sm:text-sm">ליל שבת</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 pt-0">
                                {SHABBAT_MEAL_1_DEFINITIONS.map(item => (
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
                                        initialChecked={meal1Items[item.name]?.checked || false}
                                        initialAmount={meal1Items[item.name]?.amount}
                                        onToggle={(checked, amount, cals, prot, crbs, ft) => 
                                            handleMealItemToggle(setMeal1Data, setMeal1Items, item.name, checked, amount, cals, prot, crbs, ft)
                                        }
                                    />
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-oxygym-darkGrey border-oxygym-yellow border-2 overflow-hidden">
                            <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-[#F5E6D3] flex items-center justify-center p-2">
                                <img 
                                    src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1765350647080-2.png"
                                    alt="סעודה 2 שבת - כרעיי עוף, אורז וסלט"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            <CardHeader className="p-3 sm:p-4 bg-oxygym-yellow/5">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2">
                                        <span>⭐</span>
                                        <span>סעודה 2 - שבת</span>
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {isAllSelected(SHABBAT_MEAL_2_DEFINITIONS, meal2Items) ? (
                                            <Button
                                                onClick={() => clearAllMealItems(setMeal2Items, setMeal2Data)}
                                                size="sm"
                                                className="bg-red-600 hover:bg-red-700 text-white text-xs h-7"
                                            >
                                                <X className="w-3 h-3 ml-1" />
                                                בטל הכל
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => selectAllMealItems(SHABBAT_MEAL_2_DEFINITIONS, setMeal2Items, setMeal2Data)}
                                                size="sm"
                                                className="bg-oxygym-yellow hover:bg-yellow-500 text-black text-xs h-7"
                                            >
                                                <CheckSquare className="w-3 h-3 ml-1" />
                                                סמן הכל
                                            </Button>
                                        )}
                                        <span className="text-oxygym-yellow text-xs sm:text-sm">צהריים</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 pt-0">
                                {SHABBAT_MEAL_2_DEFINITIONS.map(item => (
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
                                        initialChecked={meal2Items[item.name]?.checked || false}
                                        initialAmount={meal2Items[item.name]?.amount}
                                        onToggle={(checked, amount, cals, prot, crbs, ft) => 
                                            handleMealItemToggle(setMeal2Data, setMeal2Items, item.name, checked, amount, cals, prot, crbs, ft)
                                        }
                                    />
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-oxygym-darkGrey border-oxygym-yellow border-2 overflow-hidden">
                            <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-[#F5E6D3] flex items-center justify-center p-2">
                                <img 
                                    src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1765351039028-3.png"
                                    alt="סעודה 3 שבת - סלמון, בטטה וירקות בתנור"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            <CardHeader className="p-3 sm:p-4 bg-oxygym-yellow/5">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2">
                                        <span>⭐</span>
                                        <span>סעודה 3 - שבת</span>
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {isAllSelected(SHABBAT_MEAL_3_DEFINITIONS, meal3Items) ? (
                                            <Button
                                                onClick={() => clearAllMealItems(setMeal3Items, setMeal3Data)}
                                                size="sm"
                                                className="bg-red-600 hover:bg-red-700 text-white text-xs h-7"
                                            >
                                                <X className="w-3 h-3 ml-1" />
                                                בטל הכל
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => selectAllMealItems(SHABBAT_MEAL_3_DEFINITIONS, setMeal3Items, setMeal3Data)}
                                                size="sm"
                                                className="bg-oxygym-yellow hover:bg-yellow-500 text-black text-xs h-7"
                                            >
                                                <CheckSquare className="w-3 h-3 ml-1" />
                                                סמן הכל
                                            </Button>
                                        )}
                                        <span className="text-oxygym-yellow text-xs sm:text-sm">סעודה שלישית</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 pt-0">
                                {SHABBAT_MEAL_3_DEFINITIONS.map(item => (
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
                                        initialChecked={meal3Items[item.name]?.checked || false}
                                        initialAmount={meal3Items[item.name]?.amount}
                                        onToggle={(checked, amount, cals, prot, crbs, ft) => 
                                            handleMealItemToggle(setMeal3Data, setMeal3Items, item.name, checked, amount, cals, prot, crbs, ft)
                                        }
                                    />
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-oxygym-darkGrey border-oxygym-yellow border-2 overflow-hidden">
                            <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-[#F5E6D3] flex items-center justify-center p-2">
                                <img 
                                    src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1765351280343-4.png"
                                    alt="סעודה 4 שבת - סטייק, סלט בורגול וירקות"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            <CardHeader className="p-3 sm:p-4 bg-oxygym-yellow/5">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2">
                                        <span>⭐</span>
                                        <span>סעודה 4 - שבת</span>
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {isAllSelected(SHABBAT_MEAL_4_DEFINITIONS, meal4Items) ? (
                                            <Button
                                                onClick={() => clearAllMealItems(setMeal4Items, setMeal4Data)}
                                                size="sm"
                                                className="bg-red-600 hover:bg-red-700 text-white text-xs h-7"
                                            >
                                                <X className="w-3 h-3 ml-1" />
                                                בטל הכל
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => selectAllMealItems(SHABBAT_MEAL_4_DEFINITIONS, setMeal4Items, setMeal4Data)}
                                                size="sm"
                                                className="bg-oxygym-yellow hover:bg-yellow-500 text-black text-xs h-7"
                                            >
                                                <CheckSquare className="w-3 h-3 ml-1" />
                                                סמן הכל
                                            </Button>
                                        )}
                                        <span className="text-oxygym-yellow text-xs sm:text-sm">מוצאי שבת</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-1.5 sm:space-y-2 p-3 sm:p-4 pt-0">
                                {SHABBAT_MEAL_4_DEFINITIONS.map(item => (
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
                                        initialChecked={meal4Items[item.name]?.checked || false}
                                        initialAmount={meal4Items[item.name]?.amount}
                                        onToggle={(checked, amount, cals, prot, crbs, ft) => 
                                            handleMealItemToggle(setMeal4Data, setMeal4Items, item.name, checked, amount, cals, prot, crbs, ft)
                                        }
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Nutrition;