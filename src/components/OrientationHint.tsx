import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

export const OrientationHint = () => {
    const [isLandscape, setIsLandscape] = useState(false);

    useEffect(() => {
        const checkOrientation = () => {
            // Only show on smaller screens (phones/tablets) in landscape
            const isLandscapeMode = window.innerWidth > window.innerHeight;
            const isMobileView = window.innerWidth < 1024;
            setIsLandscape(isLandscapeMode && isMobileView);
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        return () => window.removeEventListener('resize', checkOrientation);
    }, []);

    if (!isLandscape) return null;

    return (
        <div className="fixed bottom-24 right-4 left-4 z-[100] bg-black/90 text-white text-xs px-4 py-3 rounded-xl border border-white/10 flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 backdrop-blur-sm" dir="rtl">
            <div className="bg-oxygym-yellow/20 p-2 rounded-full shrink-0">
                <Info className="w-4 h-4 text-oxygym-yellow" />
            </div>
            <div className="flex-1">
                <p className="font-bold text-sm text-white mb-0.5">עדיף להשתמש באפליקציה לאורך</p>
                <p className="text-muted-foreground leading-snug">לא ניתן לנעול סיבוב בדפדפן, אבל ככה תראה את כל המסכים בצורה הטובה ביותר.</p>
            </div>
        </div>
    );
};
