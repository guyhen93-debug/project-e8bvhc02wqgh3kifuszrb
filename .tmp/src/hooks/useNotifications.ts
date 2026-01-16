import { useCallback } from 'react';

export const useNotifications = () => {
    const isSupported = false;
    const permission = 'denied';
    const settings = {
        mealReminders: false,
        weighInReminder: false,
        lastScheduled: null,
        weighInLastScheduled: null,
    };

    const requestPermission = useCallback(async () => false, []);
    const toggleMealNotifications = useCallback(async () => false, []);
    const toggleWeighInNotification = useCallback(async () => false, []);

    return {
        isSupported,
        permission,
        settings,
        toggleMealNotifications,
        toggleWeighInNotification,
        requestPermission,
    };
};
