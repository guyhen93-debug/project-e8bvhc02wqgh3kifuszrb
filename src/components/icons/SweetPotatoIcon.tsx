interface IconProps {
    className?: string;
}

export const SweetPotatoIcon = ({ className }: IconProps) => {
    return (
        <div className={`${className} flex items-center justify-center`}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <ellipse cx="50" cy="55" rx="30" ry="25" fill="#CD853F" stroke="#8B4513" strokeWidth="2"/>
                <ellipse cx="45" cy="50" rx="5" ry="3" fill="#A0522D"/>
                <ellipse cx="55" cy="53" rx="4" ry="2" fill="#A0522D"/>
                <ellipse cx="50" cy="60" rx="4" ry="2" fill="#A0522D"/>
            </svg>
        </div>
    );
};