import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramSettings } from '@/hooks/useTelegramSettings';
import { telegramSendMessage } from '@/functions';

interface NotificationSettings {
    mealReminders: boolean;
    weighInReminder: boolean;
    lastScheduled: string | null;
    weighInLastScheduled: string | null;
}

// Meal reminder times (24h format)
const MEAL_TIMES = [
    { id: 1, hour: 10, minute: 0, meal: 'ארוחה 1' },
    { id: 2, hour: 12, minute: 30, meal: 'ארוחה 2' },
    { id: 3, hour: 15, minute: 30, meal: 'ארוחה 3' },
    { id: 4, hour: 22, minute: 0, meal: 'ארוחה 4' },
];

// Weigh-in reminder (Thursday at 06:30)
const WEIGH_IN_TIME = { day: 4, hour: 6, minute: 30 }; // 4 = Thursday

const STORAGE_KEY = 'oxygym-notification-settings';
const TELEGRAM_MEAL_KEY_PREFIX = 'oxygym-telegram-meal-';
const TELEGRAM_WEIGHIN_KEY = 'oxygym-telegram-weighin-last-date';

const getMealMessage = (id: number): string => {
    switch (id) {
        case 1:
            return "🍳 זמן ארוחה 1!\n\n• 4 פרוסות לחם כוסמין\n• 100גר' גבינה לבנה סימפוניה (עד 5%)\n• 2 ביצים\n• 200גר' ירקות\n\n💧 זכור לשתות מים!";
        case 2:
            return "💪 זמן ארוחה 2!\n\n• 2 כפות גיינר עם מים";
        case 3:
            return "💪 זמן ארוחה 3!\n\n• 2 כפות גיינר עם מים";
        case 4:
            return "🍗 זמן ארוחה 4!\n\n• 150גר' חזה עוף\n• 80גר' אורז (שקילה לפני בישול)\n• 200גר' ירקות";
        default:
            return "🍽️ זמן ארוחה!";
    }
};

const WEIGH_IN_MESSAGE = "⏰ זמן שקילה שבועית!\n\nזכור:\n• לפני אוכל\n• אחרי שירותים\n• בלי בגדים\n\nשלח לי את המשקל החדש!";

