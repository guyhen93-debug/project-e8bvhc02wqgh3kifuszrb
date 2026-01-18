import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    CheckCircle2, 
    AlertTriangle, 
    XCircle, 
    Loader2, 
    User as UserIcon, 
    Utensils, 
    Dumbbell,
    ShieldCheck,
    Scale,
    Bell,
    Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserProfile, NutritionLog, WorkoutLog, WeightLog } from '@/entities';
import { useNotifications } from '@/hooks/useNotifications';

interface StatusResult {
    ok: boolean;
    count?: number;
    message?: string;
    loading?: boolean;
}

const Status = () => {
    const profileCheck = useQuery({
        queryKey: ['status-profile-check'],
        queryFn: async () => {
            try {
                const logs = await UserProfile.list();
                return { ok: true, count: logs.length };
            } catch (error) {
                console.error('Status profile check failed:', error);
                return { ok: false, message: 'שגיאה בגישה לנתוני פרופיל' };
            }
        },
    });

    const nutritionCheck = useQuery({
        queryKey: ['status-nutrition-check'],
        queryFn: async () => {
            try {
                const logs = await NutritionLog.list();
                return { ok: true, count: logs.length };
            } catch (error) {
                console.error('Status nutrition check failed:', error);
                return { ok: false, message: 'שגיאה בגישה לנתוני תזונה' };
            }
        },
    });

    const workoutCheck = useQuery({
        queryKey: ['status-workout-check'],
        queryFn: async () => {
            try {
                const logs = await WorkoutLog.list();
                return { ok: true, count: logs.length };
            } catch (error) {
                console.error('Status workout check failed:', error);
                return { ok: false, message: 'שגיאה בגישה לנתוני אימונים' };
            }
        },
    });

    const weightCheck = useQuery({
        queryKey: ['status-weight-check'],
        queryFn: async () => {
            try {
                const logs = await WeightLog.list();
                return { ok: true, count: logs.length };
            } catch (error) {
                console.error('Status weight check failed:', error);
                return { ok: false, message: 'שגיאה בגישה לנתוני משקל' };
            }
        },
    });

    const isAnyLoading = profileCheck.isLoading || nutritionCheck.isLoading || workoutCheck.isLoading || weightCheck.isLoading;
    const { settings } = useNotifications();

    const StatusIndicator = ({ result, label, icon: Icon }: { result: StatusResult, label: string, icon: any }) => {
        let statusColor = "bg-red-500/10 text-red-500 border-red-500/20";
        let statusText = "תקלה";
        let StatusIcon = XCircle;

        if (result.loading) {
            statusColor = "bg-blue-500/10 text-blue-500 border-blue-500/20";
            statusText = "בודק...";
            StatusIcon = Loader2;
        } else if (result.ok) {
            if (result.count === 0) {
                statusColor = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                statusText = "לא נמצא מידע";
                StatusIcon = AlertTriangle;
            } else {
                statusColor = "bg-green-500/10 text-green-500 border-green-500/20";
                statusText = "תקין";
                StatusIcon = CheckCircle2;
            }
        }

        return (
            <Card className="bg-oxygym-darkGrey border-oxygym-yellow/10 overflow-hidden transition-all hover:border-oxygym-yellow/30">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-oxygym-dark rounded-lg text-oxygym-yellow">
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm sm:text-base">{label}</h3>
                                {result.ok && result.count !== undefined && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        נמצאו {result.count} רשומות
                                    </p>
                                )}
                                {result.message && (
                                    <p className="text-xs text-red-400 mt-0.5">{result.message}</p>
                                )}
                            </div>
                        </div>
                        <Badge variant="outline" className={`${statusColor} flex items-center gap-1.5 py-1 px-2.5`}>
                            <StatusIcon className={`w-3.5 h-3.5 ${result.loading ? 'animate-spin' : ''}`} />
                            <span className="text-xs font-medium">{statusText}</span>
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-oxygym-dark pb-24 text-white font-sans" dir="rtl">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-oxygym-yellow/10 rounded-full flex items-center justify-center mb-4 border border-oxygym-yellow/20">
                        <ShieldCheck className="w-8 h-8 text-oxygym-yellow" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">סטטוס מערכת</h1>
                    <p className="text-muted-foreground text-center max-w-xs">
                        בדיקת תקינות רכיבי האפליקציה וחיבור למסדי הנתונים
                    </p>
                </div>

                {isAnyLoading && (
                    <div className="flex items-center justify-center gap-2 mb-6 animate-pulse text-oxygym-yellow bg-oxygym-yellow/5 py-2 rounded-full border border-oxygym-yellow/10">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">בודק חיבורים...</span>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                    <StatusIndicator 
                        label="פרופיל משתמש" 
                        icon={UserIcon}
                        result={{
                            ok: !!profileCheck.data?.ok,
                            count: profileCheck.data?.count,
                            message: profileCheck.data?.message,
                            loading: profileCheck.isLoading
                        }}
                    />
                    <StatusIndicator 
                        label="נתוני תזונה" 
                        icon={Utensils}
                        result={{
                            ok: !!nutritionCheck.data?.ok,
                            count: nutritionCheck.data?.count,
                            message: nutritionCheck.data?.message,
                            loading: nutritionCheck.isLoading
                        }}
                    />
                    <StatusIndicator 
                        label="נתוני אימונים" 
                        icon={Dumbbell}
                        result={{
                            ok: !!workoutCheck.data?.ok,
                            count: workoutCheck.data?.count,
                            message: workoutCheck.data?.message,
                            loading: workoutCheck.isLoading
                        }}
                    />
                    <StatusIndicator 
                        label="נתוני משקל" 
                        icon={Scale}
                        result={{
                            ok: !!weightCheck.data?.ok,
                            count: weightCheck.data?.count,
                            message: weightCheck.data?.message,
                            loading: weightCheck.isLoading
                        }}
                    />
                </div>

                <div className="mt-12">
                    <Card className="bg-oxygym-darkGrey/50 border-dashed border-white/10">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm text-muted-foreground font-medium">מידע נוסף</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2 text-xs text-muted-foreground leading-relaxed">
                            <p>• דף זה נועד לשימוש טכני בלבד.</p>
                            <p>• הבדיקות מתבצעות מול שירותי הענן של האפליקציה.</p>
                            <p>• במקרה של תקלה מתמשכת, מומלץ לנקות מטמון ולנסות שוב.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Status;
