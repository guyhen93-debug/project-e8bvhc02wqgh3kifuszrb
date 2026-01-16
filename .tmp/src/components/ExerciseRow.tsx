import { useState, useEffect, useRef } from 'react';
import { SetRow } from './SetRow';
import { useTimer } from '@/contexts/TimerContext';
import { Input } from '@/components/ui/input';
import { notifyRestEnd } from '@/functions';

interface ExerciseRowProps {
    name: string;
    sets: number;
    reps: string;
    workoutType?: string;
    initialData?: any;
    onDataChange?: (data: any) => void;
}

interface SetData {
    completed: boolean;
}

export const ExerciseRow = ({ name, sets, reps, workoutType = '', initialData, onDataChange }: ExerciseRowProps) => {
    const hasLoadedInitialData = useRef(false);
    const [setData, setSetData] = useState<SetData[]>(
        Array(sets).fill(null).map(() => ({ completed: false }))
    );
    const [weight, setWeight] = useState<number>(0);
    const { startTimer } = useTimer();

    const isAbsExercise = name.toLowerCase().includes('בטן');

    useEffect(() => {
        if (!initialData) {
            hasLoadedInitialData.current = false;
            return;
        }

        if (hasLoadedInitialData.current) return;

        console.log('Loading initial data for', name, initialData);
        if (initialData.sets) {
            setSetData(initialData.sets as SetData[]);
        } else {
            setSetData(Array(sets).fill(null).map(() => ({ completed: false })));
        }
        
        if (!isAbsExercise && typeof initialData.weight === 'number') {
            setWeight(initialData.weight);
        }

        hasLoadedInitialData.current = true;
    }, [initialData, name, isAbsExercise, sets]);

    useEffect(() => {
        if (onDataChange) {
            onDataChange({ sets: setData, weight: isAbsExercise ? 0 : weight, name });
        }
    }, [setData, weight, name, onDataChange, isAbsExercise]);

    const handleWeightChange = (newWeight: number) => {
        setWeight(newWeight);
    };

    const handleCompletedChange = (index: number, completed: boolean) => {
        const newSetData = [...setData];
        newSetData[index].completed = completed;
        setSetData(newSetData);

        if (completed) {
            startTimer();
            notifyRestEnd({})
                .then((res: any) => {
                    if (res?.success) {
                        console.log('Notification sent successfully');
                    } else {
                        console.error('Notification failed:', res?.error ?? res);
                    }
                })
                .catch((err) => {
                    console.error('Notification failed:', err);
                });
        }
    };

    return (
        <div className="mb-6">
            <div className="mb-3">
                <h3 className="text-lg font-semibold text-white">{name}</h3>
                <p className="text-sm text-muted-foreground">{sets} סטים, {reps} חזרות</p>
                {!isAbsExercise && (
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-muted-foreground">משקל:</span>
                        <Input
                            type="number"
                            value={weight || ''}
                            onChange={(e) => handleWeightChange(Number(e.target.value))}
                            placeholder="0"
                            className="bg-black border-border text-white w-24 h-9"
                        />
                        <span className="text-sm text-muted-foreground">ק״ג</span>
                    </div>
                )}
            </div>
            <div className="space-y-2">
                {setData.map((set, index) => (
                    <SetRow
                        key={index}
                        setNumber={index + 1}
                        completed={set.completed}
                        onCompletedChange={(completed) => handleCompletedChange(index, completed)}
                    />
                ))}
            </div>
        </div>
    );
};