export const useNotifications = () => {
    const { toast } = useToast();
    const { settings: telegramSettings } = useTelegramSettings();
    const [settings, setSettings] = useState<NotificationSettings>({
        mealReminders: false,
        weighInReminder: false,
        lastScheduled: null,
        weighInLastScheduled: null,
    });
    
    // Constant values since we only use Telegram now
    const isSupported = true;
    const permission: 'default' | 'granted' | 'denied' = 'granted';

    // Load settings from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem(STORAGE_KEY);
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                // Migrate old settings format
                if (typeof parsed.enabled !== 'undefined') {
                    setSettings({
                        mealReminders: parsed.enabled,
                        weighInReminder: false,
                        lastScheduled: parsed.lastScheduled,
                        weighInLastScheduled: null,
                    });
                } else {
                    setSettings(parsed);
                }
            } catch (error) {
                console.error('Failed to load notification settings:', error);
            }
        }
    }, []);

    // Save settings to localStorage
    const saveSettings = useCallback((newSettings: NotificationSettings) => {
        setSettings(newSettings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    }, []);

    // Request permission (no-op now)
    const requestPermission = useCallback(async () => {
        toast({
            title: '✅ תזכורות טלגרם',
            description: 'התזכורות יעבדו דרך טלגרם בלבד',
        });
        return true;
    }, [toast]);

    // Toggle meal notifications
    const toggleMealNotifications = useCallback(async (enabled: boolean) => {
        saveSettings({ ...settings, mealReminders: enabled });
        if (enabled) {
            toast({
                title: '✅ תזכורות ארוחות הופעלו',
                description: 'תקבל תזכורות לארוחות בטלגרם בשעות הקבועות',
            });
        } else {
            toast({
                title: '🔕 תזכורות ארוחות כובו',
                description: 'לא תקבל עוד תזכורות לארוחות בטלגרם',
            });
        }
        return true;
    }, [saveSettings, settings, toast]);

    // Toggle weigh-in notification
    const toggleWeighInNotification = useCallback(async (enabled: boolean) => {
        saveSettings({ ...settings, weighInReminder: enabled });
        if (enabled) {
            toast({
                title: '✅ תזכורת שקילה הופעלה',
                description: 'תקבל תזכורת בטלגרם כל יום חמישי ב-06:30',
            });
        } else {
            toast({
                title: '🔕 תזכורת שקילה כובתה',
                description: 'לא תקבל עוד תזכורות שקילה בטלגרם',
            });
        }
        return true;
    }, [saveSettings, settings, toast]);

    // Telegram notification polling
    useEffect(() => {
        const token = localStorage.getItem('telegram_token');
        const chatId = localStorage.getItem('telegram_chat_id');

        const intervalId = setInterval(() => {
            // Timer check
            const timerEndTime = localStorage.getItem('timer_end_time');
            if (timerEndTime) {
                const endTime = parseInt(timerEndTime);
                const nowMs = Date.now();

                if (nowMs >= endTime) {
                    console.log('[Telegram] Timer ended via scheduled check');
                    if (token && chatId) {
                        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                chat_id: chatId,
                                text: "🔥 המנוחה הסתיימה!\n💪 בוא נמשיך - סט הבא מחכה!"
                            })
                        }).catch(err => console.error('Timer end message failed:', err));
                    }
                    localStorage.removeItem('timer_end_time');
                }
            }

            if (!token || !chatId || (!settings.mealReminders && !settings.weighInReminder)) {
                return;
            }

            console.log('[Telegram] Interval tick - checking reminders');
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const currentMinutes = now.getHours() * 60 + now.getMinutes();

            // Handle Meal Reminders
            if (settings.mealReminders) {
                MEAL_TIMES.forEach(meal => {
                    const targetMinutes = meal.hour * 60 + meal.minute;
                    if (currentMinutes === targetMinutes) {
                        const key = `${TELEGRAM_MEAL_KEY_PREFIX}${meal.id}`;
                        const lastDate = localStorage.getItem(key);
                        if (lastDate !== todayStr) {
                            console.log('[Telegram] Sending meal reminder', meal.id, 'for date', todayStr, 'to chatId', chatId);
                            localStorage.setItem(key, todayStr);
                            telegramSendMessage({ 
                                chatId: chatId, 
                                text: getMealMessage(meal.id) 
                            }).catch(err => console.error('Failed to send Telegram meal reminder:', err));
                        }
                    }
                });
            }

            // Handle Weigh-in Reminder
            if (settings.weighInReminder) {
                if (now.getDay() === WEIGH_IN_TIME.day && currentMinutes === (WEIGH_IN_TIME.hour * 60 + WEIGH_IN_TIME.minute)) {
                    const lastDate = localStorage.getItem(TELEGRAM_WEIGHIN_KEY);
                    if (lastDate !== todayStr) {
                        console.log('[Telegram] Sending weigh-in reminder for date', todayStr, 'to chatId', chatId);
                        localStorage.setItem(TELEGRAM_WEIGHIN_KEY, todayStr);
                        telegramSendMessage({ 
                            chatId: chatId, 
                            text: WEIGH_IN_MESSAGE 
                        }).catch(err => console.error('Failed to send Telegram weigh-in reminder:', err));
                    }
                }
            }
        }, 60000); // Check every minute

        return () => clearInterval(intervalId);
    }, [settings.mealReminders, settings.weighInReminder, telegramSettings.chatId]);

    return {
        isSupported,
        permission,
        settings,
        toggleMealNotifications,
        toggleWeighInNotification,
        requestPermission,
    };
};
