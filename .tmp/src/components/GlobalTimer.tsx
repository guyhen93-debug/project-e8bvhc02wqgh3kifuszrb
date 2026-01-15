import { useTimer } from '@/contexts/TimerContext';
import { Timer } from './Timer';
import { telegramSendMessage } from '@/functions';

export const GlobalTimer = () => {
    const { isActive, stopTimer, restartToken } = useTimer();
    
    const handleComplete = () => {
        console.log('Timer ended - cleaning up and sending Telegram message');
        
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

    return (
        <Timer 
            isActive={isActive} 
            restartToken={restartToken}
            onComplete={handleComplete} 
        />
    );
};
