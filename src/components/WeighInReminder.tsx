import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Scale } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export const WeighInReminder = () => {
    const { settings, toggleWeighInNotification, isSupported, permission } = useNotifications();

    const handleToggle = async (checked: boolean) => {
        await toggleWeighInNotification(checked);
    };

    const isDisabled = !isSupported || permission === 'denied';

    return (
        <Card className="bg-oxygym-darkGrey border-border">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-oxygym-yellow/10 rounded-lg">
                            <Scale className="w-5 h-5 text-oxygym-yellow" />
                        </div>
                        <div>
                            <h3 className="text-white font-medium">תזכורת שקילה שבועית</h3>
                            <p className="text-xs text-muted-foreground">יום חמישי ב-06:30</p>
                        </div>
                    </div>
                    <Switch
                        checked={settings.weighInReminder}
                        onCheckedChange={handleToggle}
                        disabled={isDisabled}
                        className="data-[state=checked]:bg-oxygym-yellow"
                    />
                </div>
                {!isSupported && (
                    <p className="text-[10px] text-muted-foreground mt-2 border-t border-border/50 pt-2">
                        הדפדפן שלך לא תומך בהתראות, אפשר להשתמש בכרטיס הזה רק כתזכורת ויזואלית.
                    </p>
                )}
                {isSupported && permission === 'denied' && (
                    <p className="text-[10px] text-red-400 mt-2 border-t border-border/50 pt-2">
                        התראות חסומות בדפדפן. כדי להפעיל, צריך לאפשר התראות בהגדרות הדפדפן ואז להדליק מחדש.
                    </p>
                )}
            </CardContent>
        </Card>
    );
};