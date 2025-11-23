import { useState, useEffect } from 'react';
import { SetRow } from './SetRow';
import { Timer } from './Timer';

interface ExerciseRowProps {
    name: string;
    sets: number;
    reps: string;
}

interface SetData {
    weight: number;
    completed: boolean;
}

export const ExerciseRow = ({ name, sets, reps }: ExerciseRowProps) => {
    const [setData, setSetData] = useState<SetData[]>(
        Array(sets).fill(null).map(() => ({ weight: 0, completed: false }))
    );
    const [timerActive, setTimerActive] = useState(false);
    const [lastCompletedSet, setLastCompletedSet] = useState<number | null>(null);

    useEffect(() => {
        const savedData = localStorage.getItem(`exercise-${name}`);
        if (savedData) {
            setSetData(JSON.parse(savedData));
        }
    }, [name]);

    const handleWeightChange = (index: number, weight: number) => {
        const newSetData = [...setData];
        newSetData[index].weight = weight;
        setSetData(newSetData);
        localStorage.setItem(`exercise-${name}`, JSON.stringify(newSetData));
    };

    const handleCompletedChange = (index: number, completed: boolean) => {
        const newSetData = [...setData];
        newSetData[index].completed = completed;
        setSetData(newSetData);
        localStorage.setItem(`exercise-${name}`, JSON.stringify(newSetData));

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
            </div>
            <div className="space-y-2">
                {setData.map((set, index) => (
                    <SetRow
                        key={index}
                        setNumber={index + 1}
                        weight={set.weight}
                        completed={set.completed}
                        onWeightChange={(weight) => handleWeightChange(index, weight)}
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