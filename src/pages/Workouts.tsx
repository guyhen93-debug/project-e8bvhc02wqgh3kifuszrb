import { useQuery } from '@tanstack/react-query';
import { WorkoutCard } from '@/components/WorkoutCard';
import { WorkoutLog } from '@/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { getStartOfWeek, getTodayString } from '@/lib/date-utils';

const Workouts = () => {
    // Use shared date utilities (same as Index.tsx for cache sharing)
    const startOfWeek = getStartOfWeek();
    const today = getTodayString();

    // Use same query key as Index.tsx to share cache
    const { data: weekWorkouts } = useQuery({
        queryKey: ['week-workouts', startOfWeek],
        queryFn: async () => {
            try {
                return await WorkoutLog.query()
                    .gte('date', startOfWeek)
                    .lte('date', today)
                    .exec();
            } catch (error) {
                console.error('Error fetching week workouts:', error);
                return [];
            }
        },
    });

    const completedWorkouts = weekWorkouts?.filter(w => w.completed).length || 0;
    const completedTypes = new Set(weekWorkouts?.filter(w => w.completed).map(w => w.workout_type));
    const totalCardioMinutes = weekWorkouts?.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) || 0;
    const weeklyCardioTarget = 60;
    const weeklyTarget = 3;

    const workouts = [
        { 
            id: 'a', 
            title: 'אימון A', 
            description: 'רגליים וכתפיים',
            path: '/workout-a',
            imageUrl: 'https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1764846439852-A.png'
        },
        { 
            id: 'b', 
            title: 'אימון B', 
            description: 'חזה ויד קדמית',
            path: '/workout-b',
            imageUrl: 'https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1764846439853-B.png'
        },
        { 
            id: 'c', 
            title: 'אימון C', 
            description: 'גב ויד אחורית',
            path: '/workout-c',
            imageUrl: 'https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1764846439853-C.png'
        },
    ];

    return (
        <div className="min-h-screen bg-oxygym-dark pb-20">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <h1 className="text-3xl font-bold text-white mb-2">האימונים שלי</h1>
                <p className="text-muted-foreground mb-8">בחר אימון להתחלה</p>

                <Card className="bg-oxygym-darkGrey border-oxygym-yellow/20 mb-6">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                            <CheckCircle2 className="w-4 h-4 text-oxygym-yellow" />
                            התקדמות השבוע
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <p className="text-xl font-bold text-white mb-1">
                            הושלמו {completedWorkouts} מתוך {weeklyTarget} אימונים
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                            <p className="text-sm text-muted-foreground">
                                אירובי: {totalCardioMinutes} מתוך {weeklyCardioTarget} דקות
                            </p>
                            {totalCardioMinutes >= weeklyCardioTarget && (
                                <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30 font-bold">
                                    ✓ יעד הושג
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {['A', 'B', 'C'].map((type) => {
                                const isCompleted = completedTypes.has(type);
                                return (
                                    <div 
                                        key={type}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                            isCompleted 
                                                ? 'bg-oxygym-yellow/20 text-oxygym-yellow border border-oxygym-yellow/30' 
                                                : 'bg-black/40 text-muted-foreground border border-border'
                                        }`}
                                    >
                                        אימון {type} {isCompleted && '✓'}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
                
                <div className="space-y-4">
                    {workouts.map((workout) => (
                        <WorkoutCard
                            key={workout.id}
                            id={workout.id}
                            title={workout.title}
                            description={workout.description}
                            path={workout.path}
                            imageUrl={workout.imageUrl}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Workouts;