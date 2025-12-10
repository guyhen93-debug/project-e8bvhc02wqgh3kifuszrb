import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
    enabled: boolean;
    lastScheduled: string | null;
}

// Meal reminder times (24h format)
const MEAL_TIMES = [
    { hour: 10, minute: 0, meal: 'ארוחה 1' },
    { hour: 12, minute: 30, meal: 'ארוחה 2' },
    { hour: 15, minute: 30, meal: 'ארוחה 3' },
    { hour: 22, minute: 0, meal: 'ארוחה 4' },
];

const STORAGE_KEY = 'oxygym-notification-settings';

export const useNotifications = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState<NotificationSettings>({
        enabled: false,
        lastScheduled: null,
    });
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(false);

    // Check if notifications are supported
    useEffect(() => {
        const supported = 'Notification' in window && 'serviceWorker' in navigator;
        setIsSupported(supported);
        
        if (supported) {
            setPermission(Notification.permission);
        }

        // Load settings from localStorage
        const savedSettings = localStorage.getItem(STORAGE_KEY);
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
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

    // Register service worker
    const registerServiceWorker = useCallback(async () => {
        if (!('serviceWorker' in navigator)) {
            console.log('Service Workers not supported');
            return false;
        }

        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker registered:', registration);
            return true;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return false;
        }
    }, []);

    // Schedule daily notifications
    const scheduleDailyNotifications = useCallback(async () => {
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
                    scheduleDailyNotifications();
                }
            }, timeUntilNotification);

            console.log(`Scheduled ${mealTime.meal} notification in ${Math.round(timeUntilNotification / 1000 / 60)} minutes`);
        }

        saveSettings({
            enabled: true,
            lastScheduled: today,
        });
    }, [isSupported, permission, saveSettings]);

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
            // Register service worker first
            await registerServiceWorker();

            // Request permission
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                toast({
                    title: '✅ התזכורות הופעלו',
                    description: 'תקבל תזכורות לארוחות בשעות הקבועות',
                });
                await scheduleDailyNotifications();
                return true;
            } else if (result === 'denied') {
                toast({
                    title: '❌ ההרשאה נדחתה',
                    description: 'לא ניתן לשלוח התראות. שנה בהגדרות הדפדפן.',
                    variant: 'destructive',
                });
                saveSettings({ enabled: false, lastScheduled: null });
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
    }, [isSupported, registerServiceWorker, scheduleDailyNotifications, saveSettings, toast]);

    // Enable notifications
    const enableNotifications = useCallback(async () => {
        if (permission === 'granted') {
            await scheduleDailyNotifications();
            return true;
        } else {
            return await requestPermission();
        }
    }, [permission, scheduleDailyNotifications, requestPermission]);

    // Disable notifications
    const disableNotifications = useCallback(() => {
        saveSettings({ enabled: false, lastScheduled: null });
        toast({
            title: '🔕 התזכורות כובו',
            description: 'לא תקבל עוד תזכורות לארוחות',
        });
    }, [saveSettings, toast]);

    // Toggle notifications
    const toggleNotifications = useCallback(async (enabled: boolean) => {
        if (enabled) {
            return await enableNotifications();
        } else {
            disableNotifications();
            return true;
        }
    }, [enableNotifications, disableNotifications]);

    // Check if we need to reschedule (e.g., after app restart)
    useEffect(() => {
        if (settings.enabled && permission === 'granted') {
            const now = new Date();
            const lastScheduled = settings.lastScheduled ? new Date(settings.lastScheduled) : null;
            
            // If not scheduled today, reschedule
            if (!lastScheduled || lastScheduled.toDateString() !== now.toDateString()) {
                scheduleDailyNotifications();
            }
        }
    }, [settings.enabled, settings.lastScheduled, permission, scheduleDailyNotifications]);

    return {
        isSupported,
        permission,
        settings,
        toggleNotifications,
        enableNotifications,
        disableNotifications,
    };
};