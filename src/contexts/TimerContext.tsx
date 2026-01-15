import { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { useTelegramSettings } from '@/hooks/useTelegramSettings';
import { telegramSendMessage } from '@/functions';

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
    const { settings: telegramSettings } = useTelegramSettings();

    const startTimer = () => {
        console.log('Starting timer and unlocking audio for Safari...');
        
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

        // Send Telegram notification for rest start
        if (telegramSettings.chatId) {
            console.log('Timer started - attempting to send Telegram message to chatId:', telegramSettings.chatId);
            telegramSendMessage({ 
                chatId: telegramSettings.chatId, 
                text: "⏱️ מנוחה של 90 שניות התחילה\n💧 זמן מצוין לשתות מים!" 
            })
            .then(() => console.log('Timer started - Telegram message sent successfully'))
            .catch(error => console.error("Timer started - Telegram error:", error));
        } else {
            console.log('Timer started - no Telegram chatId configured, skipping Telegram message');
        }

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
