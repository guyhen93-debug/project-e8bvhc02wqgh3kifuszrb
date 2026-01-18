import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    Dumbbell, 
    Flame, 
    Droplets, 
    Moon, 
    TrendingDown, 
    Info,
    Loader2
} from 'lucide-react';
import { WorkoutLog, NutritionLog, WaterLog, SleepLog, WeightLog, UserProfile } from '@/entities';
import { getStartOfWeek, formatDateHebrew } from '@/lib/date-utils';
import { normalizeNutritionLogs } from '@/lib/nutrition-utils';
import { WeeklySummaryHeader } from '@/components/dashboard/WeeklySummaryHeader';
import { WeeklyStatCard } from '@/components/dashboard/WeeklyStatCard';
import { WeeklyProgressCharts } from '@/components/dashboard/WeeklyProgressCharts';
import { WeeklyReportInsights } from '@/components/dashboard/WeeklyReportInsights';
import { MonthlyProgressCard } from '@/components/dashboard/MonthlyProgressCard';
import { generateWeeklyReport, analyzeProgress } from '@/functions';

const DAILY_CALORIE_TARGET = 2410;
const DAILY_PROTEIN_TARGET = 145;
const WORKOUT_TARGET = 3;

const Dashboard = () => {
    const startOfWeekStr = useMemo(() => getStartOfWeek(), []);
    const endOfWeekDate = new Date(startOfWeekStr);
    endOfWeekDate.setDate(endOfWeekDate.getDate() + 6);
    const endOfWeekStr = endOfWeekDate.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    const thirtyDaysAgoDate = new Date();
    thirtyDaysAgoDate.setDate(thirtyDaysAgoDate.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgoDate.toISOString().split('T')[0];

    const weekLabel = `${formatDateHebrew(startOfWeekStr)} - ${formatDateHebrew(endOfWeekStr)}`;

    const { data: monthlyRawData } = useQuery({
        queryKey: ['monthly-progress-raw', thirtyDaysAgoStr],
        queryFn: async () => {
            const [workouts30, nutrition30, weights30, profiles] = await Promise.all([
                WorkoutLog.query().gte('date', thirtyDaysAgoStr).lte('date', todayStr).exec(),
                NutritionLog.query().gte('date', thirtyDaysAgoStr).lte('date', todayStr).exec(),
                WeightLog.query().gte('date', thirtyDaysAgoStr).lte('date', todayStr).exec(),
                UserProfile.list()
            ]);
            return { workouts30, nutrition30, weights30, profile: profiles?.[0] };
        },
    });

    const { data: monthlyReport, isLoading: isMonthlyLoading } = useQuery({
        queryKey: ['monthly-progress-analysis', thirtyDaysAgoStr],
        queryFn: async () => {
            if (!monthlyRawData) return null;
            
            let userGoal = 'maintain';
            if (monthlyRawData.profile?.goal === 'חיטוב') userGoal = 'lose';
            else if (monthlyRawData.profile?.goal === 'מסה') userGoal = 'gain';

            try {
                return await analyzeProgress({
                    workoutData: monthlyRawData.workouts30,
                    nutritionData: normalizeNutritionLogs(monthlyRawData.nutrition30),
                    weightData: monthlyRawData.weights30,
                    userGoal,
                    targetCalories: DAILY_CALORIE_TARGET,
                });
            } catch (error) {
                console.error('Error analyzing 30-day progress:', error);
                return null;
            }
        },
        enabled: !!monthlyRawData,
    });

    const hasMonthlyData = useMemo(() => {
        if (!monthlyRawData) return false;
        return (monthlyRawData.workouts30?.length || 0) > 0 || 
               (monthlyRawData.nutrition30?.length || 0) > 0 || 
               (monthlyRawData.weights30?.length || 0) > 1;
    }, [monthlyRawData]);

    const { data: logs, isLoading } = useQuery({
        queryKey: ['weekly-dashboard-data', startOfWeekStr],
        queryFn: async () => {
            const [workouts, nutrition, water, sleep, weights] = await Promise.all([
                WorkoutLog.query().gte('date', startOfWeekStr).lte('date', todayStr).exec(),
                NutritionLog.query().gte('date', startOfWeekStr).lte('date', todayStr).exec(),
                WaterLog.query().gte('date', startOfWeekStr).lte('date', todayStr).exec(),
                SleepLog.query().gte('date', startOfWeekStr).lte('date', todayStr).exec(),
                WeightLog.query().sort('-date').limit(10).exec() // Get recent weights for context
            ]);

            return { workouts, nutrition, water, sleep, weights };
        },
    });

    const weeklyStats = useMemo(() => {
        if (!logs) return null;

        const days = [];
        let totalCals = 0;
        let totalProtein = 0;
        let totalWorkouts = 0;
        let totalSleep = 0;
        let totalWater = 0;
        let daysWithData = 0;

        const dayLabels = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeekStr);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            if (dateStr > todayStr) continue;

            // Nutrition
            const dayNutrition = logs.nutrition.filter(l => l.date === dateStr);
            const normalized = normalizeNutritionLogs(dayNutrition);
            const dayCals = normalized.reduce((sum, l) => sum + (l.total_calories || 0), 0);
            const dayProtein = normalized.reduce((sum, l) => sum + (l.protein || 0), 0);

            // Workouts
            const dayWorkouts = logs.workouts.filter(l => l.date === dateStr && l.completed).length;
            
            // Water
            const dayWater = logs.water.find(l => l.date === dateStr)?.glasses || 0;
            
            // Sleep
            const daySleep = logs.sleep.find(l => l.date === dateStr)?.hours || 0;

            days.push({
                date: dateStr,
                label: dayLabels[i],
                calories: dayCals,
                calorieTarget: DAILY_CALORIE_TARGET,
                workouts: dayWorkouts,
                waterGlasses: dayWater,
                sleepHours: daySleep
            });

            if (dayCals > 0 || dayWorkouts > 0 || dayWater > 0 || daySleep > 0) {
                totalCals += dayCals;
                totalProtein += dayProtein;
                totalWorkouts += dayWorkouts;
                totalSleep += daySleep;
                totalWater += dayWater;
                daysWithData++;
            }
        }

        const avgCals = daysWithData > 0 ? Math.round(totalCals / daysWithData) : 0;
        const avgProtein = daysWithData > 0 ? Math.round(totalProtein / daysWithData) : 0;
        const avgSleep = daysWithData > 0 ? (totalSleep / daysWithData).toFixed(1) : '0';

        // Weight delta
        let weightDelta = null;
        if (logs.weights && logs.weights.length >= 2) {
            const latest = logs.weights[0].weight;
            const previous = logs.weights[logs.weights.length - 1].weight;
            weightDelta = (latest - previous).toFixed(1);
        }

        const completionScore = (totalWorkouts / WORKOUT_TARGET) * 0.5 + (avgCals / DAILY_CALORIE_TARGET) * 0.5;
        let completionLevel: 'low' | 'medium' | 'high' = 'low';
        if (completionScore > 0.85) completionLevel = 'high';
        else if (completionScore > 0.5) completionLevel = 'medium';

        return {
            days,
            totalWorkouts,
            avgCals,
            avgProtein,
            avgSleep,
            totalWater,
            weightDelta,
            completionLevel
        };
    }, [logs, startOfWeekStr, todayStr]);

    const { data: report, isLoading: isReportLoading } = useQuery({
        queryKey: ['weekly-report', startOfWeekStr],
        queryFn: async () => {
            if (!logs) return null;
            try {
                return await generateWeeklyReport({
                    workouts: logs.workouts,
                    nutrition: normalizeNutritionLogs(logs.nutrition),
                    weights: logs.weights,
                    targetCalories: DAILY_CALORIE_TARGET
                });
            } catch (error) {
                console.error('Error generating weekly report:', error);
                return null;
            }
        },
        enabled: !!logs,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-oxygym-dark flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-oxygym-yellow animate-spin" />
            </div>
        );
    }

    if (!weeklyStats) return null;

    return (
        <div className="min-h-screen bg-oxygym-dark pb-24 font-sans" dir="rtl">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <WeeklySummaryHeader 
                    weekLabel={weekLabel}
                    workoutsDone={weeklyStats.totalWorkouts}
                    workoutTarget={WORKOUT_TARGET}
                    completionLevel={weeklyStats.completionLevel}
                />

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <WeeklyStatCard 
                        icon={Dumbbell}
                        label="אימונים"
                        value={`${weeklyStats.totalWorkouts}/${WORKOUT_TARGET}`}
                        subtitle="השבוע"
                        accentColorClass="text-blue-400"
                    />
                    <WeeklyStatCard 
                        icon={Flame}
                        label="ממוצע קלוריות"
                        value={`${weeklyStats.avgCals}`}
                        subtitle="ביום"
                        accentColorClass="text-oxygym-yellow"
                    />
                    <WeeklyStatCard 
                        icon={Moon}
                        label="ממוצע שינה"
                        value={`${weeklyStats.avgSleep}ש'`}
                        subtitle="ביום"
                        accentColorClass="text-purple-400"
                    />
                    <WeeklyStatCard 
                        icon={TrendingDown}
                        label="שינוי משקל"
                        value={weeklyStats.weightDelta ? `${weeklyStats.weightDelta} ק"ג` : '--'}
                        subtitle="מול תחילת מעקב"
                        accentColorClass="text-green-400"
                    />
                </div>

                <div className="mb-8">
                    <h3 className="text-white font-black text-xl mb-4">גרפים ומגמות</h3>
                    <WeeklyProgressCharts days={weeklyStats.days} />
                </div>

                <MonthlyProgressCard
                    overallScore={monthlyReport?.overallScore ?? null}
                    consistency={monthlyReport?.consistency}
                    performance={monthlyReport?.performance}
                    progress={monthlyReport?.progress}
                    insights={monthlyReport?.insights ?? []}
                    actionItems={monthlyReport?.actionItems ?? []}
                    motivationalMessage={monthlyReport?.motivationalMessage ?? null}
                    isLoading={isMonthlyLoading}
                    hasData={hasMonthlyData}
                />

                <WeeklyReportInsights 
                    summary={report?.summary ?? null}
                    achievements={report?.achievements ?? []}
                    recommendations={report?.recommendations ?? []}
                    isLoading={isReportLoading}
                    hasData={weeklyStats.totalWorkouts > 0 || weeklyStats.avgCals > 0}
                />

                <div className="bg-oxygym-darkGrey/50 border border-white/5 rounded-xl p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        הנתונים מתבססים על הימים שכבר עברו השבוע וסומנו ביומן. הממוצעים מחושבים לפי ימים עם פעילות בלבד.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
