import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Dumbbell, Utensils } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { WorkoutLog, NutritionLog } from '@/entities';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const { data: workoutLogs } = useQuery({
        queryKey: ['workout-logs'],
        queryFn: async () => {
            try {
                return await WorkoutLog.list('-date', 100);
            } catch (error) {
                console.error('Error fetching workouts:', error);
                return [];
            }
        },
    });

    const { data: nutritionLogs } = useQuery({
        queryKey: ['nutrition-logs'],
        queryFn: async () => {
            try {
                return await NutritionLog.list('-date', 100);
            } catch (error) {
                console.error('Error fetching nutrition:', error);
                return [];
            }
        },
    });

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const monthNames = [
        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];

    const getDayData = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const workouts = workoutLogs?.filter(log => log.date === dateStr) || [];
        const meals = nutritionLogs?.filter(log => log.date === dateStr) || [];
        
        return {
            hasWorkout: workouts.some(w => w.completed),
            mealsCount: meals.length,
        };
    };

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const { hasWorkout, mealsCount } = getDayData(day);
        const isToday = new Date().getDate() === day && 
                        new Date().getMonth() === month && 
                        new Date().getFullYear() === year;

        days.push(
            <Card 
                key={day} 
                className={`aspect-square ${isToday ? 'border-oxygym-yellow border-2' : 'border-border'} bg-oxygym-darkGrey`}
            >
                <CardContent className="p-2 h-full flex flex-col items-center justify-center">
                    <span className={`text-sm font-semibold mb-1 ${isToday ? 'text-oxygym-yellow' : 'text-white'}`}>
                        {day}
                    </span>
                    <div className="flex gap-1">
                        {hasWorkout && (
                            <Dumbbell className="w-3 h-3 text-green-400" />
                        )}
                        {mealsCount > 0 && (
                            <div className="flex items-center gap-0.5">
                                <Utensils className="w-3 h-3 text-oxygym-yellow" />
                                <span className="text-xs text-oxygym-yellow">{mealsCount}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="min-h-screen bg-oxygym-dark pb-20">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <h1 className="text-3xl font-bold text-white mb-2">לוח שנה</h1>
                <p className="text-muted-foreground mb-8">מעקב אימונים ותזונה</p>

                <Card className="bg-oxygym-darkGrey border-border mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <Button
                                onClick={goToPreviousMonth}
                                variant="ghost"
                                size="icon"
                                className="text-white hover:text-oxygym-yellow"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                            <h2 className="text-xl font-bold text-white">
                                {monthNames[month]} {year}
                            </h2>
                            <Button
                                onClick={goToNextMonth}
                                variant="ghost"
                                size="icon"
                                className="text-white hover:text-oxygym-yellow"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day) => (
                                <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {days}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-oxygym-darkGrey border-border">
                        <CardContent className="p-4 flex items-center gap-3">
                            <Dumbbell className="w-6 h-6 text-green-400" />
                            <div>
                                <p className="text-white font-semibold">התאמנתי</p>
                                <p className="text-xs text-muted-foreground">סימון ירוק</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-oxygym-darkGrey border-border">
                        <CardContent className="p-4 flex items-center gap-3">
                            <Utensils className="w-6 h-6 text-oxygym-yellow" />
                            <div>
                                <p className="text-white font-semibold">מספר ארוחות</p>
                                <p className="text-xs text-muted-foreground">שאכלתי</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Calendar;