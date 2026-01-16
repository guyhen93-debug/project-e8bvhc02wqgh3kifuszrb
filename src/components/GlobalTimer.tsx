import { useTimer } from '@/contexts/TimerContext';
import { Timer } from './Timer';

export const GlobalTimer = () => {
    const { isActive, stopTimer, restartToken } = useTimer();

    const handleComplete = () => {
        console.log('Timer ended - cleaning up');

        // Cleanup background audio
        if (typeof window !== 'undefined') {
            const w = window as any;
            if (w.timerAudio) {
                w.timerAudio.pause();
                w.timerAudio.currentTime = 0;
                w.timerAudio = null;
            }
        }

        // Clear fallback marker
        localStorage.removeItem('timer_end_time');

        stopTimer();
    };

    return (
        <Timer 
            isActive={isActive} 
            restartToken={restartToken}
            onComplete={handleComplete} 
        />
    );
};
