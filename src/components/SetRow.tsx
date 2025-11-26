import { Checkbox } from '@/components/ui/checkbox';

interface SetRowProps {
    setNumber: number;
    completed: boolean;
    onCompletedChange: (completed: boolean) => void;
}

export const SetRow = ({ 
    setNumber, 
    completed, 
    onCompletedChange 
}: SetRowProps) => {
    return (
        <div className="flex items-center gap-3 p-3 bg-oxygym-darkGrey rounded-lg">
            <span className="text-muted-foreground flex-1">סט {setNumber}</span>
            <div className="flex items-center gap-2">
                <Checkbox
                    checked={completed}
                    onCheckedChange={(checked) => onCompletedChange(checked === true)}
                    className="border-oxygym-yellow data-[state=checked]:bg-oxygym-yellow data-[state=checked]:border-oxygym-yellow"
                />
                <span className="text-sm text-muted-foreground">בוצע</span>
            </div>
        </div>
    );
};