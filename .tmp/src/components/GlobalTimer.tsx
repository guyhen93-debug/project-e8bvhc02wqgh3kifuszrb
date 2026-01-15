import { useTimer } from '@/contexts/TimerContext';
import { Timer } from './Timer';
import { useTelegramSettings } from '@/hooks/useTelegramSettings';
import { telegramSendMessage } from '@/functions';

export const GlobalTimer = () => {
    const { isActive, stopTimer, restartToken } = useTimer();
    const { settings: telegramSettings } = useTelegramSettings();
    
    const handleComplete = () => {
        console.log('Timer ended - sending Telegram message');
        
        if (telegramSettings.chatId) {
            console.log('Timer ended - attempting to send Telegram message to chatId:', telegramSettings.chatId);
            telegramSendMessage({ 
                chatId: telegramSettings.chatId, 
                text: "🔥 המנוחה הסתיימה!\n💪 בוא נמשיך - סט הבא מחכה!" 
            })
            .then(() => console.log('Timer ended - Telegram message sent successfully'))
            .catch(err => console.error("Timer ended - Telegram error:", err))
            .finally(() => {
                stopTimer();
            });
        } else {
            console.log('Timer ended - no Telegram chatId configured, skipping Telegram message');
            stopTimer();
        }
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
