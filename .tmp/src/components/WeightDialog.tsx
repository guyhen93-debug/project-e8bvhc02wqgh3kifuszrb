import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Scale, CheckCircle2, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WeightLog } from '@/entities';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';

export const WeightDialog = () => {
    const [open, setOpen] = useState(false);
    const [weight, setWeight] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedWeightDate, setSelectedWeightDate] = useState<Date | undefined>(new Date());
    const [calendarOpen, setCalendarOpen] = useState(false);
    const { toast } = useToast();

    const { data: lastWeightLog } = useQuery({
        queryKey: ['last-weight-log'],
        queryFn: async () => {
            try {
                const logs = await WeightLog.list('-date', 1);
                return logs?.[0] ?? null;
            } catch (e) {
                console.error('Error fetching last weight log:', e);
                return null;
            }
        },
        staleTime: 5 * 60 * 1000
    });

    useEffect(() => {
        if (open && lastWeightLog && weight === '') {
            setWeight(String(lastWeightLog.weight));
        }
    }, [open, lastWeightLog, weight]);

    const handleSubmit = async () => {
        const normalized = weight.replace(',', '.').trim();
        const numericWeight = parseFloat(normalized);

        if (!normalized || !Number.isFinite(numericWeight) || numericWeight <= 0) {
            toast({
                title: "שגיאה",
                description: "נא להזין משקל תקין",
                variant: "destructive",
            });
            return;
        }

        if (!selectedWeightDate) {
            toast({
                title: "שגיאה",
                description: "נא לבחור תאריך",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const dateString = selectedWeightDate.toISOString().split('T')[0];
            
            await WeightLog.create({
                date: dateString,
                weight: numericWeight,
                notes: '',
            });

            toast({
                title: "נשמר בהצלחה! ✅",
                description: `משקל ${numericWeight} ק"ג נרשם ל-${format(selectedWeightDate, 'd MMMM', { locale: he })}`,
            });

            setWeight('');
            setSelectedWeightDate(new Date());
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
                        <Label htmlFor="weight-date" className="text-white">תאריך השקילה</Label>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-right border-border text-white hover:bg-oxygym-darkGrey"
                                >
                                    <CalendarIcon className="ml-2 h-4 w-4" />
                                    {selectedWeightDate ? format(selectedWeightDate, 'EEEE, d MMMM yyyy', { locale: he }) : 'בחר תאריך'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-oxygym-darkGrey border-border" align="start">
                                <Calendar
                                    mode="single"
                                    selected={selectedWeightDate}
                                    onSelect={(date) => {
                                        setSelectedWeightDate(date);
                                        setCalendarOpen(false);
                                    }}
                                    disabled={(date) => date > new Date() || date < new Date('2020-01-01')}
                                    initialFocus
                                    className="text-white"
                                />
                            </PopoverContent>
                        </Popover>
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