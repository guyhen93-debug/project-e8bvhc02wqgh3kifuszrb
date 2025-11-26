import { useState, useEffect } from 'react';
import { SetRow } from './SetRow';
import { Timer } from './Timer';
import { Input } from '@/components/ui/input';

interface ExerciseRowProps {
    name: string;
    sets: number;
    reps: string;
}

interface SetData {
    completed: boolean;
}

export const ExerciseRow = ({ name, sets, reps }: ExerciseRowProps) => {
    const [setData, setSetData] = useState<SetData[]>(
        Array(sets).fill(null).map(() => ({ completed: false }))
    );
    const [weight, setWeight] = useState<number>(0);
    const [timerActive, setTimerActive] = useState(false);
    const [lastCompletedSet, setLastCompletedSet] = useState<number | null>(null);

    useEffect(() => {
        const savedData = localStorage.getItem(`exercise-${name}`);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setSetData(parsed.sets);
            setWeight(parsed.weight || 0);
        }
    }, [name]);

    const handleWeightChange = (newWeight: number) => {
        setWeight(newWeight);
        localStorage.setItem(`exercise-${name}`, JSON.stringify({ sets: setData, weight: newWeight }));
    };

    const handleCompletedChange = (index: number, completed: boolean) => {
        const newSetData = [...setData];
        newSetData[index].completed = completed;
        setSetData(newSetData);
        localStorage.setItem(`exercise-${name}`, JSON.stringify({ sets: newSetData, weight }));

        if (completed) {
            setLastCompletedSet(index);
            setTimerActive(true);
        }
    };

    const handleTimerComplete = () => {
        setTimerActive(false);
        setLastCompletedSet(null);
    };

    return (
        <div className="mb-6">
            <div className="mb-3">
                <h3 className="text-lg font-semibold text-white">{name}</h3>
                <p className="text-sm text-muted-foreground">{sets} סטים, {reps} חזרות</p>
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
            {timerActive && lastCompletedSet !== null && (
                <Timer isActive={timerActive} onComplete={handleTimerComplete} />
            )}
        </div>
    );
};