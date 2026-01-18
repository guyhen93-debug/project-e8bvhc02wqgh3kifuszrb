import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge, CheckCircle2, Lightbulb, Loader2, AlertCircle, Target, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface MonthlyProgressCardProps {
    overallScore: number | null;
    consistency?: {
        workoutConsistency: number;
        nutritionConsistency: number;
        score: number;
    };
    performance?: {
        workoutCompletion: number;
        calorieAdherence: number;
        proteinIntake: number;
        score: number;
    };
    progress?: {
        weightTrend: string;
        avgWeeklyChange: number | null;
        score: number;
    };
    insights?: string[];
    actionItems?: string[];
    motivationalMessage?: string | null;
    isLoading?: boolean;
    hasData: boolean;
}

export const MonthlyProgressCard = ({
    overallScore,
    consistency,
    performance,
    progress,
    insights = [],
    actionItems = [],
    motivationalMessage,
    isLoading = false,
    hasData
}: MonthlyProgressCardProps) => {
    if (isLoading) {
        return (
            <Card className="bg-oxygym-darkGrey border-oxygym-yellow/10 mb-8 overflow-hidden">
                <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-8 h-8 text-oxygym-yellow animate-spin" />
                    <p className="text-sm text-muted-foreground animate-pulse">מנתח התקדמות ב-30 הימים האחרונים...</p>
                </CardContent>
            </Card>
        );
    }

    if (!hasData) {
        return (
            <Card className="bg-oxygym-darkGrey border-oxygym-yellow/10 mb-8">
                <CardContent className="p-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                        אין מספיק נתונים ל-30 הימים האחרונים עדיין. המשך לתעד את האימונים והתזונה שלך כדי לקבל תובנות ארוכות טווח!
                    </p>
                </CardContent>
            </Card>
        );
    }

    const getScoreCategory = (score: number) => {
        if (score >= 90) return { label: 'מצוין', color: 'text-green-400' };
        if (score >= 75) return { label: 'טוב מאוד', color: 'text-oxygym-yellow' };
        if (score >= 60) return { label: 'טוב', color: 'text-blue-400' };
        return { label: 'דורש שיפור', color: 'text-red-400' };
    };

    const getWeightTrendLabel = (trend: string, change: number | null) => {
        const sign = (change || 0) > 0 ? '+' : '';
        const changeStr = change !== null ? ` (~${sign}${change} ק"ג בשבוע)` : '';
        
        switch (trend) {
            case 'on-track': return { label: `במסלול הנכון${changeStr}`, icon: TrendingUp, color: 'text-green-400' };
            case 'too-fast': return { label: `מהיר מדי${changeStr}`, icon: Zap, color: 'text-oxygym-yellow' };
            case 'too-slow': return { label: `איטי מהמצופה${changeStr}`, icon: Minus, color: 'text-blue-400' };
            case 'no-change': return { label: `ללא שינוי משמעותי`, icon: Minus, color: 'text-muted-foreground' };
            default: return { label: 'חסר מידע', icon: Minus, color: 'text-muted-foreground' };
        }
    };

    const scoreInfo = overallScore !== null ? getScoreCategory(overallScore) : null;
    const trendInfo = progress ? getWeightTrendLabel(progress.weightTrend, progress.avgWeeklyChange) : null;

    return (
        <Card className="bg-oxygym-darkGrey border-oxygym-yellow/20 mb-8 overflow-hidden shadow-2xl shadow-black/60">
            <CardHeader className="border-b border-white/5 pb-4 bg-white/5">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-black text-white">
                        <Gauge className="w-5 h-5 text-oxygym-yellow" />
                        התקדמות 30 ימים
                    </CardTitle>
                    {overallScore !== null && (
                        <div className="flex flex-col items-end">
                            <span className={cn("text-2xl font-black", scoreInfo?.color)}>
                                {overallScore}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                                {scoreInfo?.label}
                            </span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {/* Motivation message */}
                {motivationalMessage && (
                    <div className="bg-white/5 rounded-xl p-4 border-r-4 border-oxygym-yellow">
                        <p className="text-white font-bold leading-relaxed">{motivationalMessage}</p>
                    </div>
                )}

                {/* Main Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            מדדי ביצוע
                        </h4>
                        
                        <div className="space-y-3">
                            <MetricRow label="עקביות אימונים" value={consistency?.workoutConsistency ?? 0} />
                            <MetricRow label="עקביות תזונה" value={consistency?.nutritionConsistency ?? 0} />
                            <MetricRow label="עמידה ביעד קלורי" value={performance?.calorieAdherence ?? 0} />
                            <MetricRow label="צריכת חלבון" value={performance?.proteinIntake ?? 0} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            מגמת משקל
                        </h4>
                        
                        {trendInfo && (
                            <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
                                <div className={cn("p-2 rounded-full bg-white/5", trendInfo.color)}>
                                    <trendInfo.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{trendInfo.label}</p>
                                    <p className="text-xs text-muted-foreground">מבוסס על שקילות חודש אחרון</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Insights Section */}
                    {insights.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                תובנות חודשיות
                            </h4>
                            <ul className="space-y-2">
                                {insights.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-white/90 leading-snug">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Action Items Section */}
                    {actionItems.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-green-400 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                צעדים מומלצים
                            </h4>
                            <ul className="space-y-2">
                                {actionItems.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-white/90 leading-snug">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const MetricRow = ({ label, value }: { label: string; value: number }) => (
    <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
            <span className="text-white/70 font-medium">{label}</span>
            <span className="text-white font-bold">{Math.round(value)}%</span>
        </div>
        <Progress 
            value={value} 
            className="h-1.5 bg-white/10" 
            indicatorClassName={cn(
                "transition-all duration-500",
                value >= 80 ? "bg-green-500" : value >= 50 ? "bg-oxygym-yellow" : "bg-red-500"
            )}
        />
    </div>
);
