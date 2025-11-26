import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WeightLog } from '@/entities';

export const WeightDialog = () => {
    const [open, setOpen] = useState(false);
    const [weight, setWeight] = useState('');
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
                notes: '',
            });

            toast({
                title: "נשמר בהצלחה! ✅",
                description: `משקל ${weight} ק"ג נרשם`,
            });

            setWeight('');
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
                    <div className="bg-black/50 border border-border rounded-lg p-4 space-y-2">
                        <p className="text-sm font-semibold text-oxygym-yellow mb-2">הוראות שקילה:</p>
                        <div className="space-y-1.5">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground">לפני אוכל/קפה</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground">אחרי שירותים</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground">בלי בגדים</p>
                            </div>
                        </div>
                    </div>

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

                    <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
                        <p className="text-xs text-blue-200">
                            💡 <span className="font-semibold">זכור:</span> השקילות הן מדד התקדמות לאורך זמן - אנחנו לא מתייחסים נקודתית לכל שקילה, אלא על ציר זמן של כמה שבועות
                        </p>
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