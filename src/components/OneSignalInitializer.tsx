import { useEffect } from 'react';
import OneSignal from 'react-onesignal';
import { PushSubscription } from '@/entities';

export const OneSignalInitializer = () => {
    useEffect(() => {
        const initOneSignal = async () => {
            if (typeof window === 'undefined') return;

            const ALLOWED_ORIGIN = 'https://e8bvhc02wqgh3kifuszrb.superdev.run';
            if (window.location.origin !== ALLOWED_ORIGIN && !window.location.hostname.includes('localhost')) {
                console.log('Skipping OneSignal init on unsupported origin:', window.location.origin);
                return;
            }

            try {
                await OneSignal.init({
                    appId: '765b6111-8550-4b51-8db8-c64cd97396f0',
                    allowLocalhostAsSecureOrigin: true,
                    notifyButton: {
                        enable: true,
                    },
                });

                // Show slidedown prompt after a short delay
                setTimeout(() => {
                    try {
                        OneSignal.showSlidedownPrompt();
                    } catch (err) {
                        console.error('Error showing OneSignal prompt:', err);
                    }
                }, 3000);

                OneSignal.on('subscriptionChange', async (isSubscribed: boolean) => {
                    try {
                        if (!isSubscribed) return;
                        
                        const playerId = await OneSignal.getUserId();
                        if (!playerId) return;

                        // Save to localStorage for quick access
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('onesignal_player_id', playerId);
                        }

                        // Persist to DB if not already stored
                        try {
                            const existing = await PushSubscription.filter({ player_id: playerId }, '-created_at', 1);
                            if (!existing || existing.length === 0) {
                                await PushSubscription.create({ 
                                    player_id: playerId, 
                                    platform: 'web' 
                                });
                                console.log('Stored new push subscription:', playerId);
                            }
                        } catch (err) {
                            console.error('Failed to store push subscription in DB:', err);
                        }
                    } catch (err) {
                        console.error('Error handling OneSignal subscription change:', err);
                    }
                });
            } catch (error) {
                console.error('Error initializing OneSignal:', error);
            }
        };

        initOneSignal();
    }, []);

    return null;
};
