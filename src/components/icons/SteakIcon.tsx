export const SteakIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <g>
                <ellipse
                    cx="50"
                    cy="50"
                    rx="30"
                    ry="25"
                    fill="#D2691E"
                    stroke="#000000"
                    strokeWidth="2"
                />
                <ellipse
                    cx="50"
                    cy="50"
                    rx="22"
                    ry="18"
                    fill="#8B4513"
                    opacity="0.4"
                />
                <path
                    d="M35 45C35 45 40 42 45 45"
                    stroke="#FFE600"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <path
                    d="M55 55C55 55 60 52 65 55"
                    stroke="#FFE600"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <path
                    d="M45 52C45 52 50 50 55 52"
                    stroke="#FFE600"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <path
                    d="M38 58L35 62"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
                <path
                    d="M62 42L65 38"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            </g>
        </svg>
    );
};