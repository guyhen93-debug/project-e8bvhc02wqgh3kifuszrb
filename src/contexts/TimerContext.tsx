import { createContext, useContext, useState, useRef, ReactNode } from 'react';

interface TimerContextType {
    isActive: boolean;
    seconds: number;
    startTimer: () => void;
    stopTimer: () => void;
    audioContextRef: React.MutableRefObject<AudioContext | null>;
    restartToken: number;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
    const [isActive, setIsActive] = useState(false);
    const [seconds, setSeconds] = useState(90);
    const [restartToken, setRestartToken] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);

    const startTimer = () => {
        console.log('Starting timer and unlocking audio...');

        // Background audio for keeping app alive
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        audio.loop = true;
        audio.volume = 0.01;
        audio.play().catch(err => console.log('Audio play failed:', err));

        if (typeof window !== 'undefined') {
            (window as any).timerAudio = audio;
        }
        
        // Create AudioContext if it doesn't exist
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            console.log('AudioContext created');
        }

        // Unlock audio by playing a silent sound immediately (Safari fix)
        try {
            const oscillator = audioContextRef.current.createOscillator();
            const gainNode = audioContextRef.current.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);
            
            // Silent sound (volume = 0)
            gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
            
            oscillator.start(audioContextRef.current.currentTime);
            oscillator.stop(audioContextRef.current.currentTime + 0.01);
            
            console.log('Audio unlocked successfully for Safari');
        } catch (error) {
            console.error('Error unlocking audio:', error);
        }

        // Store planned end time for fallback check
        const endTime = Date.now() + 90000;
        localStorage.setItem('timer_end_time', endTime.toString());
        console.log('Timer scheduled to end at:', new Date(endTime).toLocaleTimeString());

        setIsActive(true);
        setSeconds(90);
        setRestartToken(prev => prev + 1);
    };

    const stopTimer = () => {
        setIsActive(false);
        setSeconds(90);
    };

    return (
        <TimerContext.Provider value={{ isActive, seconds, startTimer, stopTimer, audioContextRef, restartToken }}>
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
