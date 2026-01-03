import { useTimer } from '@/contexts/TimerContext';
import { Timer } from './Timer';

export const GlobalTimer = () => {
    const { isActive, stopTimer, restartToken } = useTimer();
    
    // We wrap the improved Timer component which handles the accurate countdown 
    // and notifications while connecting it to the global timer state.
    // We pass restartToken to ensure the timer resets on every set completion.
    return (
        <Timer 
            isActive={isActive} 
            restartToken={restartToken}
            onComplete={stopTimer} 
        />
    );
};
