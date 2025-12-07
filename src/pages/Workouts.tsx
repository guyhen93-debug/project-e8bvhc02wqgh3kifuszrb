import { WorkoutCard } from '@/components/WorkoutCard';

const Workouts = () => {
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
            title: 'חזה ויד קדמית', 
            description: 'חזה וביצפס',
            path: '/workout-b',
            imageUrl: 'https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1764846439853-B.png'
        },
        { 
            id: 'c', 
            title: 'גב ויד אחורית', 
            description: 'גב וטריצפס',
            path: '/workout-c',
            imageUrl: 'https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1764846439853-C.png'
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
                            imageUrl={workout.imageUrl}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Workouts;