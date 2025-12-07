import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ExerciseRow } from '@/components/ExerciseRow';
import { DateSelector } from '@/components/DateSelector';
import { ArrowRight, Heart, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WorkoutLog } from '@/entities';
import { useDate } from '@/contexts/DateContext';
import { useQuery } from '@tanstack/react-query';

const WorkoutC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { selectedDate, isToday } = useDate();
    const [exerciseData, setExerciseData] = useState<{ [key: string]: any }>({});
    const [cardioMinutes, setCardioMinutes] = useState(0);
    const [saving, setSaving] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout>();
    const isInitialLoadRef = useRef(true);
    const userMadeChangeRef = useRef(false);

    const exercises = [
        { name: 'פולי עליון רחב (מכונה 19)', sets: 4, reps: '8-12' },
        { name: 'פולי עליון צר (מכונה 19)', sets: 4, reps: '8-12' },
        { name: 'פולי תחתון צר (מכונה 19)', sets: 4, reps: '8-12' },
        { name: 'T BAR (מכונה 7)', sets: 4, reps: '8-12' },
        { name: 'פולי עם מוט ישר (מכונה 29)', sets: 4, reps: '8-12' },
        { name: 'פולי עם חבל (מכונה 29)', sets: 4, reps: '8-12' },
        { name: 'פולי W מאחורי הראש (מכונה 29)', sets: 4, reps: '8-12' },
        { name: 'בטן: בטן ישרה', sets: 3, reps: '15' },
        { name: 'בטן: עליות רגליים', sets: 3, reps: '15' },
    ];

    const { data: workoutData, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['workout-log', selectedDate, 'C'],
        queryFn: async () => {
            const logs = await WorkoutLog.filter({ 
                date: selectedDate, 
                workout_type: 'C' 
            });
            console.log('Loaded workout C for date:', selectedDate, logs);
            return logs[0] || null;
        },
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        staleTime: 30000,
    });

    useEffect(() => {
        console.log('Date changed to:', selectedDate);
        isInitialLoadRef.current = true;
        userMadeChangeRef.current = false;
        setExerciseData({});
        setCardioMinutes(0);
        
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
            setTimeout(() => {
                isInitialLoadRef.current = false;
            }, 100);
        } else {
            setTimeout(() => {
                isInitialLoadRef.current = false;
            }, 100);
        }
    }, [selectedDate, workoutData]);

    const autoSave = useCallback(async () => {
        if (isInitialLoadRef.current || !userMadeChangeRef.current) {
            console.log('Skipping auto-save during initial load or no user changes');
            return;
        }
        
        try {
            setSaving(true);

            const completed = Object.values(exerciseData).every((data: any) => 
                data.sets.every((set: any) => set.completed)
            ) && cardioMinutes >= 20;
            
            const existingLogs = await WorkoutLog.filter({ 
                date: selectedDate, 
                workout_type: 'C' 
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
                    workout_type: 'C',
                    exercises_completed: Object.entries(exerciseData).map(([name, data]: any) => ({
                        name,
                        sets: data.sets,
                        weight: data.weight,
                    })),
                    completed: completed,
                    duration_minutes: cardioMinutes,
                });
            }

            console.log('Auto-saved workout C');
        } catch (error) {
            console.error('Error auto-saving workout:', error);
        } finally {
            setSaving(false);
        }
    }, [exerciseData, cardioMinutes, selectedDate]);

    useEffect(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            autoSave();
        }, 1000);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [exerciseData, cardioMinutes, autoSave]);

    const handleExerciseDataChange = useCallback((data: any) => {
        userMadeChangeRef.current = true;
        setExerciseData(prev => ({ ...prev, [data.name]: data }));
    }, []);

    const handleCardioChange = (value: string) => {
        userMadeChangeRef.current = true;
        const minutes = parseInt(value) || 0;
        setCardioMinutes(minutes);
    };

    const cardioPercentage = Math.min((cardioMinutes / 20) * 100, 100);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-oxygym-dark flex items-center justify-center pb-20">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-oxygym-yellow mb-4"></div>
                    <p className="text-white text-lg">טוען אימון...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-oxygym-dark flex items-center justify-center pb-20 px-4">
                <Card className="bg-oxygym-darkGrey border-red-500 max-w-md">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">אופס! משהו השתבש</h2>
                        <p className="text-muted-foreground mb-6">
                            לא הצלחנו לטעון את נתוני האימון. בדוק את החיבור לאינטרנט ונסה שוב.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => refetch()}
                                className="flex-1 bg-oxygym-yellow hover:bg-yellow-500 text-black font-bold"
                            >
                                <RefreshCw className="w-4 h-4 ml-2" />
                                נסה שוב
                            </Button>
                            <Button
                                onClick={() => navigate('/workouts')}
                                variant="outline"
                                className="flex-1 border-border text-white"
                            >
                                <ArrowRight className="w-4 h-4 ml-2" />
                                חזרה
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-oxygym-dark pb-20">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white">גב ויד אחורית</h1>
                        {saving && (
                            <p className="text-xs text-oxygym-yellow mt-1">שומר אוטומטית...</p>
                        )}
                    </div>
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
                        src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1764848183434-C.jpeg" 
                        alt="Lat Pulldown - אימון משיכות גב" 
                        className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <p className="text-center text-muted-foreground">יום גב וטריצפס</p>
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
                            workoutType="C"
                            initialData={exerciseData[exercise.name]}
                            onDataChange={handleExerciseDataChange}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WorkoutC;