import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
    isActive: boolean;
    onComplete?: () => void;
}

export const Timer = ({ isActive, onComplete }: TimerProps) => {
    const [seconds, setSeconds] = useState(90);

    const playSound = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    };

    useEffect(() => {
        if (!isActive) {
            setSeconds(90);
            return;
        }

        const interval = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    playSound();
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
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-oxygym-yellow text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50 animate-pulse">
            <Clock className="w-5 h-5" />
            <span className="text-xl font-bold">
                {minutes}:{remainingSeconds.toString().padStart(2, '0')}
            </span>
        </div>
    );
};