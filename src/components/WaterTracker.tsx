import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplet, Plus, Minus } from 'lucide-react';
import { useDate } from '@/contexts/DateContext';
import { WaterLog } from '@/entities';
import { useQuery } from '@tanstack/react-query';

export const WaterTracker = () => {
    const { selectedDate } = useDate();
    const [glasses, setGlasses] = useState(0);
    const targetGlasses = 12;
    const glassSize = 250;
    const totalLiters = (glasses * glassSize) / 1000;
    const targetLiters = 3;

    const { data: waterData, refetch } = useQuery({
        queryKey: ['water-log', selectedDate],
        queryFn: async () => {
            const logs = await WaterLog.filter({ date: selectedDate });
            return logs[0] || null;
        },
    });

    useEffect(() => {
        if (waterData) {
            setGlasses(waterData.glasses || 0);
        } else {
            setGlasses(0);
        }
    }, [waterData, selectedDate]);

    const handleAdd = async () => {
        const newGlasses = Math.min(glasses + 1, targetGlasses);
        setGlasses(newGlasses);
        
        try {
            if (waterData) {
                await WaterLog.update(waterData.id, { glasses: newGlasses });
            } else {
                await WaterLog.create({ date: selectedDate, glasses: newGlasses });
            }
            refetch();
        } catch (error) {
            console.error('Error saving water log:', error);
        }
    };

    const handleSubtract = async () => {
        const newGlasses = Math.max(glasses - 1, 0);
        setGlasses(newGlasses);
        
        try {
            if (waterData) {
                await WaterLog.update(waterData.id, { glasses: newGlasses });
            } else {
                await WaterLog.create({ date: selectedDate, glasses: newGlasses });
            }
            refetch();
        } catch (error) {
            console.error('Error saving water log:', error);
        }
    };

    const percentage = Math.min((glasses / targetGlasses) * 100, 100);

    return (
        <Card className="bg-oxygym-darkGrey border-border">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Droplet className="w-6 h-6 text-blue-400" />
                        <div>
                            <p className="text-white font-semibold">שתיית מים</p>
                            <p className="text-xs text-muted-foreground">
                                {totalLiters.toFixed(1)} / {targetLiters} ליטר
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
                        <span className="text-white font-bold text-xl w-8 text-center">
                            {glasses}
                        </span>
                        <Button
                            onClick={handleAdd}
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 border-border hover:bg-blue-600"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div className="w-full bg-black rounded-full h-2">
                    <div 
                        className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                    {glasses} כוסות מתוך {targetGlasses}
                </p>
            </CardContent>
        </Card>
    );
};