import { createContext, useContext, useState, ReactNode } from 'react';

interface TimerContextType {
    isActive: boolean;
    seconds: number;
    startTimer: () => void;
    stopTimer: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
    const [isActive, setIsActive] = useState(false);
    const [seconds, setSeconds] = useState(90);

    const startTimer = () => {
        setIsActive(true);
        setSeconds(90);
    };

    const stopTimer = () => {
        setIsActive(false);
        setSeconds(90);
    };

    return (
        <TimerContext.Provider value={{ isActive, seconds, startTimer, stopTimer }}>
            {children}
        </TimerContext.Provider>
    );
};

export const useTimer = () => {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error('useTimer must be used within TimerProvider');
    }
    return context;
};