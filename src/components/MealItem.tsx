import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface MealItemProps {
    name: string;
    icon?: React.ComponentType<{ className?: string }>;
    defaultAmount: number;
    unit: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    initialChecked?: boolean;
    initialAmount?: number;
    onToggle: (
        checked: boolean,
        amount: number,
        calories: number,
        protein: number,
        carbs: number,
        fat: number
    ) => void;
}

export const MealItem = ({
    name,
    icon: Icon,
    defaultAmount,
    unit,
    caloriesPer100g,
    proteinPer100g,
    carbsPer100g,
    fatPer100g,
    initialChecked = false,
    initialAmount,
    onToggle,
}: MealItemProps) => {
    const [checked, setChecked] = useState(initialChecked);
    const [amount, setAmount] = useState(initialAmount || defaultAmount);

    useEffect(() => {
        setChecked(initialChecked);
        setAmount(initialAmount || defaultAmount);
    }, [initialChecked, initialAmount, defaultAmount]);

    const calculateNutrition = (grams: number) => {
        const multiplier = grams / 100;
        return {
            calories: caloriesPer100g * multiplier,
            protein: proteinPer100g * multiplier,
            carbs: carbsPer100g * multiplier,
            fat: fatPer100g * multiplier,
        };
    };

    const handleCheckChange = (newChecked: boolean) => {
        setChecked(newChecked);
        const nutrition = calculateNutrition(amount);
        onToggle(newChecked, amount, nutrition.calories, nutrition.protein, nutrition.carbs, nutrition.fat);
    };

    const handleAmountChange = (newAmount: number) => {
        setAmount(newAmount);
        if (checked) {
            const nutrition = calculateNutrition(newAmount);
            onToggle(true, newAmount, nutrition.calories, nutrition.protein, nutrition.carbs, nutrition.fat);
        }
    };

    const nutrition = calculateNutrition(amount);

    return (
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-black rounded-lg hover:bg-black/80 transition-colors">
            <Checkbox
                checked={checked}
                onCheckedChange={handleCheckChange}
                className="border-border data-[state=checked]:bg-oxygym-yellow data-[state=checked]:border-oxygym-yellow mt-1 sm:mt-0 flex-shrink-0"
            />
            
            {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-oxygym-yellow flex-shrink-0 mt-1 sm:mt-0" />}
            
            <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-white font-medium leading-tight">{name}</p>
                <div className="flex items-center gap-2 mt-1">
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => handleAmountChange(Number(e.target.value))}
                        className="w-16 sm:w-20 h-7 sm:h-8 text-xs sm:text-sm bg-oxygym-darkGrey border-border text-white"
                    />
                    <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{unit}</span>
                </div>
            </div>
            
            <div className="text-left flex-shrink-0">
                <p className="text-xs sm:text-sm text-oxygym-yellow font-semibold whitespace-nowrap">
                    {Math.round(nutrition.calories)} קל'
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                    {Math.round(nutrition.protein)}g חלבון
                </p>
            </div>
        </div>
    );
};