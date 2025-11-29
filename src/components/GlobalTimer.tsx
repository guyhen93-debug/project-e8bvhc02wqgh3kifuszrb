import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { useTimer } from '@/contexts/TimerContext';

export const GlobalTimer = () => {
    const { isActive, stopTimer } = useTimer();
    const [displaySeconds, setDisplaySeconds] = useState(90);

    const playSound = () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // Play 3 beeps with increasing pitch
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    oscillator.frequency.value = 800 + (i * 200);
                    oscillator.type = 'sine';

                    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                }, i * 400);
            }
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };

    useEffect(() => {
        if (!isActive) {
            setDisplaySeconds(90);
            return;
        }

        const interval = setInterval(() => {
            const currentSeconds = parseInt(sessionStorage.getItem('timer-seconds') || '90');
            
            if (currentSeconds <= 1) {
                clearInterval(interval);
                playSound();
                stopTimer();
                sessionStorage.removeItem('timer-seconds');
                setDisplaySeconds(0);
                return;
            }
            
            const newSeconds = currentSeconds - 1;
            sessionStorage.setItem('timer-seconds', newSeconds.toString());
            setDisplaySeconds(newSeconds);
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, stopTimer]);

    if (!isActive) return null;

    const minutes = Math.floor(displaySeconds / 60);
    const remainingSeconds = displaySeconds % 60;

    return (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-oxygym-yellow text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50 animate-pulse">
            <Clock className="w-5 h-5" />
            <span className="text-xl font-bold">
                {minutes}:{remainingSeconds.toString().padStart(2, '0')}
            </span>
        </div>
    );
};