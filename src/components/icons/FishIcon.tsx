interface IconProps {
    className?: string;
}

export const FishIcon = ({ className }: IconProps) => {
    return (
        <div className={`${className} flex items-center justify-center`}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <ellipse cx="50" cy="50" rx="35" ry="20" fill="#87CEEB" stroke="#4682B4" strokeWidth="2"/>
                <circle cx="35" cy="45" r="3" fill="#000"/>
                <path d="M 15 50 L 5 40 L 10 50 L 5 60 Z" fill="#87CEEB" stroke="#4682B4" strokeWidth="2"/>
                <path d="M 82 45 L 90 35 L 95 50 L 90 65 Z" fill="#87CEEB" stroke="#4682B4" strokeWidth="2"/>
            </svg>
        </div>
    );
};