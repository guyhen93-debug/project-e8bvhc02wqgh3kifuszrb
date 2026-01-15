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
            return "🍳 זמן ארוחה 1!\n\n- 4 פרוסות לחם כוסמין\n- 100גר' גבינה לבנה סימפוניה (עד 5%)\n- 2 ביצים\n- 200גר' ירקות\n\n💧 זכור לשתות מים!";
        case 2:
            return "💪 זמן ארוחה 2!\n\n- 2 כפות גיינר עם מים";
        case 3:
            return "💪 זמן ארוחה 3!\n\n- 2 כפות גיינר עם מים";
        case 4:
            return "🍗 זמן ארוחה 4!\n\n- 150גר' חזה עוף\n- 80גר' אורז (שקילה לפני בישול)\n- 200גר' ירקות";
        default:
            return "🍽️ זמן ארוחה!";
    }
};

const WEIGH_IN_MESSAGE = "⏰ זמן שקילה שבועית!\n\nזכור:\n- לפני אוכל\n- אחרי שירותים\n- בלי בגדים\n\nשלח לי את המשקל החדש!";

export const useNotifications = () => {
    const { toast } = useToast();
    const { settings: telegramSettings } = useTelegramSettings();
    const [settings, setSettings] = useState<NotificationSettings>({
        mealReminders: false,
        weighInReminder: false,
        lastScheduled: null,
        weighInLastScheduled: null,
    });
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(false);

    // Check if notifications are supported
    useEffect(() => {
        const supported = typeof window !== 'undefined' && 'Notification' in window;
        setIsSupported(supported);
        
        if (supported) {
            setPermission(Notification.permission);
        }

        // Load settings from localStorage
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

    // Sync notification status on window load
    useEffect(() => {
        const handleLoad = () => {
            if ('Notification' in window) {
                setIsSupported(true);
                setPermission(Notification.permission);
            } else {
                setIsSupported(false);
                setPermission('default');
            }
        };

        if (document.readyState === 'complete') {
            handleLoad();
        } else {
            window.addEventListener('load', handleLoad);
            return () => window.removeEventListener('load', handleLoad);
        }
    }, []);

    // Save settings to localStorage
    const saveSettings = useCallback((newSettings: NotificationSettings) => {
        setSettings(newSettings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    }, []);

    // Calculate next Thursday at 06:30
    const calculateNextThursday = useCallback(() => {
        const now = new Date();
        const thursdayTime = new Date();
        
        // Set to Thursday 06:30
        thursdayTime.setHours(WEIGH_IN_TIME.hour, WEIGH_IN_TIME.minute, 0, 0);
        
        const currentDay = now.getDay();
        const daysUntilThursday = (WEIGH_IN_TIME.day - currentDay + 7) % 7;
        
        // If today is Thursday but time hasn't passed yet
        if (currentDay === WEIGH_IN_TIME.day && now < thursdayTime) {
            // Use today
            return thursdayTime;
        }
        
        // If today is Thursday and time has passed, or it's another day
        if (daysUntilThursday === 0) {
            // Next Thursday (7 days from now)
            thursdayTime.setDate(thursdayTime.getDate() + 7);
        } else {
            // Add days until next Thursday
            thursdayTime.setDate(thursdayTime.getDate() + daysUntilThursday);
        }
        
        return thursdayTime;
    }, []);

    // Schedule weekly weigh-in notification
    const scheduleWeighInNotification = useCallback(() => {
        if (!isSupported || permission !== 'granted') {
            return;
        }

        const now = new Date();
        const nextThursday = calculateNextThursday();
        const timeUntilNotification = nextThursday.getTime() - now.getTime();

        console.log(`Scheduling weigh-in notification for ${nextThursday.toLocaleString('he-IL')}`);
        console.log(`Time until notification: ${Math.round(timeUntilNotification / 1000 / 60 / 60)} hours`);

        // Schedule the notification
        setTimeout(() => {
            if (Notification.permission === 'granted') {
                const notification = new Notification('יום שקילה! ⚖️', {
                    body: 'לפני אוכל/קפה, אחרי שירותים, בלי בגדים. לא לשכוח לעדכן!',
                    icon: 'https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/project-favicons/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb-8d04fe90-f5f4-47bc-bc85-6678dc2d65b4.png',
                    badge: 'https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/project-favicons/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb-8d04fe90-f5f4-47bc-bc85-6678dc2d65b4.png',
                    tag: 'weekly-weigh-in',
                    requireInteraction: true,
                    vibrate: [300, 200, 300],
                });

                notification.onclick = () => {
                    window.focus();
                    notification.close();
                    window.location.href = '/';
                };

                // Re-schedule for next week
                scheduleWeighInNotification();
            }
        }, timeUntilNotification);

        saveSettings({
            ...settings,
            weighInLastScheduled: now.toISOString(),
        });
    }, [isSupported, permission, calculateNextThursday, saveSettings, settings]);

    // Schedule daily meal notifications
    const scheduleMealNotifications = useCallback(async () => {
        if (!isSupported || permission !== 'granted') {
            return;
        }

        const now = new Date();
        const today = now.toDateString();

        // Schedule notifications for today and tomorrow
        for (const mealTime of MEAL_TIMES) {
            const notificationTime = new Date();
            notificationTime.setHours(mealTime.hour, mealTime.minute, 0, 0);

            // If time has passed today, schedule for tomorrow
            if (notificationTime <= now) {
                notificationTime.setDate(notificationTime.getDate() + 1);
            }

            const timeUntilNotification = notificationTime.getTime() - now.getTime();

            // Schedule the notification
            setTimeout(() => {
                if (Notification.permission === 'granted') {
                    const notification = new Notification('תזכורת תזונה - OXYGYM', {
                        body: `זמן למלא ${mealTime.meal}! 🍽️`,
                        icon: 'https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/project-favicons/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb-8d04fe90-f5f4-47bc-bc85-6678dc2d65b4.png',
                        badge: 'https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/project-favicons/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb-8d04fe90-f5f4-47bc-bc85-6678dc2d65b4.png',
                        tag: `meal-reminder-${mealTime.meal}`,
                        requireInteraction: false,
                        vibrate: [200, 100, 200],
                    });

                    notification.onclick = () => {
                        window.focus();
                        notification.close();
                        window.location.href = '/nutrition';
                    };

                    // Re-schedule for next day
                    scheduleMealNotifications();
                }
            }, timeUntilNotification);

            console.log(`Scheduled ${mealTime.meal} notification in ${Math.round(timeUntilNotification / 1000 / 60)} minutes`);
        }

        saveSettings({
            ...settings,
            lastScheduled: today,
        });
    }, [isSupported, permission, saveSettings, settings]);

    // Request notification permission
    const requestPermission = useCallback(async () => {
        if (!isSupported) {
            toast({
                title: '❌ לא נתמך',
                description: 'הדפדפן שלך לא תומך בהתראות',
                variant: 'destructive',
            });
            return false;
        }

        try {
            // Request permission
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                toast({
                    title: '✅ ההתראות הופעלו',
                    description: 'תקבל התראות בהתאם להגדרות',
                });
                
                // Schedule based on current settings
                if (settings.mealReminders) {
                    await scheduleMealNotifications();
                }
                if (settings.weighInReminder) {
                    scheduleWeighInNotification();
                }
                
                return true;
            } else if (result === 'denied') {
                toast({
                    title: '❌ ההרשאה נדחתה',
                    description: 'לא ניתן לשלוח התראות. שנה בהגדרות הדפדפן.',
                    variant: 'destructive',
                });
                saveSettings({ 
                    mealReminders: false, 
                    weighInReminder: false,
                    lastScheduled: null,
                    weighInLastScheduled: null,
                });
                return false;
            }
        } catch (error) {
            console.error('Failed to request permission:', error);
            toast({
                title: '❌ שגיאה',
                description: 'לא הצלחנו להפעיל התראות',
                variant: 'destructive',
            });
            return false;
        }
        return false;
    }, [isSupported, scheduleMealNotifications, scheduleWeighInNotification, saveSettings, toast, settings]);

    // Toggle meal notifications
    const toggleMealNotifications = useCallback(async (enabled: boolean) => {
        if (enabled) {
            if (permission === 'granted') {
                await scheduleMealNotifications();
                saveSettings({ ...settings, mealReminders: true });
                toast({
                    title: '✅ תזכורות ארוחות הופעלו',
                    description: 'תקבל תזכורות לארוחות בשעות הקבועות',
                });
                return true;
            } else {
                const granted = await requestPermission();
                if (granted) {
                    saveSettings({ ...settings, mealReminders: true });
                }
                return granted;
            }
        } else {
            saveSettings({ ...settings, mealReminders: false });
            toast({
                title: '🔕 תזכורות ארוחות כובו',
                description: 'לא תקבל עוד תזכורות לארוחות',
            });
            return true;
        }
    }, [permission, scheduleMealNotifications, requestPermission, saveSettings, settings, toast]);

    // Toggle weigh-in notification
    const toggleWeighInNotification = useCallback(async (enabled: boolean) => {
        if (enabled) {
            if (permission === 'granted') {
                scheduleWeighInNotification();
                saveSettings({ ...settings, weighInReminder: true });
                toast({
                    title: '✅ תזכורת שקילה הופעלה',
                    description: 'תקבל תזכורת כל יום חמישי ב-06:30',
                });
                return true;
            } else {
                const granted = await requestPermission();
                if (granted) {
                    saveSettings({ ...settings, weighInReminder: true });
                }
                return granted;
            }
        } else {
            saveSettings({ ...settings, weighInReminder: false });
            toast({
                title: '🔕 תזכורת שקילה כובתה',
                description: 'לא תקבל עוד תזכורות שקילה',
            });
            return true;
        }
    }, [permission, scheduleWeighInNotification, requestPermission, saveSettings, settings, toast]);

    // Check if we need to reschedule (e.g., after app restart)
    useEffect(() => {
        if (permission === 'granted') {
            // Reschedule meal notifications if enabled
            if (settings.mealReminders) {
                const now = new Date();
                const lastScheduled = settings.lastScheduled ? new Date(settings.lastScheduled) : null;
                
                if (!lastScheduled || lastScheduled.toDateString() !== now.toDateString()) {
                    scheduleMealNotifications();
                }
            }

            // Reschedule weigh-in notification if enabled
            if (settings.weighInReminder) {
                const now = new Date();
                const lastScheduled = settings.weighInLastScheduled ? new Date(settings.weighInLastScheduled) : null;
                const nextThursday = calculateNextThursday();
                
                // If last scheduled was more than a week ago, or never scheduled
                if (!lastScheduled || (now.getTime() - lastScheduled.getTime()) > 7 * 24 * 60 * 60 * 1000) {
                    scheduleWeighInNotification();
                }
            }
        }
    }, [settings.mealReminders, settings.weighInReminder, settings.lastScheduled, settings.weighInLastScheduled, permission, scheduleMealNotifications, scheduleWeighInNotification, calculateNextThursday]);

    // Telegram notification polling
    useEffect(() => {
        if (!telegramSettings.chatId || (!settings.mealReminders && !settings.weighInReminder)) {
            return;
        }

        const intervalId = setInterval(() => {
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
                            localStorage.setItem(key, todayStr);
                            telegramSendMessage({ 
                                chatId: telegramSettings.chatId, 
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
                        localStorage.setItem(TELEGRAM_WEIGHIN_KEY, todayStr);
                        telegramSendMessage({ 
                            chatId: telegramSettings.chatId, 
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