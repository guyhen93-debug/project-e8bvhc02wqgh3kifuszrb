import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface MealItemProps {
    name: string;
    defaultAmount: number;
    unit: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    mealNumber: number;
    onToggle: (checked: boolean, amount: number, calories: number, protein: number, carbs: number, fat: number) => void;
}

export const MealItem = ({ 
    name, 
    defaultAmount, 
    unit,
    caloriesPer100g,
    proteinPer100g,
    carbsPer100g,
    fatPer100g,
    mealNumber,
    onToggle 
}: MealItemProps) => {
    const storageKey = `meal-${mealNumber}-${name}-${new Date().toISOString().split('T')[0]}`;
    
    const [checked, setChecked] = useState(false);
    const [amount, setAmount] = useState(defaultAmount);

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            const { isChecked, savedAmount } = JSON.parse(saved);
            setChecked(isChecked);
            setAmount(savedAmount);
            if (isChecked) {
                const multiplier = savedAmount / 100;
                const calories = Math.round(caloriesPer100g * multiplier);
                const protein = Math.round(proteinPer100g * multiplier * 10) / 10;
                const carbs = Math.round(carbsPer100g * multiplier * 10) / 10;
                const fat = Math.round(fatPer100g * multiplier * 10) / 10;
                onToggle(true, savedAmount, calories, protein, carbs, fat);
            }
        }
    }, [storageKey]);

    const multiplier = amount / 100;
    const calories = Math.round(caloriesPer100g * multiplier);
    const protein = Math.round(proteinPer100g * multiplier * 10) / 10;
    const carbs = Math.round(carbsPer100g * multiplier * 10) / 10;
    const fat = Math.round(fatPer100g * multiplier * 10) / 10;

    const handleCheckedChange = (newChecked: boolean) => {
        setChecked(newChecked);
        localStorage.setItem(storageKey, JSON.stringify({ isChecked: newChecked, savedAmount: amount }));
        onToggle(newChecked, amount, calories, protein, carbs, fat);
    };

    const handleAmountChange = (newAmount: number) => {
        setAmount(newAmount);
        if (checked) {
            const mult = newAmount / 100;
            const cals = Math.round(caloriesPer100g * mult);
            const prot = Math.round(proteinPer100g * mult * 10) / 10;
            const crbs = Math.round(carbsPer100g * mult * 10) / 10;
            const ft = Math.round(fatPer100g * mult * 10) / 10;
            localStorage.setItem(storageKey, JSON.stringify({ isChecked: checked, savedAmount: newAmount }));
            onToggle(true, newAmount, cals, prot, crbs, ft);
        }
    };

    return (
        <div className="flex items-center gap-3 p-4 bg-oxygym-darkGrey rounded-lg">
            <Checkbox
                checked={checked}
                onCheckedChange={(c) => handleCheckedChange(c === true)}
                className="border-oxygym-yellow data-[state=checked]:bg-oxygym-yellow data-[state=checked]:border-oxygym-yellow"
            />
            <div className="flex-1">
                <p className="text-white font-medium">{name}</p>
                <div className="flex items-center gap-2 mt-1">
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => handleAmountChange(Number(e.target.value))}
                        className="w-20 h-8 bg-black border-border text-white text-sm"
                    />
                    <span className="text-sm text-muted-foreground">{unit}</span>
                    {checked && (
                        <span className="text-xs text-oxygym-yellow">
                            {calories} קלוריות
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};