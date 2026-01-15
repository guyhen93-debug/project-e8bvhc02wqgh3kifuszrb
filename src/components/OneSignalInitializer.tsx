import { useEffect } from 'react';

export const OneSignalInitializer = () => {
    useEffect(() => {
        console.log('Push notifications via OneSignal are disabled in this app.');
    }, []);

    return null;
};
