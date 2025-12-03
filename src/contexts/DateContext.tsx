import { createContext, useContext, useState, ReactNode } from 'react';

interface DateContextType {
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    isToday: boolean;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export const DateProvider = ({ children }: { children: ReactNode }) => {
    const getTodayString = () => new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

    const isToday = selectedDate === getTodayString();

    return (
        <DateContext.Provider value={{ selectedDate, setSelectedDate, isToday }}>
            {children}
        </DateContext.Provider>
    );
};

export const useDate = () => {
    const context = useContext(DateContext);
    if (!context) {
        throw new Error('useDate must be used within DateProvider');
    }
    return context;
};