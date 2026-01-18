import { Card, CardContent } from '@/components/ui/card';
import { Trophy, TrendingUp, Target } from 'lucide-react';

interface WeeklySummaryHeaderProps {
    weekLabel: string;
    workoutsDone: number;
    workoutTarget: number;
    completionLevel: 'low' | 'medium' | 'high';
    statusColor?: 'green' | 'yellow' | 'red';
}

export const WeeklySummaryHeader = ({
    weekLabel,
    workoutsDone,
    workoutTarget,
    completionLevel,
    statusColor
}: WeeklySummaryHeaderProps) => {
    const getStatusInfo = () => {
        switch (statusColor) {
            case 'green':
                return { 
                    text: 'שבוע ירוק – אתה מאוד קרוב ליעד', 
                    bg: 'bg-green-500/20', 
                    dot: 'bg-green-400' 
                };
            case 'yellow':
                return { 
                    text: 'שבוע צהוב – באמצע, אפשר לשפר מעט', 
                    bg: 'bg-yellow-500/20', 
                    dot: 'bg-yellow-400' 
                };
            case 'red':
                return { 
                    text: 'שבוע אדום – שווה לתת פוש השבוע', 
                    bg: 'bg-red-500/20', 
                    dot: 'bg-red-400' 
                };
            default:
                return null;
        }
    };

    const statusInfo = getStatusInfo();
    const getMessage = () => {
        switch (completionLevel) {
            case 'high':
                return 'שבוע אש! אתה בשיא הכוח, תמשיך ככה!';
            case 'medium':
                return 'בדרך הנכונה! עוד קצת מאמץ ואתה שם.';
            case 'low':
            default:
                return 'בוא ננצח את השבוע - כל יום הוא הזדמנות חדשה!';
        }
    };

    const getIcon = () => {
        switch (completionLevel) {
            case 'high':
                return <Trophy className="w-6 h-6 text-oxygym-yellow" />;
            case 'medium':
                return <TrendingUp className="w-6 h-6 text-oxygym-yellow" />;
            case 'low':
            default:
                return <Target className="w-6 h-6 text-oxygym-yellow" />;
        }
    };

    return (
        <Card className="bg-oxygym-darkGrey border-oxygym-yellow/20 overflow-hidden mb-6">
            <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">{weekLabel}</p>
                        <h2 className="text-2xl font-black text-white mb-2 leading-tight">סיכום שבועי</h2>
                        
                        {statusInfo && (
                            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full ${statusInfo.bg} mb-3`}>
                                <div className={`w-2 h-2 rounded-full ${statusInfo.dot} animate-pulse`} />
                                <span className="text-[10px] font-bold text-white/90">{statusInfo.text}</span>
                            </div>
                        )}

                        <p className="text-sm text-white/90 font-medium">{getMessage()}</p>
                        
                        <div className="mt-4 flex items-center gap-2">
                            <div className="flex -space-x-1 space-x-reverse">
                                {[...Array(workoutTarget)].map((_, i) => (
                                    <div 
                                        key={i}
                                        className={`w-3 h-3 rounded-full border border-black ${
                                            i < workoutsDone ? 'bg-oxygym-yellow' : 'bg-white/10'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-muted-foreground mr-2">
                                {workoutsDone} מתוך {workoutTarget} אימונים הושלמו
                            </span>
                        </div>
                    </div>
                    <div className="p-3 bg-oxygym-dark rounded-xl border border-oxygym-yellow/10">
                        {getIcon()}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
