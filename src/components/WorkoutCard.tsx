import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { WorkoutLog } from '@/entities';
import { useQuery } from '@tanstack/react-query';
import { useDate } from '@/contexts/DateContext';

interface WorkoutCardProps {
    id: string;
    title: string;
    description: string;
    path: string;
    imageUrl: string;
}

export const WorkoutCard = ({ id, title, description, path, imageUrl }: WorkoutCardProps) => {
    const navigate = useNavigate();
    const { selectedDate } = useDate();

    const { data: workoutData } = useQuery({
        queryKey: ['workout-status', id, selectedDate],
        queryFn: async () => {
            try {
                const logs = await WorkoutLog.filter({ 
                    date: selectedDate, 
                    workout_type: id.toUpperCase() 
                });
                return logs[0] || null;
            } catch (error) {
                console.error('Error loading workout status:', error);
                return null;
            }
        },
        refetchInterval: 3000,
        staleTime: 1000,
    });

    const hasProgress = workoutData && 
        workoutData.exercises_completed && 
        workoutData.exercises_completed.length > 0 &&
        workoutData.exercises_completed.some((ex: any) => 
            ex.sets && ex.sets.some((set: any) => set.completed)
        );

    return (
        <Card className="bg-oxygym-darkGrey border-border hover:border-oxygym-yellow transition-colors">
            <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-24 h-24 bg-oxygym-yellow rounded-full flex items-center justify-center p-1 overflow-hidden">
                        <img 
                            src={imageUrl} 
                            alt={title}
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                </div>
                <Button
                    onClick={() => navigate(path)}
                    className="w-full bg-oxygym-yellow hover:bg-yellow-500 text-black font-bold"
                >
                    {hasProgress ? 'המשך אימון' : 'התחל אימון'}
                </Button>
            </CardContent>
        </Card>
    );
};