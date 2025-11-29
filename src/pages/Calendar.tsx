import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Dumbbell, Utensils, Scale, Calendar as CalendarIcon, Droplet, Moon, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { WorkoutLog, NutritionLog, WeightLog } from '@/entities';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

    const { data: weightLogs } = useQuery({
        queryKey: ['weight-logs'],
        queryFn: async () => {
            try {
                return await WeightLog.list('-date', 100);
            } catch (error) {
                console.error('Error fetching weights:', error);
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
        const weight = weightLogs?.find(log => log.date === dateStr);
        
        const waterGlasses = parseInt(localStorage.getItem(`water-${dateStr}`) || '0');
        const sleepHours = parseFloat(localStorage.getItem(`sleep-${dateStr}`) || '0');
        
        const totalCardioMinutes = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
        
        return {
            workouts,
            meals,
            weight,
            hasWorkout: workouts.some(w => w.completed),
            mealsCount: meals.length,
            hasWeight: !!weight,
            waterGlasses,
            sleepHours,
            cardioMinutes: totalCardioMinutes,
        };
    };

    const handleDayClick = (day: number) => {
        const date = new Date(year, month, day);
        setSelectedDate(date);
    };

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = new Date().getDate() === day && 
                        new Date().getMonth() === month && 
                        new Date().getFullYear() === year;
        const isSelected = selectedDate?.getDate() === day && 
                          selectedDate?.getMonth() === month && 
                          selectedDate?.getFullYear() === year;

        days.push(
            <Card 
                key={day} 
                className={`aspect-square cursor-pointer hover:border-oxygym-yellow transition-all ${
                    isSelected ? 'border-oxygym-yellow border-2 bg-oxygym-yellow/10' : 
                    isToday ? 'border-oxygym-yellow border-2' : 'border-border'
                } bg-oxygym-darkGrey`}
                onClick={() => handleDayClick(day)}
            >
                <CardContent className="p-2 h-full flex items-center justify-center">
                    <span className={`text-lg font-semibold ${
                        isSelected || isToday ? 'text-oxygym-yellow' : 'text-white'
                    }`}>
                        {day}
                    </span>
                </CardContent>
            </Card>
        );
    }

    const selectedDayData = selectedDate 
        ? getDayData(selectedDate.getDate())
        : null;

    const totalCalories = selectedDayData?.meals.reduce((sum, m) => sum + (m.total_calories || 0), 0) || 0;
    const totalProtein = selectedDayData?.meals.reduce((sum, m) => sum + (m.protein || 0), 0) || 0;

    return (
        <div className="min-h-screen bg-oxygym-dark pb-20">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <h1 className="text-3xl font-bold text-white mb-2">לוח שנה</h1>
                <p className="text-muted-foreground mb-8">לחץ על יום כדי לראות פרטים</p>

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

                {selectedDate && selectedDayData && (
                    <Card className="bg-oxygym-darkGrey border-border mb-6">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-4">
                                <CalendarIcon className="w-6 h-6 text-oxygym-yellow" />
                                <h3 className="text-white font-bold text-xl">
                                    {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: he })}
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {selectedDayData.workouts.length > 0 && (
                                    <div className="bg-black p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Dumbbell className="w-5 h-5 text-green-400" />
                                            <h4 className="text-white font-semibold">אימונים</h4>
                                        </div>
                                        {selectedDayData.workouts.map((workout: any, idx: number) => {
                                            const totalExercises = workout.exercises_completed?.length || 0;
                                            const completedExercises = workout.exercises_completed?.filter(
                                                (ex: any) => ex.sets?.every((s: any) => s.completed)
                                            ).length || 0;
                                            
                                            return (
                                                <div key={idx} className="mb-2">
                                                    <p className="text-white">
                                                        אימון {workout.workout_type}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {completedExercises} מתוך {totalExercises} תרגילים הושלמו
                                                    </p>
                                                    {workout.completed && (
                                                        <p className="text-xs text-green-400">✓ אימון מלא הושלם</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {selectedDayData.cardioMinutes > 0 && (
                                    <div className="bg-black p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Heart className="w-5 h-5 text-red-400" />
                                            <h4 className="text-white font-semibold">פעילות אירובית</h4>
                                        </div>
                                        <p className="text-2xl text-white font-bold">
                                            {selectedDayData.cardioMinutes} <span className="text-lg">דקות</span>
                                        </p>
                                        {selectedDayData.cardioMinutes >= 20 && (
                                            <p className="text-xs text-green-400 mt-1">✓ יעד יומי הושג</p>
                                        )}
                                    </div>
                                )}

                                {selectedDayData.meals.length > 0 && (
                                    <div className="bg-black p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Utensils className="w-5 h-5 text-oxygym-yellow" />
                                            <h4 className="text-white font-semibold">תזונה</h4>
                                        </div>
                                        <p className="text-white mb-1">
                                            {selectedDayData.meals.length} ארוחות תועדו
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {Math.round(totalCalories)} קלוריות סה"כ
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {Math.round(totalProtein)}g חלבון
                                        </p>
                                    </div>
                                )}

                                {selectedDayData.waterGlasses > 0 && (
                                    <div className="bg-black p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Droplet className="w-5 h-5 text-blue-400" />
                                            <h4 className="text-white font-semibold">שתיית מים</h4>
                                        </div>
                                        <p className="text-2xl text-white font-bold">
                                            {selectedDayData.waterGlasses} <span className="text-lg">כוסות</span>
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {(selectedDayData.waterGlasses * 0.25).toFixed(1)} ליטר
                                        </p>
                                        {selectedDayData.waterGlasses >= 12 && (
                                            <p className="text-xs text-green-400 mt-1">✓ יעד יומי הושג</p>
                                        )}
                                    </div>
                                )}

                                {selectedDayData.sleepHours > 0 && (
                                    <div className="bg-black p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Moon className="w-5 h-5 text-purple-400" />
                                            <h4 className="text-white font-semibold">שעות שינה</h4>
                                        </div>
                                        <p className="text-2xl text-white font-bold">
                                            {selectedDayData.sleepHours.toFixed(1)} <span className="text-lg">שעות</span>
                                        </p>
                                        {selectedDayData.sleepHours >= 7 && selectedDayData.sleepHours <= 9 && (
                                            <p className="text-xs text-green-400 mt-1">✓ יעד יומי הושג</p>
                                        )}
                                    </div>
                                )}

                                {selectedDayData.weight && (
                                    <div className="bg-black p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Scale className="w-5 h-5 text-purple-400" />
                                            <h4 className="text-white font-semibold">משקל</h4>
                                        </div>
                                        <p className="text-2xl text-white font-bold">
                                            {selectedDayData.weight.weight} <span className="text-lg">ק"ג</span>
                                        </p>
                                        {selectedDayData.weight.notes && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {selectedDayData.weight.notes}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {selectedDayData.workouts.length === 0 && 
                                 selectedDayData.meals.length === 0 && 
                                 !selectedDayData.weight &&
                                 selectedDayData.waterGlasses === 0 &&
                                 selectedDayData.sleepHours === 0 &&
                                 selectedDayData.cardioMinutes === 0 && (
                                    <div className="bg-black p-4 rounded-lg text-center">
                                        <p className="text-muted-foreground">
                                            אין נתונים ליום זה
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Calendar;