import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, CheckCircle2, Lightbulb, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeeklyReportInsightsProps {
    summary: string | null;
    achievements?: string[];
    recommendations?: string[];
    isLoading?: boolean;
    hasData: boolean;
}

export const WeeklyReportInsights = ({
    summary,
    achievements = [],
    recommendations = [],
    isLoading = false,
    hasData
}: WeeklyReportInsightsProps) => {
    if (isLoading) {
        return (
            <Card className="bg-oxygym-darkGrey border-oxygym-yellow/10 mb-8 overflow-hidden">
                <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-8 h-8 text-oxygym-yellow animate-spin" />
                    <p className="text-sm text-muted-foreground animate-pulse">מפיק דוח שבועי חכם...</p>
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
                        אין מספיק נתונים ליצירת דוח חכם לשבוע זה עדיין. המשך לתעד את האימונים והתזונה שלך!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-oxygym-darkGrey border-oxygym-yellow/20 mb-8 overflow-hidden shadow-xl shadow-black/40">
            <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-black text-white">
                    <Sparkles className="w-5 h-5 text-oxygym-yellow" />
                    דוח שבועי חכם
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {summary && (
                    <div className="bg-white/5 rounded-xl p-4 border-r-4 border-oxygym-yellow">
                        <p className="text-white font-bold leading-relaxed">{summary}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Achievements Section */}
                    {achievements.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-green-400 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                הישגים השבוע
                            </h4>
                            <ul className="space-y-2">
                                {achievements.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-white/90">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Recommendations Section */}
                    {recommendations.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-oxygym-yellow flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                המלצות להמשך
                            </h4>
                            <ul className="space-y-2">
                                {recommendations.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-white/90">
                                        <div className="w-1.5 h-1.5 rounded-full bg-oxygym-yellow mt-1.5 shrink-0" />
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
