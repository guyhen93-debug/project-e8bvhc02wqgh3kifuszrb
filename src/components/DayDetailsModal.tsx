import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Dumbbell, Utensils, Scale } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DayDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: Date | null;
    workouts: any[];
    meals: any[];
    weight: any | null;
}

export const DayDetailsModal = ({ 
    open, 
    onOpenChange, 
    date, 
    workouts, 
    meals, 
    weight 
}: DayDetailsModalProps) => {
    if (!date) return null;

    const totalCalories = meals.reduce((sum, meal) => sum + (meal.total_calories || 0), 0);
    const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-oxygym-darkGrey border-border text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {format(date, 'EEEE, d MMMM yyyy', { locale: he })}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {workouts.length > 0 && (
                        <Card className="bg-black border-border">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Dumbbell className="w-5 h-5 text-green-400" />
                                    <h3 className="text-white font-semibold">אימונים</h3>
                                </div>
                                {workouts.map((workout, idx) => (
                                    <div key={idx} className="mb-2">
                                        <p className="text-white">
                                            אימון {workout.workout_type}
                                        </p>
                                        {workout.completed && (
                                            <p className="text-xs text-green-400">✓ הושלם</p>
                                        )}
                                        {workout.duration_minutes && (
                                            <p className="text-xs text-muted-foreground">
                                                {workout.duration_minutes} דקות
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {meals.length > 0 && (
                        <Card className="bg-black border-border">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Utensils className="w-5 h-5 text-oxygym-yellow" />
                                    <h3 className="text-white font-semibold">תזונה</h3>
                                </div>
                                <p className="text-white mb-1">
                                    {meals.length} ארוחות תועדו
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {Math.round(totalCalories)} קלוריות סה"כ
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {Math.round(totalProtein)}g חלבון
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {weight && (
                        <Card className="bg-black border-border">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Scale className="w-5 h-5 text-purple-400" />
                                    <h3 className="text-white font-semibold">משקל</h3>
                                </div>
                                <p className="text-2xl text-white font-bold">
                                    {weight.weight} <span className="text-lg">ק"ג</span>
                                </p>
                                {weight.notes && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {weight.notes}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {workouts.length === 0 && meals.length === 0 && !weight && (
                        <Card className="bg-black border-border">
                            <CardContent className="p-4 text-center">
                                <p className="text-muted-foreground">
                                    אין נתונים ליום זה
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};