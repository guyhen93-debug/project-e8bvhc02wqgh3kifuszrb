import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Scale } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export const WeighInReminder = () => {
    const { settings, toggleWeighInNotification, isSupported } = useNotifications();

    const handleToggle = async (checked: boolean) => {
        await toggleWeighInNotification(checked);
    };

    if (!isSupported) {
        return null;
    }

    return (
        <Card className="bg-oxygym-darkGrey border-border">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Scale className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-medium">תזכורת שקילה שבועית</h3>
                            <p className="text-xs text-muted-foreground">יום חמישי ב-06:30</p>
                        </div>
                    </div>
                    <Switch
                        checked={settings.weighInReminder}
                        onCheckedChange={handleToggle}
                        className="data-[state=checked]:bg-oxygym-yellow"
                    />
                </div>
            </CardContent>
        </Card>
    );
};