import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExerciseRow } from '@/components/ExerciseRow';
import { ArrowRight, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WorkoutLog } from '@/entities';

const WorkoutC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [exerciseData, setExerciseData] = useState<{ [key: string]: any }>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    const exercises = [
        { name: 'פולי עליון רחב (מכונה 19)', sets: 4, reps: '8-12' },
        { name: 'פולי עליון צר / תחתון צר (מכונה 19)', sets: 4, reps: '8-12' },
        { name: 'T BAR (מכונה 7)', sets: 4, reps: '8-12' },
        { name: 'פולי עם מוט ישר (מכונה 29)', sets: 4, reps: '8-12' },
        { name: 'פולי עם חבל (מכונה 29)', sets: 4, reps: '8-12' },
        { name: 'פולי W מאחורי הראש (מכונה 29)', sets: 4, reps: '8-12' },
        { name: 'בטן: בטן ישרה + עליות רגליים', sets: 3, reps: '15' },
    ];

    const handleExerciseDataChange = useCallback((data: any) => {
        setExerciseData(prev => ({ ...prev, [data.name]: data }));
        setHasChanges(true);
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            
            Object.entries(exerciseData).forEach(([name, data]) => {
                localStorage.setItem(`exercise-${name}`, JSON.stringify(data));
            });

            const completed = Object.values(exerciseData).every((data: any) => 
                data.sets.every((set: any) => set.completed)
            );

            const today = new Date().toISOString().split('T')[0];
            
            await WorkoutLog.create({
                date: today,
                workout_type: 'C',
                exercises_completed: Object.entries(exerciseData).map(([name, data]: any) => ({
                    name,
                    sets: data.sets,
                    weight: data.weight,
                })),
                completed: completed,
                duration_minutes: 0,
            });

            setHasChanges(false);
            toast({
                title: "נשמר בהצלחה! ✅",
                description: "אימון C נשמר במערכת",
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

    return (
        <div className="min-h-screen bg-oxygym-dark pb-32">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white">אימון C</h1>
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
                        src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/files/chat-generated-images/project-e8bvhc02wqgh3kifuszrb/7ca5911c-1444-415e-afac-00735a068c9f.png" 
                        alt="Workout Back and Triceps" 
                        className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <p className="text-center text-muted-foreground">יום גב וטריצפס</p>
                </div>

                <div className="space-y-6 mb-6">
                    {exercises.map((exercise, index) => (
                        <ExerciseRow
                            key={index}
                            name={exercise.name}
                            sets={exercise.sets}
                            reps={exercise.reps}
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

export default WorkoutC;