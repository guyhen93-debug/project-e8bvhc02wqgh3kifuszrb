import { createContext, useContext, useState, ReactNode } from 'react';

interface DateContextType {
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    isToday: boolean;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export const DateProvider = ({ children }: { children: ReactNode }) => {
    const getTodayString = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
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