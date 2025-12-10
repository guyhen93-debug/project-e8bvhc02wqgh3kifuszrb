import { WorkoutTemplate } from '@/components/WorkoutTemplate';

const WorkoutB = () => {
    const exercises = [
        { name: 'לחיצת חזה מוט אולימפי', sets: 4, reps: '8-12' },
        { name: 'לחיצת חזה בשיפוע (משקולות יד)', sets: 4, reps: '8-12' },
        { name: 'פרפר בקרוס אובר (מכונה 29)', sets: 4, reps: '8-12' },
        { name: 'פרפר במכונה (מכונה 18)', sets: 4, reps: '8-12' },
        { name: 'כפיפה עם מוט W', sets: 4, reps: '8-12' },
        { name: 'כפיפה עם משקולות יד', sets: 4, reps: '8-12' },
        { name: 'פטישים (משקולות יד)', sets: 4, reps: '8-12' },
        { name: 'בטן: בטן ישרה', sets: 3, reps: '15' },
        { name: 'בטן: עליות רגליים', sets: 3, reps: '15' },
    ];

    return (
        <WorkoutTemplate
            workoutType="B"
            workoutTitle="אימון B"
            workoutDescription="יום חזה ויד קדמית"
            workoutImageUrl="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1764848183434-B.jpeg"
            exercises={exercises}
        />
    );
};

export default WorkoutB;