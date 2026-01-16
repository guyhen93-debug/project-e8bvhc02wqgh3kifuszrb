import { useState, useEffect, useCallback } from 'react';

interface TelegramSettings {
    chatId: string;
    token: string;
}

export const useTelegramSettings = () => {
    const [settings, setSettings] = useState<TelegramSettings>({
        chatId: '',
        token: '',
    });

    useEffect(() => {
        const storedChatId = localStorage.getItem('telegram_chat_id') || '';
        const storedToken = localStorage.getItem('telegram_token') || '';
        setSettings({ chatId: storedChatId, token: storedToken });
    }, []);

    const setChatId = useCallback((newChatId: string) => {
        setSettings(prev => ({ ...prev, chatId: newChatId }));
        localStorage.setItem('telegram_chat_id', newChatId);
    }, []);

    const setToken = useCallback((newToken: string) => {
        setSettings(prev => ({ ...prev, token: newToken }));
        localStorage.setItem('telegram_token', newToken);
    }, []);

    return { settings, setChatId, setToken };
};
