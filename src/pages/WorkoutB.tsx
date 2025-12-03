import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ExerciseRow } from '@/components/ExerciseRow';
import { DateSelector } from '@/components/DateSelector';
import { ArrowRight, Save, X, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WorkoutLog } from '@/entities';
import { useDate } from '@/contexts/DateContext';
import { useQuery } from '@tanstack/react-query';

const WorkoutB = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { selectedDate, isToday } = useDate();
    const [exerciseData, setExerciseData] = useState<{ [key: string]: any }>({});
    const [cardioMinutes, setCardioMinutes] = useState(0);
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    const exercises = [
        { name: 'לחיצת חזה מוט אולימפי', sets: 4, reps: '8-12' },
        { name: 'לחיצת חזה בשיפוע (משקולות יד)', sets: 4, reps: '8-12' },
        { name: 'פרפר בקרוס אובר (מכונה 29)', sets: 4, reps: '8-12' },
        { name: 'פרפר במכונה (מכונה 18)', sets: 4, reps: '8-12' },
        { name: 'כפיפה עם מוט W', sets: 4, reps: '8-12' },
        { name: 'כפיפה עם משקולות יד', sets: 4, reps: '8-12' },
        { name: 'פטישים (משקולות יד)', sets: 4, reps: '8-12' },
        { name: 'בטן: בטן ישרה', sets: 3, reps: '15' },
        { name: 'בטן: עליות רגליים', sets: 3, reps: '15' },
    ];

    const { data: workoutData, refetch } = useQuery({
        queryKey: ['workout-log', selectedDate, 'B'],
        queryFn: async () => {
            try {
                const logs = await WorkoutLog.filter({ 
                    date: selectedDate, 
                    workout_type: 'B' 
                });
                console.log('Loaded workout B for date:', selectedDate, logs);
                return logs[0] || null;
            } catch (error) {
                console.error('Error loading workout:', error);
                return null;
            }
        },
    });

    useEffect(() => {
        console.log('Date changed to:', selectedDate);
        setExerciseData({});
        setCardioMinutes(0);
        setHasChanges(false);
        
        if (workoutData) {
            const loadedData: any = {};
            if (workoutData.exercises_completed) {
                workoutData.exercises_completed.forEach((ex: any) => {
                    loadedData[ex.name] = {
                        sets: ex.sets,
                        weight: ex.weight,
                        name: ex.name
                    };
                });
            }
            setExerciseData(loadedData);
            setCardioMinutes(workoutData.duration_minutes || 0);
        }
    }, [selectedDate, workoutData]);

    const handleExerciseDataChange = useCallback((data: any) => {
        setExerciseData(prev => ({ ...prev, [data.name]: data }));
        setHasChanges(true);
    }, []);

    const handleCardioChange = (value: string) => {
        const minutes = parseInt(value) || 0;
        setCardioMinutes(minutes);
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const completed = Object.values(exerciseData).every((data: any) => 
                data.sets.every((set: any) => set.completed)
            ) && cardioMinutes >= 20;
            
            const existingLogs = await WorkoutLog.filter({ 
                date: selectedDate, 
                workout_type: 'B' 
            });

            if (existingLogs.length > 0) {
                await WorkoutLog.update(existingLogs[0].id, {
                    exercises_completed: Object.entries(exerciseData).map(([name, data]: any) => ({
                        name,
                        sets: data.sets,
                        weight: data.weight,
                    })),
                    completed: completed,
                    duration_minutes: cardioMinutes,
                });
            } else {
                await WorkoutLog.create({
                    date: selectedDate,
                    workout_type: 'B',
                    exercises_completed: Object.entries(exerciseData).map(([name, data]: any) => ({
                        name,
                        sets: data.sets,
                        weight: data.weight,
                    })),
                    completed: completed,
                    duration_minutes: cardioMinutes,
                });
            }

            setHasChanges(false);
            toast({
                title: "נשמר בהצלחה! ✅",
                description: `אימון B של ${new Date(selectedDate).toLocaleDateString('he-IL')} נשמר`,
            });
            refetch();
        } catch (error) {
            console.error('Error saving workout:', error);
            toast({
                title: "שגיאה",
                description: "לא הצלחנו לשמור את האימון. נסה שוב.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        refetch();
        setHasChanges(false);
    };

    const cardioPercentage = Math.min((cardioMinutes / 20) * 100, 100);

    return (
        <div className="min-h-screen bg-oxygym-dark pb-32">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-white">אימון B</h1>
                    <Button
                        onClick={() => navigate('/workouts')}
                        variant="outline"
                        className="border-oxygym-yellow text-white hover:bg-oxygym-yellow hover:text-black"
                    >
                        <ArrowRight className="w-4 h-4 ml-2" />
                        חזרה
                    </Button>
                </div>

                <div className="mb-6">
                    <DateSelector />
                </div>

                {!isToday && (
                    <div className="mb-4 p-3 bg-oxygym-yellow/10 border border-oxygym-yellow rounded-lg">
                        <p className="text-center text-sm text-white">
                            📅 עורך נתונים של {new Date(selectedDate).toLocaleDateString('he-IL')}
                        </p>
                    </div>
                )}

                <div className="mb-6 p-4 bg-oxygym-darkGrey rounded-lg">
                    <img 
                        src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/files/chat-generated-images/project-e8bvhc02wqgh3kifuszrb/9fefb01c-83da-40d2-8419-1fb9e95f9b15.png" 
                        alt="Workout Chest and Arms" 
                        className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <p className="text-center text-muted-foreground">יום חזה וזרועות</p>
                </div>

                <Card className="bg-oxygym-darkGrey border-border mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Heart className="w-6 h-6 text-red-400" />
                            <div className="flex-1">
                                <Label htmlFor="cardio" className="text-white font-semibold">פעילות אירובית</Label>
                                <p className="text-xs text-muted-foreground">יעד: 20 דקות</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="cardio"
                                    type="number"
                                    value={cardioMinutes || ''}
                                    onChange={(e) => handleCardioChange(e.target.value)}
                                    placeholder="0"
                                    className="w-20 h-10 text-center bg-black border-border text-white"
                                />
                                <span className="text-sm text-muted-foreground">דקות</span>
                            </div>
                        </div>
                        <div className="w-full bg-black rounded-full h-2">
                            <div 
                                className="bg-red-400 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${cardioPercentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            {cardioMinutes} דקות מתוך 20
                        </p>
                    </CardContent>
                </Card>

                <div className="space-y-6 mb-6">
                    {exercises.map((exercise, index) => (
                        <ExerciseRow
                            key={index}
                            name={exercise.name}
                            sets={exercise.sets}
                            reps={exercise.reps}
                            workoutType="B"
                            initialData={exerciseData[exercise.name]}
                            onDataChange={handleExerciseDataChange}
                        />
                    ))}
                </div>

                {hasChanges && (
                    <div className="fixed bottom-20 left-0 right-0 bg-oxygym-darkGrey border-t border-border p-4">
                        <div className="container mx-auto max-w-3xl flex gap-3">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 bg-oxygym-yellow hover:bg-yellow-500 text-black font-bold"
                            >
                                <Save className="w-4 h-4 ml-2" />
                                {saving ? 'שומר...' : 'שמור שינויים'}
                            </Button>
                            <Button
                                onClick={handleCancel}
                                variant="outline"
                                className="flex-1 border-border text-white hover:bg-red-600 hover:text-white"
                            >
                                <X className="w-4 h-4 ml-2" />
                                בטל
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutB;