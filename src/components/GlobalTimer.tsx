import { useTimer } from '@/contexts/TimerContext';
import { Timer } from './Timer';
import { useTelegramSettings } from '@/hooks/useTelegramSettings';
import { telegramSendMessage } from '@/functions';

export const GlobalTimer = () => {
    const { isActive, stopTimer, restartToken } = useTimer();
    const { settings: telegramSettings } = useTelegramSettings();
    
    const handleComplete = () => {
        console.log('Timer ended - sending Telegram message');
        
        const token = localStorage.getItem('telegram_token');
        const chatId = localStorage.getItem('telegram_chat_id');
        
        if (token && chatId) {
            console.log('Timer ended - attempting to send Telegram message to chatId:', chatId);
            telegramSendMessage({ 
                chatId: chatId, 
                text: "🔥 המנוחה הסתיימה!\n💪 בוא נמשיך - סט הבא מחכה!" 
            })
            .then(() => console.log('Timer ended - Telegram message sent successfully'))
            .catch(err => console.error("Timer ended - Telegram error:", err))
            .finally(() => {
                stopTimer();
            });
        } else {
            console.log('Timer ended - missing telegram_token or telegram_chat_id in localStorage, skipping Telegram message');
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
