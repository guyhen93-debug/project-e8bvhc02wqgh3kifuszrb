interface IconProps {
    className?: string;
}

export const ChallaIcon = ({ className }: IconProps) => {
    return (
        <div className={`${className} flex items-center justify-center`}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* חלה קלועה עם זהב חום */}
                <ellipse cx="50" cy="55" rx="32" ry="18" fill="#D2691E" stroke="#8B4513" strokeWidth="2"/>
                <ellipse cx="35" cy="50" rx="18" ry="10" fill="#CD853F" stroke="#8B4513" strokeWidth="1.5"/>
                <ellipse cx="65" cy="50" rx="18" ry="10" fill="#CD853F" stroke="#8B4513" strokeWidth="1.5"/>
                <ellipse cx="50" cy="45" rx="15" ry="8" fill="#DEB887" stroke="#8B4513" strokeWidth="1.5"/>
                
                {/* שכבות קלועות */}
                <path d="M 32 50 Q 40 48 50 50" stroke="#A0522D" strokeWidth="1.5" fill="none"/>
                <path d="M 50 50 Q 60 48 68 50" stroke="#A0522D" strokeWidth="1.5" fill="none"/>
                <path d="M 38 55 Q 45 53 52 55" stroke="#A0522D" strokeWidth="1.5" fill="none"/>
                <path d="M 52 55 Q 58 53 64 55" stroke="#A0522D" strokeWidth="1.5" fill="none"/>
                
                {/* גרגירי שומשום */}
                <circle cx="42" cy="48" r="1.5" fill="#F5DEB3"/>
                <circle cx="48" cy="46" r="1.5" fill="#F5DEB3"/>
                <circle cx="54" cy="47" r="1.5" fill="#F5DEB3"/>
                <circle cx="60" cy="49" r="1.5" fill="#F5DEB3"/>
                <circle cx="45" cy="52" r="1.5" fill="#F5DEB3"/>
                <circle cx="55" cy="53" r="1.5" fill="#F5DEB3"/>
                <circle cx="38" cy="53" r="1.5" fill="#F5DEB3"/>
                <circle cx="62" cy="52" r="1.5" fill="#F5DEB3"/>
            </svg>
        </div>
    );
};