import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface SetRowProps {
    setNumber: number;
    weight: number;
    completed: boolean;
    onWeightChange: (weight: number) => void;
    onCompletedChange: (completed: boolean) => void;
}

export const SetRow = ({ 
    setNumber, 
    weight, 
    completed, 
    onWeightChange, 
    onCompletedChange 
}: SetRowProps) => {
    return (
        <div className="flex items-center gap-3 p-3 bg-oxygym-darkGrey rounded-lg">
            <span className="text-muted-foreground w-12">סט {setNumber}</span>
            <div className="flex items-center gap-2 flex-1">
                <Input
                    type="number"
                    value={weight || ''}
                    onChange={(e) => onWeightChange(Number(e.target.value))}
                    placeholder="משקל"
                    className="bg-black border-border text-white w-24"
                />
                <span className="text-sm text-muted-foreground">ק״ג</span>
            </div>
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