import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
    isActive: boolean;
    onComplete?: () => void;
}

export const Timer = ({ isActive, onComplete }: TimerProps) => {
    const [seconds, setSeconds] = useState(90);

    useEffect(() => {
        if (!isActive) {
            setSeconds(90);
            return;
        }

        const interval = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onComplete?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, onComplete]);

    if (!isActive) return null;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-oxygym-yellow text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50 animate-pulse">
            <Clock className="w-5 h-5" />
            <span className="text-xl font-bold">
                {minutes}:{remainingSeconds.toString().padStart(2, '0')}
            </span>
        </div>
    );
};