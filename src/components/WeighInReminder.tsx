import { useQuery } from '@tanstack/react-query';
import { Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { WeightLog } from '@/entities';

export const WeighInReminder = () => {
    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = new Date().getDay();

    // 4 is Thursday (0 is Sunday, 1 is Monday, ..., 4 is Thursday)
    if (dayOfWeek !== 4) return null;

    const { data, isLoading } = useQuery({
        queryKey: ['weigh-in-today', today],
        queryFn: async () => {
            try {
                const logs = await WeightLog.filter({ date: today });
                return logs || [];
            } catch (error) {
                console.error('Error fetching weigh-in for today:', error);
                return [];
            }
        },
    });

    if (isLoading) return null;

    const hasWeighInToday = data && data.length > 0;

    if (!hasWeighInToday) {
        return (
            <Card className="bg-oxygym-darkGrey border-amber-400/40 animate-in fade-in slide-in-from-top-2 duration-300">
                <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-amber-400/20 p-2.5 rounded-full mt-1 shrink-0">
                            <Scale className="w-6 h-6 text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-amber-400 text-lg">שקילה שבועית!</h3>
                                <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                            </div>
                            <p className="text-sm text-white leading-relaxed mb-2">
                                היום יום חמישי – יום השקילה הרשמי שלך. מומלץ לתעד את המשקל עכשיו.
                            </p>
                            <div className="text-[11px] text-muted-foreground bg-black/40 p-2 rounded-lg border border-white/5 italic">
                                💡 טיפ לדיוק מרבי: לפני אוכל וקפה, אחרי שירותים, ובלי בגדים.
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-emerald-500/10 border-emerald-500/30 animate-in fade-in zoom-in duration-300">
            <CardContent className="p-3">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/20 p-1.5 rounded-full shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-sm font-bold text-emerald-400">
                        השקילה השבועית כבר בוצעה היום. כל הכבוד על ההתמדה! 🏆
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
