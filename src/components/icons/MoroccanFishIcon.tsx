interface IconProps {
    className?: string;
}

export const MoroccanFishIcon = ({ className }: IconProps) => {
    return (
        <div className={`${className} flex items-center justify-center`}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* קערת טאג'ין - בסיס */}
                <ellipse cx="50" cy="70" rx="35" ry="8" fill="#8B4513" stroke="#654321" strokeWidth="2"/>
                <path d="M 15 70 Q 15 65 20 62 L 80 62 Q 85 65 85 70 Z" fill="#D2691E" stroke="#654321" strokeWidth="2"/>
                
                {/* מכסה טאג'ין חרוטי */}
                <path d="M 25 62 L 50 20 L 75 62 Z" fill="#CD853F" stroke="#8B4513" strokeWidth="2"/>
                <circle cx="50" cy="20" r="4" fill="#FFD700" stroke="#DAA520" strokeWidth="1.5"/>
                
                {/* קישוטים על המכסה */}
                <path d="M 40 45 Q 50 42 60 45" stroke="#8B4513" strokeWidth="1.5" fill="none"/>
                <path d="M 35 52 Q 50 48 65 52" stroke="#8B4513" strokeWidth="1.5" fill="none"/>
                
                {/* דג בתוך הקערה (נראה דרך חלון דמיוני) */}
                <ellipse cx="50" cy="65" rx="18" ry="6" fill="#FFB6C1" opacity="0.4"/>
                <ellipse cx="45" cy="65" rx="12" ry="4" fill="#FFC0CB" opacity="0.5"/>
                
                {/* קווי אדים */}
                <path d="M 35 25 Q 32 20 35 15" stroke="#B0C4DE" strokeWidth="1.5" fill="none" opacity="0.6"/>
                <path d="M 50 15 Q 48 10 50 5" stroke="#B0C4DE" strokeWidth="1.5" fill="none" opacity="0.6"/>
                <path d="M 65 25 Q 68 20 65 15" stroke="#B0C4DE" strokeWidth="1.5" fill="none" opacity="0.6"/>
            </svg>
        </div>
    );
};