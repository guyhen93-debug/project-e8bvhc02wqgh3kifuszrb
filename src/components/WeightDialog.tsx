import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WeightLog } from '@/entities';

export const WeightDialog = () => {
    const [open, setOpen] = useState(false);
    const [weight, setWeight] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!weight || Number(weight) <= 0) {
            toast({
                title: "שגיאה",
                description: "נא להזין משקל תקין",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            
            await WeightLog.create({
                date: today,
                weight: Number(weight),
                notes: notes || '',
            });

            toast({
                title: "נשמר בהצלחה! ✅",
                description: `משקל ${weight} ק"ג נרשם`,
            });

            setWeight('');
            setNotes('');
            setOpen(false);
        } catch (error) {
            console.error('Error saving weight:', error);
            toast({
                title: "שגיאה",
                description: "לא הצלחנו לשמור את המשקל",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-oxygym-yellow hover:bg-yellow-500 text-black font-bold">
                    <Scale className="w-4 h-4 ml-2" />
                    תעד משקל
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-oxygym-darkGrey border-border text-white">
                <DialogHeader>
                    <DialogTitle className="text-white">תיעוד משקל</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="weight" className="text-white">משקל (ק״ג)</Label>
                        <Input
                            id="weight"
                            type="number"
                            step="0.1"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="68.5"
                            className="bg-black border-border text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-white">הערות (אופציונלי)</Label>
                        <Input
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="הרגשה, תנאים..."
                            className="bg-black border-border text-white"
                        />
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full bg-oxygym-yellow hover:bg-yellow-500 text-black font-bold"
                    >
                        {isLoading ? 'שומר...' : 'שמור משקל'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};