interface IconProps {
    className?: string;
}

export const BulgurSaladIcon = ({ className }: IconProps) => {
    return (
        <div className={`${className} flex items-center justify-center`}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* קערה */}
                <ellipse cx="50" cy="75" rx="38" ry="10" fill="#E8E8E8" stroke="#C0C0C0" strokeWidth="2"/>
                <path d="M 12 75 Q 12 60 18 50 L 82 50 Q 88 60 88 75 Z" fill="#F5F5F5" stroke="#C0C0C0" strokeWidth="2"/>
                
                {/* בורגול (גרגירים חומים-זהובים) */}
                <ellipse cx="50" cy="58" rx="28" ry="12" fill="#DAA520"/>
                {/* גרגירים בודדים */}
                <circle cx="35" cy="56" r="2" fill="#B8860B"/>
                <circle cx="42" cy="58" r="2" fill="#CD853F"/>
                <circle cx="48" cy="55" r="2" fill="#D2B48C"/>
                <circle cx="55" cy="59" r="2" fill="#B8860B"/>
                <circle cx="62" cy="57" r="2" fill="#CD853F"/>
                <circle cx="45" cy="61" r="2" fill="#DAA520"/>
                <circle cx="58" cy="61" r="2" fill="#D2B48C"/>
                <circle cx="52" cy="62" r="2" fill="#B8860B"/>
                
                {/* עגבניות שרי אדומות */}
                <circle cx="32" cy="53" r="4" fill="#FF6347" stroke="#DC143C" strokeWidth="1"/>
                <circle cx="68" cy="54" r="4" fill="#FF6347" stroke="#DC143C" strokeWidth="1"/>
                <circle cx="42" cy="52" r="3.5" fill="#FF4500" stroke="#DC143C" strokeWidth="1"/>
                
                {/* מלפפון - פרוסות ירוקות */}
                <ellipse cx="38" cy="58" rx="3.5" ry="2.5" fill="#90EE90" stroke="#228B22" strokeWidth="1"/>
                <ellipse cx="60" cy="59" rx="3.5" ry="2.5" fill="#90EE90" stroke="#228B22" strokeWidth="1"/>
                
                {/* פטרוזיליה/כוסברה ירוקה */}
                <circle cx="48" cy="50" r="2.5" fill="#228B22" opacity="0.8"/>
                <circle cx="52" cy="49" r="2" fill="#32CD32" opacity="0.8"/>
                <circle cx="56" cy="51" r="2.5" fill="#228B22" opacity="0.8"/>
                
                {/* בצל סגול */}
                <path d="M 44 54 Q 46 52 48 54" stroke="#9370DB" strokeWidth="1.5" fill="none"/>
                <path d="M 54 55 Q 56 53 58 55" stroke="#9370DB" strokeWidth="1.5" fill="none"/>
                
                {/* לימון - פרוסה */}
                <circle cx="28" cy="60" r="3" fill="#FFFF99" stroke="#FFD700" strokeWidth="1"/>
                <line x1="28" y1="57" x2="28" y2="63" stroke="#FFD700" strokeWidth="0.8"/>
                <line x1="25" y1="60" x2="31" y2="60" stroke="#FFD700" strokeWidth="0.8"/>
            </svg>
        </div>
    );
};