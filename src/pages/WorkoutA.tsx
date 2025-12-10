import { WorkoutTemplate } from '@/components/WorkoutTemplate';

const WorkoutA = () => {
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

    return (
        <WorkoutTemplate
            workoutType="A"
            workoutTitle="אימון A"
            workoutDescription="יום רגליים וכתפיים"
            workoutImageUrl="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1764848183433-A.jpeg"
            exercises={exercises}
        />
    );
};

export default WorkoutA;