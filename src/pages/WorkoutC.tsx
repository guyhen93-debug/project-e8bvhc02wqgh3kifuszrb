import { WorkoutTemplate } from '@/components/WorkoutTemplate';

const WorkoutC = () => {
    const exercises = [
        { name: 'פולי עליון רחב (מכונה 19)', sets: 4, reps: '8-12' },
        { name: 'פולי עליון צר (מכונה 19)', sets: 4, reps: '8-12' },
        { name: 'פולי תחתון צר (מכונה 19)', sets: 4, reps: '8-12' },
        { name: 'T BAR (מכונה 7)', sets: 4, reps: '8-12' },
        { name: 'פולי עם מוט ישר (מכונה 29)', sets: 4, reps: '8-12' },
        { name: 'פולי עם חבל (מכונה 29)', sets: 4, reps: '8-12' },
        { name: 'פולי W מאחורי הראש (מכונה 29)', sets: 4, reps: '8-12' },
        { name: 'בטן: בטן ישרה', sets: 3, reps: '15' },
        { name: 'בטן: עליות רגליים', sets: 3, reps: '15' },
    ];

    return (
        <WorkoutTemplate
            workoutType="C"
            workoutTitle="אימון C"
            workoutDescription="יום גב ויד אחורית"
            workoutImageUrl="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1764848183434-C.jpeg"
            exercises={exercises}
        />
    );
};

export default WorkoutC;