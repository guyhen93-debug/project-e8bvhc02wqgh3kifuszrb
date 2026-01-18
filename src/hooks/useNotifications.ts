import { useCallback, useState, useEffect } from 'react';

const MEAL_REMINDERS_KEY = 'oxygym_meal_reminders_enabled';
const WEIGHIN_REMINDER_KEY = 'oxygym_weighin_reminder_enabled';

export const useNotifications = () => {
    const [mealReminders, setMealReminders] = useState<boolean>(() => {
        const stored = localStorage.getItem(MEAL_REMINDERS_KEY);
        return stored === null ? true : stored === 'true';
    });

    const [weighInReminder, setWeighInReminder] = useState<boolean>(() => {
        const stored = localStorage.getItem(WEIGHIN_REMINDER_KEY);
        return stored === null ? true : stored === 'true';
    });

    useEffect(() => {
        localStorage.setItem(MEAL_REMINDERS_KEY, String(mealReminders));
    }, [mealReminders]);

    useEffect(() => {
        localStorage.setItem(WEIGHIN_REMINDER_KEY, String(weighInReminder));
    }, [weighInReminder]);

    const isSupported = true;
    const permission = 'granted';
    
    const settings = {
        mealReminders,
        weighInReminder,
        lastScheduled: null,
        weighInLastScheduled: null,
    };

    const requestPermission = useCallback(async () => true, []);

    const toggleMealNotifications = useCallback(async () => {
        setMealReminders(prev => !prev);
        return true;
    }, []);

    const toggleWeighInNotification = useCallback(async () => {
        setWeighInReminder(prev => !prev);
        return true;
    }, []);

    return {
        isSupported,
        permission,
        settings,
        toggleMealNotifications,
        toggleWeighInNotification,
        requestPermission,
    };
};
