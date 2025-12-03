import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { useTimer } from '@/contexts/TimerContext';

export const GlobalTimer = () => {
    const { isActive, stopTimer, audioContextRef } = useTimer();
    const [displaySeconds, setDisplaySeconds] = useState(90);

    const playSound = () => {
        try {
            console.log('Playing timer completion sound...');
            
            if (!audioContextRef.current) {
                console.error('AudioContext not available');
                return;
            }

            const audioContext = audioContextRef.current;
            
            // Resume AudioContext if it's suspended (Safari requirement)
            if (audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    console.log('AudioContext resumed');
                });
            }
            
            // Play 3 beeps with increasing pitch
            const playBeep = (index: number) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = 800 + (index * 200);
                oscillator.type = 'sine';

                const startTime = audioContext.currentTime + (index * 0.4);
                gainNode.gain.setValueAtTime(0.5, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

                oscillator.start(startTime);
                oscillator.stop(startTime + 0.3);
            };

            playBeep(0);
            playBeep(1);
            playBeep(2);

            console.log('Timer sound played successfully');
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };

    useEffect(() => {
        if (!isActive) {
            setDisplaySeconds(90);
            return;
        }

        console.log('Timer started');

        const interval = setInterval(() => {
            const currentSeconds = parseInt(sessionStorage.getItem('timer-seconds') || '90');
            
            if (currentSeconds <= 1) {
                console.log('Timer finished, playing sound...');
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