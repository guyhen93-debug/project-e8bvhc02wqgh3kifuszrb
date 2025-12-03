import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Moon, Plus, Minus, Check } from 'lucide-react';
import { useDate } from '@/contexts/DateContext';

export const SleepTracker = () => {
    const { selectedDate } = useDate();
    const [hours, setHours] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [showInput, setShowInput] = useState(false);
    const minTarget = 7;
    const maxTarget = 9;

    useEffect(() => {
        const saved = localStorage.getItem(`sleep-${selectedDate}`);
        if (saved) {
            setHours(parseFloat(saved));
        } else {
            setHours(0);
        }
    }, [selectedDate]);

    const handleAdd = () => {
        const newHours = Math.min(hours + 0.5, 12);
        setHours(newHours);
        localStorage.setItem(`sleep-${selectedDate}`, newHours.toString());
    };

    const handleSubtract = () => {
        const newHours = Math.max(hours - 0.5, 0);
        setHours(newHours);
        localStorage.setItem(`sleep-${selectedDate}`, newHours.toString());
    };

    const handleInputSubmit = () => {
        const value = parseFloat(inputValue);
        if (!isNaN(value) && value >= 0 && value <= 12) {
            setHours(value);
            localStorage.setItem(`sleep-${selectedDate}`, value.toString());
            setInputValue('');
            setShowInput(false);
        }
    };

    const getStatusColor = () => {
        if (hours >= minTarget && hours <= maxTarget) {
            return 'bg-green-400';
        } else if (hours > 0) {
            return 'bg-yellow-400';
        }
        return 'bg-purple-400';
    };

    const getStatusText = () => {
        if (hours >= minTarget && hours <= maxTarget) {
            return 'יעד הושג! 🎉';
        } else if (hours < minTarget && hours > 0) {
            return `חסר ${(minTarget - hours).toFixed(1)} שעות`;
        } else if (hours > maxTarget) {
            return 'מעל היעד';
        }
        return 'טרם תועד';
    };

    const percentage = Math.min((hours / maxTarget) * 100, 100);

    return (
        <Card className="bg-oxygym-darkGrey border-border">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Moon className="w-6 h-6 text-purple-400" />
                        <div>
                            <p className="text-white font-semibold">שעות שינה</p>
                            <p className="text-xs text-muted-foreground">
                                יעד: {minTarget}-{maxTarget} שעות
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleSubtract}
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 border-border hover:bg-red-600"
                        >
                            <Minus className="w-4 h-4" />
                        </Button>
                        {showInput ? (
                            <div className="flex items-center gap-1">
                                <Input
                                    type="number"
                                    step="0.5"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={hours.toFixed(1)}
                                    className="w-16 h-8 text-center bg-black border-border text-white p-1"
                                />
                                <Button
                                    onClick={handleInputSubmit}
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                >
                                    <Check className="w-4 h-4 text-green-400" />
                                </Button>
                            </div>
                        ) : (
                            <span 
                                className="text-white font-bold text-xl w-12 text-center cursor-pointer hover:text-oxygym-yellow"
                                onClick={() => setShowInput(true)}
                            >
                                {hours.toFixed(1)}
                            </span>
                        )}
                        <Button
                            onClick={handleAdd}
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 border-border hover:bg-purple-600"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div className="w-full bg-black rounded-full h-2">
                    <div 
                        className={`${getStatusColor()} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                    {getStatusText()}
                </p>
            </CardContent>
        </Card>
    );
};