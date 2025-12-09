export const FishIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <g>
                <path
                    d="M20 50C20 50 30 35 50 35C70 35 80 50 80 50C80 50 70 65 50 65C30 65 20 50 20 50Z"
                    fill="#FFE600"
                    stroke="#000000"
                    strokeWidth="2"
                />
                <path
                    d="M80 50C80 50 85 45 90 50C85 55 80 50 80 50Z"
                    fill="#FFE600"
                    stroke="#000000"
                    strokeWidth="2"
                />
                <circle cx="40" cy="45" r="3" fill="#000000" />
                <path
                    d="M35 50C35 50 40 52 45 50"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
                <path
                    d="M50 50C50 50 55 52 60 50"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
                <path
                    d="M30 48L25 45L20 50L25 55L30 52"
                    fill="#FFE600"
                    stroke="#000000"
                    strokeWidth="2"
                />
            </g>
        </svg>
    );
};