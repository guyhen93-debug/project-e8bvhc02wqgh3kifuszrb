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
    Clock,
    Flame,
    Target,
    TrendingUp,
    Droplets,
    Moon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserProfile, NutritionLog, WorkoutLog, WeightLog, WaterLog, SleepLog } from '@/entities';
import { useNotifications } from '@/hooks/useNotifications';
import { normalizeNutritionLogs } from '@/lib/nutrition-utils';

interface StatusResult {
    ok: boolean;
    count?: number;
    message?: string;
    loading?: boolean;
}

const WeeklyTargetStatus = ({ label, value, target, onTrack, icon: Icon, subtitle }: any) => {
    let statusColor = "bg-white/5 text-muted-foreground border-white/10";
    let statusText = "אין מידע";

    if (value > 0 || (label === "יעד אימונים" && target > 0)) {
        if (onTrack) {
            statusColor = "bg-green-500/10 text-green-400 border-green-500/20";
            statusText = "במסלול";
        } else {
            statusColor = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            statusText = "טעון שיפור";
        }
    }

    return (
        <Card className="bg-oxygym-darkGrey border-oxygym-yellow/10">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-oxygym-dark rounded-lg text-oxygym-yellow shrink-0">
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-white text-sm truncate">{label}</h3>
                            <Badge variant="outline" className={`${statusColor} text-[10px] py-0 px-1.5 h-5 whitespace-nowrap`}>
                                {statusText}
                            </Badge>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-white">{value}</span>
                            <span className="text-xs text-muted-foreground">/ {target}</span>
                        </div>
                        {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{subtitle}</p>}
                        {(value > 0 || (label === "יעד אימונים" && target > 0)) && (
                            <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                                הצבע משקף אם אתה ביעד לפי הממוצע ב־7 הימים האחרונים.
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const Status = () => {
    // Dates for last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    const todayStr = today.toISOString().split('T')[0];
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const goalsStatus = useQuery({
        queryKey: ['goals-status-7d'],
        queryFn: async () => {
            const [profiles, workouts, nutrition, weights, waterLogs, sleepLogs] = await Promise.all([
                UserProfile.list(),
                WorkoutLog.query().gte('date', sevenDaysAgoStr).lte('date', todayStr).exec(),
                NutritionLog.query().gte('date', sevenDaysAgoStr).lte('date', todayStr).exec(),
                WeightLog.query().gte('date', sevenDaysAgoStr).lte('date', todayStr).exec(),
                WaterLog.query().gte('date', sevenDaysAgoStr).lte('date', todayStr).exec(),
                SleepLog.query().gte('date', sevenDaysAgoStr).lte('date', todayStr).exec()
            ]);

            const profile = profiles?.[0];
            const weeklyWorkoutTarget = profile?.weekly_workout_target ?? 3;
            const dailyCalorieTarget = profile?.daily_calorie_target ?? 2410;
            const dailyWaterTargetGlasses = profile?.daily_water_target_glasses ?? 12;

            const completedWorkouts = workouts.filter(w => w.completed).length;
            
            // Nutrition aggregation
            const nutritionByDate = nutrition.reduce((acc: any, log: any) => {
                if (!acc[log.date]) acc[log.date] = [];
                acc[log.date].push(log);
                return acc;
            }, {});

            let totalCals = 0;
            let activeDays = 0;
            Object.values(nutritionByDate).forEach((dayLogs: any) => {
                const normalized = normalizeNutritionLogs(dayLogs);
                const dayCals = normalized.reduce((sum, l) => sum + (l.total_calories || 0), 0);
                if (dayCals > 0) {
                    totalCals += dayCals;
                    activeDays++;
                }
            });

            const avgCalories = activeDays > 0 ? Math.round(totalCals / activeDays) : 0;

            // Water aggregation
            const waterByDate = waterLogs.reduce((acc: any, log: any) => {
                acc[log.date] = (acc[log.date] || 0) + (log.glasses || 0);
                return acc;
            }, {});
            
            let totalWater = 0;
            let waterDays = 0;
            Object.values(waterByDate).forEach((glasses: any) => {
                if (glasses > 0) {
                    totalWater += glasses;
                    waterDays++;
                }
            });
            const avgWater = waterDays > 0 ? Math.round(totalWater / waterDays) : 0;

            // Sleep aggregation
            const sleepByDate = sleepLogs.reduce((acc: any, log: any) => {
                acc[log.date] = (acc[log.date] || 0) + (log.hours || 0);
                return acc;
            }, {});
            
            let totalSleep = 0;
            let sleepDays = 0;
            Object.values(sleepByDate).forEach((hours: any) => {
                if (hours > 0) {
                    totalSleep += hours;
                    sleepDays++;
                }
            });
            const avgSleep = sleepDays > 0 ? totalSleep / sleepDays : 0;

            const SLEEP_MIN = 7;
            const SLEEP_MAX = 9;
            
            return {
                workouts: {
                    value: completedWorkouts,
                    target: weeklyWorkoutTarget,
                    onTrack: completedWorkouts >= weeklyWorkoutTarget
                },
                calories: {
                    value: avgCalories,
                    target: dailyCalorieTarget,
                    onTrack: avgCalories >= dailyCalorieTarget * 0.85 && avgCalories <= dailyCalorieTarget * 1.15
                },
                water: {
                    value: avgWater,
                    target: dailyWaterTargetGlasses,
                    onTrack: avgWater >= dailyWaterTargetGlasses
                },
                sleep: {
                    value: avgSleep ? Number(avgSleep.toFixed(1)) : 0,
                    target: 8,
                    onTrack: avgSleep >= SLEEP_MIN && avgSleep <= SLEEP_MAX
                },
                weight: {
                    count: weights.length,
                    hasData: weights.length > 0
                }
            };
        }
    });

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

                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-1">
                        <Target className="w-5 h-5 text-oxygym-yellow" />
                        <h2 className="text-xl font-bold text-white">סטטוס יעדים – 7 ימים אחרונים</h2>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                        הסיכום מתבסס על 7 הימים האחרונים בלבד. ירוק = ביעד, צהוב = צריך שיפור, אפור = עדיין אין מספיק נתונים.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {goalsStatus.isLoading ? (
                            <>
                                <div className="h-24 bg-oxygym-darkGrey/50 animate-pulse rounded-xl border border-white/5" />
                                <div className="h-24 bg-oxygym-darkGrey/50 animate-pulse rounded-xl border border-white/5" />
                                <div className="h-24 bg-oxygym-darkGrey/50 animate-pulse rounded-xl border border-white/5" />
                                <div className="h-24 bg-oxygym-darkGrey/50 animate-pulse rounded-xl border border-white/5" />
                            </>
                        ) : (
                            <>
                                <WeeklyTargetStatus 
                                    label="יעד אימונים"
                                    icon={Dumbbell}
                                    value={goalsStatus.data?.workouts.value || 0}
                                    target={goalsStatus.data?.workouts.target || 0}
                                    onTrack={goalsStatus.data?.workouts.onTrack}
                                />
                                <WeeklyTargetStatus 
                                    label="יעד קלוריות"
                                    icon={Flame}
                                    value={goalsStatus.data?.calories.value || 0}
                                    target={goalsStatus.data?.calories.target || 0}
                                    onTrack={goalsStatus.data?.calories.onTrack}
                                    subtitle="ממוצע יומי (מימים שדווחו)"
                                />
                                <WeeklyTargetStatus
                                    label="יעד מים"
                                    icon={Droplets}
                                    value={goalsStatus.data?.water.value || 0}
                                    target={goalsStatus.data?.water.target || 0}
                                    onTrack={goalsStatus.data?.water.onTrack}
                                    subtitle="ממוצע כוסות ביום (מימים שדווחו)"
                                />
                                <WeeklyTargetStatus
                                    label="יעד שינה"
                                    icon={Moon}
                                    value={goalsStatus.data?.sleep.value || 0}
                                    target={goalsStatus.data?.sleep.target || 0}
                                    onTrack={goalsStatus.data?.sleep.onTrack}
                                    subtitle="שעות בממוצע ללילה"
                                />
                            </>
                        )}
                    </div>
                    
                    {!goalsStatus.isLoading && goalsStatus.data && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-oxygym-darkGrey/30 py-2 rounded-lg border border-dashed border-white/5">
                            <Scale className="w-3.5 h-3.5" />
                            <span>
                                {goalsStatus.data.weight.hasData 
                                    ? `בוצעו ${goalsStatus.data.weight.count} שקילות בשבוע האחרון` 
                                    : "טרם בוצעו שקילות בשבוע האחרון"}
                            </span>
                        </div>
                    )}
                    <p className="mt-4 text-[11px] text-muted-foreground text-center">
                        לרזולוציה יומית מפורטת (אימונים, תזונה, מים ושינה) אפשר להיכנס למסך "לוח שנה".
                    </p>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-5 h-5 text-oxygym-yellow" />
                    <h2 className="text-xl font-bold text-white">בדיקת תקינות נתונים</h2>
                </div>

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
