import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useDate } from '@/contexts/DateContext';

export const DateSelector = () => {
    const { selectedDate, setSelectedDate, isToday } = useDate();
    const [open, setOpen] = useState(false);

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            const dateString = date.toISOString().split('T')[0];
            setSelectedDate(dateString);
            setOpen(false);
        }
    };

    const handleResetToToday = () => {
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
        setOpen(false);
    };

    const selectedDateObj = new Date(selectedDate + 'T00:00:00');

    return (
        <div className="flex items-center gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={`justify-start text-right font-normal ${
                            !isToday 
                                ? 'border-oxygym-yellow bg-oxygym-yellow/10 text-white hover:bg-oxygym-yellow/20' 
                                : 'border-border text-white hover:bg-oxygym-darkGrey'
                        }`}
                    >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {format(selectedDateObj, 'EEEE, d MMMM', { locale: he })}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-oxygym-darkGrey border-border" align="start">
                    <Calendar
                        mode="single"
                        selected={selectedDateObj}
                        onSelect={handleDateSelect}
                        disabled={(date) => date > new Date() || date < new Date('2020-01-01')}
                        initialFocus
                        className="text-white"
                    />
                </PopoverContent>
            </Popover>
            {!isToday && (
                <Button
                    onClick={handleResetToToday}
                    variant="outline"
                    size="icon"
                    className="border-oxygym-yellow text-oxygym-yellow hover:bg-oxygym-yellow hover:text-black"
                >
                    <RotateCcw className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
};