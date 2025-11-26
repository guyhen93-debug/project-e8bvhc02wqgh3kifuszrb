import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Dumbbell, Utensils, Scale } from 'lucide-react';

interface DayDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: string;
    workouts: any[];
    meals: any[];
    weights: any[];
}

export const DayDetailsDialog = ({ 
    open, 
    onOpenChange, 
    date, 
    workouts, 
    meals, 
    weights 
}: DayDetailsDialogProps) => {
    const formattedDate = new Date(date).toLocaleDateString('he-IL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const completedWorkouts = workouts.filter(w => w.completed);
    const totalCalories = meals.reduce((sum, m) => sum + (m.total_calories || 0), 0);
    const latestWeight = weights.length > 0 ? weights[weights.length - 1] : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-oxygym-darkGrey border-border text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl">{formattedDate}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <Card className="bg-black border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <Dumbbell className="w-6 h-6 text-green-400" />
                                <h3 className="text-white font-semibold">אימונים</h3>
                            </div>
                            {completedWorkouts.length > 0 ? (
                                <ul className="space-y-2">
                                    {completedWorkouts.map((workout, idx) => (
                                        <li key={idx} className="text-muted-foreground flex items-center gap-2">
                                            <span className="text-green-400">✓</span>
                                            אימון {workout.workout_type}
                                            {workout.duration_minutes && (
                                                <span className="text-xs">({workout.duration_minutes} דקות)</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground text-sm">לא תועדו אימונים</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-black border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <Utensils className="w-6 h-6 text-oxygym-yellow" />
                                <h3 className="text-white font-semibold">תזונה</h3>
                            </div>
                            {meals.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="text-white">
                                        {meals.length} ארוחות תועדו
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        סה״כ: {Math.round(totalCalories)} קלוריות
                                    </p>
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">לא תועדו ארוחות</p>
                            )}
                        </CardContent>
                    </Card>

                    {latestWeight && (
                        <Card className="bg-black border-border">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <Scale className="w-6 h-6 text-blue-400" />
                                    <h3 className="text-white font-semibold">משקל</h3>
                                </div>
                                <p className="text-white text-2xl font-bold">
                                    {latestWeight.weight} ק״ג
                                </p>
                                {latestWeight.notes && (
                                    <p className="text-muted-foreground text-sm mt-2">
                                        {latestWeight.notes}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};