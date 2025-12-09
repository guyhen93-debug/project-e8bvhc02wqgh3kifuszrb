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
        <div className="grid grid-cols-[auto_auto_1fr_auto] gap-2 sm:gap-3 items-center p-2.5 sm:p-3 bg-black rounded-lg hover:bg-black/80 transition-colors">
            <Checkbox
                checked={checked}
                onCheckedChange={handleCheckChange}
                className="w-6 h-6 border-border data-[state=checked]:bg-oxygym-yellow data-[state=checked]:border-oxygym-yellow"
            />
            
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0">
                {Icon && <Icon className="w-14 h-14 sm:w-16 sm:h-16" />}
            </div>
            
            <div className="text-right min-w-0 overflow-hidden">
                <p className="text-sm sm:text-base text-white font-medium leading-tight mb-1.5 truncate">{name}</p>
                <div className="flex items-center justify-end gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm text-muted-foreground">{unit}</span>
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => handleAmountChange(Number(e.target.value))}
                        className="w-16 sm:w-20 h-7 sm:h-8 text-sm sm:text-base bg-oxygym-darkGrey border-border text-white text-center px-1"
                    />
                </div>
            </div>
            
            <div className="text-center flex-shrink-0">
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