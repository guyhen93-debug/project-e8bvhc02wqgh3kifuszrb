import { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
    isActive: boolean;
    onComplete?: () => void;
    restartToken?: number;
}

export const Timer = ({ isActive, onComplete, restartToken }: TimerProps) => {
    const [remainingSeconds, setRemainingSeconds] = useState(90);
    const targetTimeRef = useRef<number | null>(null);
    const hasFiredRef = useRef(false);

    const playSound = () => {
        try {
            if (typeof window === 'undefined') return;
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            if (!AudioContextClass) return;

            const audioContext = new AudioContextClass();
            
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

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
        } catch (error) {
            console.debug('Error playing sound:', error);
        }
    };

    useEffect(() => {
        if (!isActive) {
            setRemainingSeconds(90);
            targetTimeRef.current = null;
            hasFiredRef.current = false;
            return;
        }

        // Reset state when isActive or restartToken changes
        setRemainingSeconds(90);
        targetTimeRef.current = Date.now() + 90000;
        hasFiredRef.current = false;

        const interval = setInterval(() => {
            if (!targetTimeRef.current) return;

            const msLeft = targetTimeRef.current - Date.now();
            const secondsLeft = Math.ceil(msLeft / 1000);

            if (secondsLeft <= 0) {
                setRemainingSeconds(0);
                clearInterval(interval);
                
                if (!hasFiredRef.current) {
                    hasFiredRef.current = true;
                    playSound();
                    onComplete?.();
                }
            } else {
                setRemainingSeconds(Math.max(0, secondsLeft));
            }
        }, 100);

        return () => {
            clearInterval(interval);
        };
    }, [isActive, restartToken, onComplete]);

    if (!isActive) return null;

    const minutes = Math.floor(remainingSeconds / 60);
    const displaySeconds = remainingSeconds % 60;

    return (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-oxygym-yellow text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50 animate-pulse">
            <Clock className="w-5 h-5" />
            <span className="text-xl font-bold">
                {minutes}:{displaySeconds.toString().padStart(2, '0')}
            </span>
        </div>
    );
};
