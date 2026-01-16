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
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Exercise {
    name: string;
    sets: number;
    reps: string;
}

interface WorkoutTemplateProps {
    workoutType: 'A' | 'B' | 'C';
    workoutTitle: string;
    workoutDescription: string;
    workoutImageUrl: string;
    exercises: Exercise[];
}

export const WorkoutTemplate = ({
    workoutType,
    workoutTitle,
    workoutDescription,
    workoutImageUrl,
    exercises,
}: WorkoutTemplateProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { selectedDate, isToday } = useDate();
    const [exerciseData, setExerciseData] = useState<{ [key: string]: any }>({});
    const [cardioMinutes, setCardioMinutes] = useState(0);
    const [saving, setSaving] = useState(false);
    const isInitialLoadRef = useRef(true);
    const userMadeChangeRef = useRef(false);
    const exerciseDataRef = useRef<{ [key: string]: any }>({});
    const cardioMinutesRef = useRef(0);

    const initializedDateRef = useRef<string | null>(null);

    const { data: workoutData, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['workout-log', selectedDate, workoutType],
        queryFn: async () => {
            const logs = await WorkoutLog.filter({ 
                date: selectedDate, 
                workout_type: workoutType 
            });
            console.log(`Loaded workout ${workoutType} for date:`, selectedDate, logs);
            return logs[0] || null;
        },
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 5 * 60 * 1000,
    });

    const { data: lastWorkoutData } = useQuery({
        queryKey: ['last-workout-log', workoutType],
        queryFn: async () => {
            const logs = await WorkoutLog.filter({ 
                workout_type: workoutType 
            }, '-date', 1);
            console.log(`Loaded last workout ${workoutType}:`, logs);
            return logs[0] || null;
        },
        staleTime: 60000,
    });

    useEffect(() => {
        if (initializedDateRef.current === selectedDate && !isLoading) {
            return;
        }

        if (isLoading) return;

        console.log('Date changed to:', selectedDate);
        isInitialLoadRef.current = true;
        userMadeChangeRef.current = false;
        setExerciseData({});
        exerciseDataRef.current = {};
        setCardioMinutes(0);
        cardioMinutesRef.current = 0;
        
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
            exerciseDataRef.current = loadedData;
            setCardioMinutes(workoutData.duration_minutes || 0);
            cardioMinutesRef.current = workoutData.duration_minutes || 0;
            initializedDateRef.current = selectedDate;
            setTimeout(() => {
                isInitialLoadRef.current = false;
            }, 100);
        } else if (lastWorkoutData && lastWorkoutData.date !== selectedDate) {
            const loadedData: any = {};
            if (lastWorkoutData.exercises_completed) {
                lastWorkoutData.exercises_completed.forEach((ex: any) => {
                    loadedData[ex.name] = {
                        sets: Array(exercises.find(e => e.name === ex.name)?.sets || 4).fill(null).map(() => ({ completed: false })),
                        weight: ex.weight || 0,
                        name: ex.name
                    };
                });
            }
            setExerciseData(loadedData);
            exerciseDataRef.current = loadedData;
            setCardioMinutes(0);
            cardioMinutesRef.current = 0;
            console.log('Loaded weights from last workout:', loadedData);
            initializedDateRef.current = selectedDate;
            setTimeout(() => {
                isInitialLoadRef.current = false;
            }, 100);
        } else {
            initializedDateRef.current = selectedDate;
            setTimeout(() => {
                isInitialLoadRef.current = false;
            }, 100);
        }
    }, [selectedDate, workoutData, lastWorkoutData, exercises, workoutType, isLoading]);

    const autoSave = useCallback(async () => {
        if (isInitialLoadRef.current) {
            console.log('Skipping auto-save during initial load');
            return;
        }

        const currentExerciseData = exerciseDataRef.current;
        const currentCardioMinutes = cardioMinutesRef.current;
        const hasExercises = exercises.length > 0;
        
        if (!hasExercises && currentCardioMinutes === 0) {
            console.log('Skipping auto-save - no data to save');
            return;
        }
        
        try {
            setSaving(true);

            // Calculate completed status based on the currentExerciseData we have
            const completed = hasExercises && Object.values(currentExerciseData).length === exercises.length && 
                Object.values(currentExerciseData).every((data: any) => 
                    data.sets && data.sets.every((set: any) => set.completed)
                );
            
            const existingLogs = await WorkoutLog.filter({ 
                date: selectedDate, 
                workout_type: workoutType 
            });

            // Build full exercise list from templates to ensure denominator is correct
            const exercises_completed = exercises.map((exercise) => {
                const existing = currentExerciseData[exercise.name];
                const defaultSets = Array(exercise.sets)
                    .fill(null)
                    .map(() => ({ completed: false }));

                return {
                    name: exercise.name,
                    sets: (existing?.sets && existing.sets.length === exercise.sets)
                        ? existing.sets
                        : defaultSets,
                    weight: existing?.weight ?? 0,
                };
            });

            let savedLog;
            if (existingLogs.length > 0) {
                const updatedLog = await WorkoutLog.update(existingLogs[0].id, {
                    exercises_completed,
                    completed: completed,
                    duration_minutes: currentCardioMinutes,
                });
                savedLog = updatedLog ?? { 
                    ...existingLogs[0], 
                    exercises_completed, 
                    completed, 
                    duration_minutes: currentCardioMinutes 
                };
            } else {
                savedLog = await WorkoutLog.create({
                    date: selectedDate,
                    workout_type: workoutType,
                    exercises_completed,
                    completed: completed,
                    duration_minutes: currentCardioMinutes,
                });
            }

            // Update React Query cache immediately
            queryClient.setQueryData(['workout-log', selectedDate, workoutType], savedLog);
            queryClient.setQueryData(['last-workout-log', workoutType], savedLog);
            
            userMadeChangeRef.current = false;
            console.log(`Auto-saved workout ${workoutType}: ${exercises_completed.length} exercises saved.`);
        } catch (error) {
            console.error('Error auto-saving workout:', error);
        } finally {
            setSaving(false);
        }
    }, [selectedDate, workoutType, exercises, queryClient]);

    const handleExerciseDataChange = useCallback((data: any) => {
        setExerciseData(prev => {
            const updated = { ...prev, [data.name]: data };
            exerciseDataRef.current = updated;
            return updated;
        });

        if (!isInitialLoadRef.current) {
            userMadeChangeRef.current = true;
            autoSave();
        }
    }, [autoSave]);

    const handleCardioChange = (value: string) => {
        const minutes = parseInt(value) || 0;
        userMadeChangeRef.current = true;
        setCardioMinutes(minutes);
        cardioMinutesRef.current = minutes;
        autoSave();
    };

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                autoSave();
            }
        };

        const handlePageHide = () => {
            autoSave();
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pagehide', handlePageHide);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pagehide', handlePageHide);
        };
    }, [autoSave]);

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
                        <h1 className="text-3xl font-bold text-white">{workoutTitle}</h1>
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
                        src={workoutImageUrl}
                        alt={`${workoutTitle} Workout Image`}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <p className="text-center text-muted-foreground">{workoutDescription}</p>
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
                            workoutType={workoutType}
                            initialData={exerciseData[exercise.name]}
                            onDataChange={handleExerciseDataChange}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};