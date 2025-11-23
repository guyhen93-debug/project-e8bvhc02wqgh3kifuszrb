import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dumbbell, Apple } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();

    const workouts = [
        { id: 'a', title: 'אימון A', subtitle: '(ראשון)', path: '/workout-a' },
        { id: 'b', title: 'אימון B', subtitle: '(שני)', path: '/workout-b' },
        { id: 'c', title: 'אימון C', subtitle: '(רביעי)', path: '/workout-c' },
        { id: 'nutrition', title: 'תפריט תזונה', subtitle: '', path: '/nutrition', icon: true },
    ];

    return (
        <div className="min-h-screen bg-oxygym-dark">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center mb-8">
                    <img 
                        src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/files/chat-generated-images/project-e8bvhc02wqgh3kifuszrb/69e66df0-f040-4cc8-b3fa-00d6cbd9d70e.png" 
                        alt="OXYGYM Logo" 
                        className="w-20 h-20 mb-4"
                    />
                </div>
                <h1 className="text-4xl font-bold text-center text-white mb-2">OXYGYM Tracker</h1>
                <p className="text-center text-muted-foreground mb-12">המעקב האישי שלך לאימונים ותזונה</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {workouts.map((workout) => (
                        <Button
                            key={workout.id}
                            onClick={() => navigate(workout.path)}
                            className="h-40 bg-oxygym-yellow hover:bg-yellow-500 text-black font-bold text-2xl rounded-xl shadow-2xl hover:scale-105 transition-transform duration-200 flex flex-col items-center justify-center gap-2"
                        >
                            {workout.icon ? (
                                <Apple className="w-12 h-12" />
                            ) : (
                                <Dumbbell className="w-12 h-12" />
                            )}
                            <div>
                                <div>{workout.title}</div>
                                {workout.subtitle && (
                                    <div className="text-lg font-normal">{workout.subtitle}</div>
                                )}
                            </div>
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;