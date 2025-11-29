import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ExerciseRow } from '@/components/ExerciseRow';
import { ArrowRight, Save, X, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WorkoutLog } from '@/entities';

const WorkoutA = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [exerciseData, setExerciseData] = useState<{ [key: string]: any }>({});
    const [cardioMinutes, setCardioMinutes] = useState(0);
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    const exercises = [
        { name: 'לחיצת רגליים במכונה (מכונה 27)', sets: 4, reps: '8-12' },
        { name: 'סקוואט + משקולת חופשית', sets: 4, reps: '8-12' },
        { name: 'פשיטת ברך (מכונה 28)', sets: 4, reps: '8-12' },
        { name: 'כפיפת ברך (מכונה 28)', sets: 4, reps: '8-12' },
        { name: 'לחיצת כתפיים (משקולות יד + ספסל)', sets: 4, reps: '8-12' },
        { name: 'הרחקת כתפיים (משקולות יד)', sets: 4, reps: '8-12' },
        { name: 'כתף אחורית (מכונה 29)', sets: 4, reps: '8-12' },
        { name: 'בטן: בטן ישרה', sets: 3, reps: '15' },
        { name: 'בטן: עליות רגליים', sets: 3, reps: '15' },
    ];

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
            
            Object.entries(exerciseData).forEach(([name, data]) => {
                localStorage.setItem(`exercise-A-${name}`, JSON.stringify(data));
            });

            const completed = Object.values(exerciseData).every((data: any) => 
                data.sets.every((set: any) => set.completed)
            ) && cardioMinutes >= 20;

            const today = new Date().toISOString().split('T')[0];
            
            const existingLogs = await WorkoutLog.filter({ 
                date: today, 
                workout_type: 'A' 
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
                    date: today,
                    workout_type: 'A',
                    exercises_completed: Object.entries(exerciseData).map(([name, data]: any) => ({
                        name,
                        sets: data.sets,
                        weight: data.weight,
                    })),
                    completed: completed,
                    duration_minutes: cardioMinutes,
                });
            }

            if (completed) {
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('exercise-A-')) {
                        localStorage.removeItem(key);
                    }
                });
            }

            setHasChanges(false);
            toast({
                title: "נשמר בהצלחה! ✅",
                description: "אימון A נשמר במערכת",
            });
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
        window.location.reload();
    };

    const cardioPercentage = Math.min((cardioMinutes / 20) * 100, 100);

    return (
        <div className="min-h-screen bg-oxygym-dark pb-32">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white">אימון A</h1>
                    <Button
                        onClick={() => navigate('/workouts')}
                        variant="outline"
                        className="border-oxygym-yellow text-white hover:bg-oxygym-yellow hover:text-black"
                    >
                        <ArrowRight className="w-4 h-4 ml-2" />
                        חזרה
                    </Button>
                </div>

                <div className="mb-6 p-4 bg-oxygym-darkGrey rounded-lg">
                    <img 
                        src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/files/chat-generated-images/project-e8bvhc02wqgh3kifuszrb/5be3a896-9fce-4aa4-89f8-08ab0e2d7fae.png" 
                        alt="Workout Legs and Shoulders" 
                        className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <p className="text-center text-muted-foreground">יום רגליים וכתפיים</p>
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
                            workoutType="A"
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

export default WorkoutA;