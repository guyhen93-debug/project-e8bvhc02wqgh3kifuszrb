import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExerciseRow } from '@/components/ExerciseRow';
import { ArrowRight } from 'lucide-react';

const WorkoutA = () => {
    const navigate = useNavigate();

    const exercises = [
        { name: 'לחיצת רגליים במכונה (מכונה 27)', sets: 4, reps: '8-12' },
        { name: 'סקוואט + משקולת חופשית', sets: 4, reps: '8-12' },
        { name: 'פשיטת ברך (מכונה 28)', sets: 4, reps: '8-12' },
        { name: 'כפיפת ברך (מכונה 28)', sets: 4, reps: '8-12' },
        { name: 'לחיצת כתפיים (משקולות יד + ספסל)', sets: 4, reps: '8-12' },
        { name: 'הרחקת כתפיים (משקולות יד)', sets: 4, reps: '8-12' },
        { name: 'כתף אחורית (מכונה 29)', sets: 4, reps: '8-12' },
        { name: 'בטן: בטן ישרה + עליות רגליים', sets: 3, reps: '15' },
    ];

    return (
        <div className="min-h-screen bg-oxygym-dark pb-20">
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
                        src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/files/chat-generated-images/project-e8bvhc02wqgh3kifuszrb/e711204c-6927-428c-879f-2cd23c22606a.png" 
                        alt="Workout" 
                        className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <p className="text-center text-muted-foreground">יום רגליים וכתפיים</p>
                </div>

                <div className="space-y-6">
                    {exercises.map((exercise, index) => (
                        <ExerciseRow
                            key={index}
                            name={exercise.name}
                            sets={exercise.sets}
                            reps={exercise.reps}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WorkoutA;