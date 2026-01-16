import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
    mealReminders: boolean;
    weighInReminder: boolean;
    lastScheduled: string | null;
    weighInLastScheduled: string | null;
}

const STORAGE_KEY = 'oxygym-notification-settings';

export const useNotifications = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState<NotificationSettings>({
        mealReminders: false,
        weighInReminder: false,
        lastScheduled: null,
        weighInLastScheduled: null,
    });

    // Constant values for notification support
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
            title: '✅ תזכורות',
            description: 'התזכורות יעבדו דרך ntfy',
        });
        return true;
    }, [toast]);

    // Toggle meal notifications
    const toggleMealNotifications = useCallback(async (enabled: boolean) => {
        saveSettings({ ...settings, mealReminders: enabled });
        if (enabled) {
            toast({
                title: '✅ תזכורות ארוחות הופעלו',
                description: 'תקבל תזכורות לארוחות בשעות הקבועות',
            });
        } else {
            toast({
                title: '🔕 תזכורות ארוחות כובו',
                description: 'לא תקבל עוד תזכורות לארוחות',
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
                description: 'תקבל תזכורת כל יום חמישי ב-06:30',
            });
        } else {
            toast({
                title: '🔕 תזכורת שקילה כובתה',
                description: 'לא תקבל עוד תזכורות שקילה',
            });
        }
        return true;
    }, [saveSettings, settings, toast]);

    return {
        isSupported,
        permission,
        settings,
        toggleMealNotifications,
        toggleWeighInNotification,
        requestPermission,
    };
};
