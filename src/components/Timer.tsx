import { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';

// Silent audio hack for background performance on iOS
const SILENT_AUDIO_SRC = "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA";

interface TimerProps {
    isActive: boolean;
    onComplete?: () => void;
    restartToken?: number;
}

export const Timer = ({ isActive, onComplete, restartToken }: TimerProps) => {
    const [remainingSeconds, setRemainingSeconds] = useState(90);
    const targetTimeRef = useRef<number | null>(null);
    const notificationTimeoutRef = useRef<number | null>(null);
    const hasFiredRef = useRef(false);
    const silentAudioRef = useRef<HTMLAudioElement | null>(null);
    const isAudioSupportedRef = useRef(true);

    const ensureSilentAudio = () => {
        if (!isAudioSupportedRef.current) return null;

        if (!silentAudioRef.current) {
            try {
                const audio = new Audio(SILENT_AUDIO_SRC);
                audio.loop = true;
                audio.volume = 0.01;
                silentAudioRef.current = audio;
            } catch (err) {
                console.warn('Silent audio initialization failed, skipping background trick:', err);
                isAudioSupportedRef.current = false;
                return null;
            }
        }
        return silentAudioRef.current;
    };

    const playSound = () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };

    const requestNotificationPermission = async () => {
        if ("Notification" in window && Notification.permission === "default") {
            try {
                await Notification.requestPermission();
            } catch (error) {
                console.error('Error requesting notification permission:', error);
            }
        }
    };

    useEffect(() => {
        if (isActive && isAudioSupportedRef.current) {
            requestNotificationPermission();
            
            // Start silent audio to keep the app alive in background on iOS
            // Some browsers/devices may block this background trick; we handle it gracefully.
            const audio = ensureSilentAudio();
            if (audio && typeof audio.play === 'function') {
                audio.play().catch(err => {
                    // NotSupportedError means the device doesn't like our base64 trick
                    // NotAllowedError means the user needs to interact first (common on mobile)
                    if (err?.name === 'NotSupportedError' || err?.name === 'NotAllowedError') {
                        console.warn('Background audio trick is not supported/allowed on this device, skipping:', err.name);
                        isAudioSupportedRef.current = false;
                    } else {
                        console.error('Failed to play silent audio', err);
                    }
                });
            }
        } else {
            // Stop silent audio when timer is not active
            if (silentAudioRef.current) {
                try {
                    silentAudioRef.current.pause();
                    silentAudioRef.current.currentTime = 0;
                } catch (e) {
                    // Ignore errors during cleanup
                }
            }
        }
    }, [isActive]);

    useEffect(() => {
        if (!isActive) {
            setRemainingSeconds(90);
            targetTimeRef.current = null;
            hasFiredRef.current = false;
            if (notificationTimeoutRef.current) {
                window.clearTimeout(notificationTimeoutRef.current);
                notificationTimeoutRef.current = null;
            }
            return;
        }

        // Reset state when isActive or restartToken changes
        setRemainingSeconds(90);
        targetTimeRef.current = Date.now() + 90000;
        hasFiredRef.current = false;
        
        if (notificationTimeoutRef.current) {
            window.clearTimeout(notificationTimeoutRef.current);
            notificationTimeoutRef.current = null;
        }

        // Schedule notification
        if ("Notification" in window && Notification.permission === "granted") {
            notificationTimeoutRef.current = window.setTimeout(() => {
                if (isActive && !hasFiredRef.current) {
                    try {
                        new Notification("הזמן עבר! 🔔", { 
                            body: "זמן להתחיל את הסט הבא.",
                        });
                    } catch (e) {
                        console.error("Failed to show notification", e);
                    }
                }
            }, 90000);
        }

        const interval = setInterval(() => {
            if (!targetTimeRef.current) return;

            const msLeft = targetTimeRef.current - Date.now();
            const secondsLeft = Math.ceil(msLeft / 1000);

            if (secondsLeft <= 0) {
                setRemainingSeconds(0);
                clearInterval(interval);
                
                // Stop silent audio when timer finishes
                if (silentAudioRef.current) {
                    try {
                        silentAudioRef.current.pause();
                        silentAudioRef.current.currentTime = 0;
                    } catch (e) {
                        // Ignore cleanup errors
                    }
                }
                
                if (!hasFiredRef.current) {
                    hasFiredRef.current = true;
                    playSound();
                    onComplete?.();
                }
            } else {
                setRemainingSeconds(Math.max(0, secondsLeft));
            }
        }, 100);

        return () => {
            clearInterval(interval);
            if (notificationTimeoutRef.current) {
                window.clearTimeout(notificationTimeoutRef.current);
            }
            // Cleanup: stop silent audio if component unmounts while timer is running
            if (silentAudioRef.current) {
                try {
                    silentAudioRef.current.pause();
                    silentAudioRef.current.currentTime = 0;
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
        };
    }, [isActive, restartToken, onComplete]);

    if (!isActive) return null;

    const minutes = Math.floor(remainingSeconds / 60);
    const displaySeconds = remainingSeconds % 60;

    return (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-oxygym-yellow text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50 animate-pulse">
            <Clock className="w-5 h-5" />
            <span className="text-xl font-bold">
                {minutes}:{displaySeconds.toString().padStart(2, '0')}
            </span>
        </div>
    );
};
