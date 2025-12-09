import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Apple, Calendar } from 'lucide-react';

export const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { id: 'home', icon: Home, label: 'בית', path: '/' },
        { id: 'workouts', icon: Dumbbell, label: 'אימונים', path: '/workouts' },
        { id: 'nutrition', icon: Apple, label: 'תזונה', path: '/nutrition' },
        { id: 'calendar', icon: Calendar, label: 'לוח שנה', path: '/calendar' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-oxygym-darkGrey border-t border-border z-50">
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = tab.id === 'workouts' 
                        ? location.pathname === tab.path || location.pathname.startsWith('/workout-')
                        : location.pathname === tab.path;
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                                isActive 
                                    ? 'text-oxygym-yellow' 
                                    : 'text-muted-foreground hover:text-white'
                            }`}
                        >
                            <Icon className={`w-6 h-6 mb-1 ${isActive ? 'scale-110' : ''}`} />
                            <span className="text-xs font-medium">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};