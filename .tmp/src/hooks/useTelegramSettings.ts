import { useState, useEffect, useCallback } from 'react';

export interface TelegramSettings {
    chatId: string;
    token: string;
}

const TELEGRAM_SETTINGS_KEY = 'oxygym-telegram-settings';

export const useTelegramSettings = () => {
    const [settings, setSettings] = useState<TelegramSettings>({
        chatId: '',
        token: '',
    });

    useEffect(() => {
        const saved = localStorage.getItem(TELEGRAM_SETTINGS_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === 'object') {
                    setSettings({
                        chatId: parsed.chatId || '',
                        token: parsed.token || '',
                    });
                }
            } catch (error) {
                console.error('Failed to parse telegram settings:', error);
            }
        }
    }, []);

    const updateSettings = useCallback((partial: Partial<TelegramSettings>) => {
        setSettings(prev => {
            const next = { ...prev, ...partial };
            localStorage.setItem(TELEGRAM_SETTINGS_KEY, JSON.stringify(next));
            localStorage.setItem('telegram_chat_id', next.chatId || '');
            localStorage.setItem('telegram_token', next.token || '');
            return next;
        });
    }, []);

    const setChatId = useCallback((chatId: string) => {
        updateSettings({ chatId });
    }, [updateSettings]);

    const setToken = useCallback((token: string) => {
        updateSettings({ token });
    }, [updateSettings]);

    return {
        settings,
        setChatId,
        setToken,
        updateSettings
    };
};
