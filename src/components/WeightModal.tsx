import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Scale } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { WeightLog } from '@/entities';
import { useToast } from '@/hooks/use-toast';

interface WeightModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
}

export const WeightModal = ({ open, onOpenChange, onSave }: WeightModalProps) => {
    const [date, setDate] = useState<Date>(new Date());
    const [weight, setWeight] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const handleSave = async () => {
        if (!weight || weight === '') {
            toast({
                title: "שגיאה",
                description: "אנא הזן משקל",
                variant: "destructive",
            });
            return;
        }

        try {
            setSaving(true);
            const dateStr = format(date, 'yyyy-MM-dd');
            
            await WeightLog.create({
                date: dateStr,
                weight: parseFloat(weight),
                notes: notes || '',
            });

            toast({
                title: "נשמר בהצלחה! ✅",
                description: `משקל ${weight} ק"ג נרשם ליום ${format(date, 'dd/MM/yyyy')}`,
            });

            setWeight('');
            setNotes('');
            setDate(new Date());
            onOpenChange(false);
            
            if (onSave) {
                onSave();
            }
        } catch (error) {
            console.error('Error saving weight:', error);
            toast({
                title: "שגיאה",
                description: "לא הצלחנו לשמור את המשקל. נסה שוב.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-oxygym-darkGrey border-border text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Scale className="w-6 h-6 text-oxygym-yellow" />
                        תיעוד משקל
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div>
                        <Label className="text-white mb-2 block">תאריך</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-right bg-black border-border text-white hover:bg-oxygym-darkGrey"
                                >
                                    <CalendarIcon className="ml-2 h-4 w-4" />
                                    {format(date, 'PPP', { locale: he })}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-oxygym-darkGrey border-border">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(d) => d && setDate(d)}
                                    initialFocus
                                    locale={he}
                                    className="pointer-events-auto"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div>
                        <Label className="text-white mb-2 block">משקל (ק"ג)</Label>
                        <Input
                            type="number"
                            step="0.1"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="70.5"
                            className="bg-black border-border text-white"
                        />
                    </div>

                    <div>
                        <Label className="text-white mb-2 block">הערות (אופציונלי)</Label>
                        <Input
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="הערות על השקילה..."
                            className="bg-black border-border text-white"
                        />
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-oxygym-yellow hover:bg-yellow-500 text-black font-bold"
                    >
                        {saving ? 'שומר...' : 'שמור משקל'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};