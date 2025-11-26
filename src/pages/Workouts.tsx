import { WorkoutCard } from '@/components/WorkoutCard';

const Workouts = () => {
    const workouts = [
        { 
            id: 'a', 
            title: 'אימון A', 
            description: 'רגליים וכתפיים',
            path: '/workout-a' 
        },
        { 
            id: 'b', 
            title: 'אימון B', 
            description: 'חזה וזרועות',
            path: '/workout-b' 
        },
        { 
            id: 'c', 
            title: 'אימון C', 
            description: 'גב וטריצפס',
            path: '/workout-c' 
        },
    ];

    return (
        <div className="min-h-screen bg-oxygym-dark pb-20">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <h1 className="text-3xl font-bold text-white mb-2">האימונים שלי</h1>
                <p className="text-muted-foreground mb-8">בחר אימון להתחלה</p>
                
                <div className="space-y-4">
                    {workouts.map((workout) => (
                        <WorkoutCard
                            key={workout.id}
                            id={workout.id}
                            title={workout.title}
                            description={workout.description}
                            path={workout.path}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Workouts;