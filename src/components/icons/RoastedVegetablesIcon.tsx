interface IconProps {
    className?: string;
}

export const RoastedVegetablesIcon = ({ className }: IconProps) => {
    return (
        <div className={`${className} flex items-center justify-center`}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* מגש תנור */}
                <rect x="15" y="45" width="70" height="40" rx="3" fill="#8B8B8B" stroke="#4A4A4A" strokeWidth="2"/>
                <rect x="18" y="48" width="64" height="34" fill="#D3D3D3"/>
                
                {/* ירקות צבעוניים במגש */}
                {/* גזר כתום */}
                <ellipse cx="30" cy="60" rx="8" ry="12" fill="#FF8C00" stroke="#D2691E" strokeWidth="1.5"/>
                <ellipse cx="28" cy="60" rx="6" ry="10" fill="#FFA500" opacity="0.7"/>
                
                {/* פלפל אדום */}
                <ellipse cx="48" cy="58" rx="10" ry="8" fill="#DC143C" stroke="#8B0000" strokeWidth="1.5"/>
                <ellipse cx="46" cy="58" rx="7" ry="6" fill="#FF6347" opacity="0.6"/>
                
                {/* בצל סגול */}
                <circle cx="65" cy="62" r="9" fill="#9370DB" stroke="#663399" strokeWidth="1.5"/>
                <circle cx="63" cy="62" r="6" fill="#BA55D3" opacity="0.5"/>
                
                {/* ברוקולי ירוק */}
                <ellipse cx="38" cy="72" rx="7" ry="6" fill="#228B22" stroke="#006400" strokeWidth="1.5"/>
                <circle cx="36" cy="70" r="3" fill="#32CD32" opacity="0.7"/>
                <circle cx="40" cy="71" r="2.5" fill="#32CD32" opacity="0.7"/>
                
                {/* קישוא ירוק בהיר */}
                <ellipse cx="58" cy="70" rx="11" ry="6" fill="#9ACD32" stroke="#6B8E23" strokeWidth="1.5"/>
                <ellipse cx="56" cy="70" rx="8" ry="4" fill="#ADFF2F" opacity="0.5"/>
                
                {/* קווי צליה */}
                <line x1="28" y1="56" x2="32" y2="64" stroke="#654321" strokeWidth="1" opacity="0.6"/>
                <line x1="46" y1="54" x2="50" y2="62" stroke="#654321" strokeWidth="1" opacity="0.6"/>
                <line x1="63" y1="58" x2="67" y2="66" stroke="#654321" strokeWidth="1" opacity="0.6"/>
            </svg>
        </div>
    );
};