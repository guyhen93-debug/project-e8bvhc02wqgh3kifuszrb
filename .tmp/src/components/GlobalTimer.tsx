import { useTimer } from '@/contexts/TimerContext';
import { Timer } from './Timer';

export const GlobalTimer = () => {
    const { isActive, stopTimer } = useTimer();
    
    // We wrap the improved Timer component which handles the accurate countdown 
    // and notifications while connecting it to the global timer state.
    return (
        <Timer 
            isActive={isActive} 
            onComplete={stopTimer} 
        />
    );
};