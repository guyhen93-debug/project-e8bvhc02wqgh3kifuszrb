interface IconProps {
    className?: string;
}

export const ChickenDrumstickIcon = ({ className }: IconProps) => {
    return (
        <div className={`${className} flex items-center justify-center`}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* שוק עוף 1 */}
                <ellipse cx="38" cy="50" rx="12" ry="20" fill="#DEB887" stroke="#D2691E" strokeWidth="2" transform="rotate(-25 38 50)"/>
                <ellipse cx="36" cy="50" rx="9" ry="16" fill="#F4A460" opacity="0.7" transform="rotate(-25 36 50)"/>
                {/* עצם */}
                <rect x="30" y="28" width="6" height="12" fill="#F5DEB3" stroke="#D2B48C" strokeWidth="1.5" rx="3" transform="rotate(-25 33 34)"/>
                <circle cx="30" cy="28" r="4" fill="#FAEBD7" stroke="#D2B48C" strokeWidth="1.5"/>
                <circle cx="32" cy="26" r="2.5" fill="#FFF8DC"/>
                
                {/* שוק עוף 2 - מעט מזווה אחרת */}
                <ellipse cx="62" cy="52" rx="12" ry="20" fill="#DEB887" stroke="#D2691E" strokeWidth="2" transform="rotate(15 62 52)"/>
                <ellipse cx="64" cy="52" rx="9" ry="16" fill="#F4A460" opacity="0.7" transform="rotate(15 64 52)"/>
                {/* עצם */}
                <rect x="64" y="30" width="6" height="12" fill="#F5DEB3" stroke="#D2B48C" strokeWidth="1.5" rx="3" transform="rotate(15 67 36)"/>
                <circle cx="68" cy="30" r="4" fill="#FAEBD7" stroke="#D2B48C" strokeWidth="1.5"/>
                <circle cx="70" cy="28" r="2.5" fill="#FFF8DC"/>
                
                {/* קווי גריל */}
                <line x1="32" y1="48" x2="44" y2="52" stroke="#8B4513" strokeWidth="1.2" opacity="0.5"/>
                <line x1="34" y1="54" x2="42" y2="58" stroke="#8B4513" strokeWidth="1.2" opacity="0.5"/>
                <line x1="58" y1="50" x2="66" y2="54" stroke="#8B4513" strokeWidth="1.2" opacity="0.5"/>
                <line x1="56" y1="56" x2="64" y2="60" stroke="#8B4513" strokeWidth="1.2" opacity="0.5"/>
            </svg>
        </div>
    );
};