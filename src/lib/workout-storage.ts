export interface WorkoutDraft {
  date: string;
  workout_type: 'A' | 'B' | 'C';
  exercises_completed: {
    name: string;
    sets: { completed: boolean }[];
    weight: number;
  }[];
  duration_minutes: number;
  last_updated: string;
}

const getWorkoutDraftKey = (date: string, workoutType: string) => 
  `oxygym_workout_draft_${workoutType}_${date}`;

export const saveWorkoutDraft = (draft: WorkoutDraft) => {
  try {
    const key = getWorkoutDraftKey(draft.date, draft.workout_type);
    localStorage.setItem(key, JSON.stringify(draft));
  } catch (error) {
    console.error('Failed to save workout draft to local storage:', error);
  }
};

export const loadWorkoutDraft = (date: string, workoutType: string): WorkoutDraft | null => {
  try {
    const key = getWorkoutDraftKey(date, workoutType);
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const draft = JSON.parse(item);
    
    // Loose validation
    if (draft.date === date && draft.workout_type === workoutType && Array.isArray(draft.exercises_completed)) {
      return draft;
    }
    return null;
  } catch (error) {
    console.error('Failed to load workout draft from local storage:', error);
    return null;
  }
};

export const clearWorkoutDraft = (date: string, workoutType: string) => {
  try {
    const key = getWorkoutDraftKey(date, workoutType);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear workout draft from local storage:', error);
  }
};
