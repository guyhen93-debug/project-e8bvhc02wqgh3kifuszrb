import { useTimer } from '@/contexts/TimerContext';
import { Timer } from './Timer';
import { useTelegramSettings } from '@/hooks/useTelegramSettings';
import { telegramSendMessage } from '@/functions';

export const GlobalTimer = () => {
    const { isActive, stopTimer, restartToken } = useTimer();
    const { settings: telegramSettings } = useTelegramSettings();
    
    const handleComplete = () => {
        if (telegramSettings.chatId) {
            telegramSendMessage({ 
                chatId: telegramSettings.chatId, 
                text: "🔥 המנוחה הסתיימה!\n💪 בוא נמשיך - סט הבא מחכה!" 
            }).catch(err => console.error("Failed to send Telegram rest end:", err));
        }
        stopTimer();
    };

    // We wrap the improved Timer component which handles the accurate countdown 
    // and notifications while connecting it to the global timer state.
    // We pass restartToken to ensure the timer resets on every set completion.
    return (
        <Timer 
            isActive={isActive} 
            restartToken={restartToken}
            onComplete={handleComplete} 
        />
    );
};
