import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Dumbbell, Utensils, Flame, Egg, Info, CheckCircle, LayoutDashboard, Bell, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/StatsCard';
import { WeightChart } from '@/components/WeightChart';
import { CalorieChart } from '@/components/CalorieChart';
import { WeightDialog } from '@/components/WeightDialog';
import { WeighInReminder } from '@/components/WeighInReminder';
import { SleepTracker } from '@/components/SleepTracker';
import { WaterTracker } from '@/components/WaterTracker';
import { DateSelector } from '@/components/DateSelector';
import { WorkoutLog, NutritionLog, WaterLog, UserProfile } from '@/entities';
import { useDate } from '@/contexts/DateContext';
import { useMemo } from 'react';
import { normalizeNutritionLogs } from '@/lib/nutrition-utils';
import { scheduleNtfyReminder } from '@/functions';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useNotifications';
import { Settings } from 'lucide-react';

const DEFAULT_DAILY_CALORIE_TARGET = 2410;
const DEFAULT_DAILY_PROTEIN_TARGET = 145;
const DEFAULT_DAILY_WATER_TARGET_GLASSES = 12;
const LAST_SYNC_KEY = 'oxygym_last_sync_date';

const Index = () => {
    const navigate = useNavigate();
    const { selectedDate, isToday } = useDate();
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isSyncingDay, setIsSyncingDay] = useState(false);
    const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);
    const [isSyncedToday, setIsSyncedToday] = useState(false);
    const { settings } = useNotifications();

    const { data: userProfile } = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const profiles = await UserProfile.list();
            return profiles?.[0] || null;
        }
    });

    const dailyCalorieTarget = userProfile?.daily_calorie_target ?? DEFAULT_DAILY_CALORIE_TARGET;
    const dailyProteinTarget = userProfile?.daily_protein_target ?? DEFAULT_DAILY_PROTEIN_TARGET;
    const dailyWaterTargetGlasses = userProfile?.daily_water_target_glasses ?? DEFAULT_DAILY_WATER_TARGET_GLASSES;
    const weeklyWorkoutTarget = userProfile?.weekly_workout_target ?? 3;

    const getDelaySecondsForToday = (hours: number, minutes: number) => {
        const now = new Date();
        const target = new Date();
        target.setHours(hours, minutes, 0, 0);
        const diffMs = target.getTime() - now.getTime();
        if (diffMs <= 0) return null; // skip past times
        return Math.round(diffMs / 1000);
    };

    const handleSyncDay = async () => {
        setIsSyncingDay(true);
        try {
            const reminders = [];
            
            if (settings.mealReminders) {
                reminders.push(
                    { hours: 10, minutes: 0, title: "ארוחה 1 🍳", message: "זמן לארוחת בוקר. לא לשכוח לסמן ביומן" },
                    { hours: 12, minutes: 30, title: "ארוחה 2 🥛", message: "זמן לגיינר. סמן ביומן כשסיימת" },
                    { hours: 15, minutes: 30, title: "ארוחה 3 🥛", message: "זמן לגיינר השני. נא לסמן ביומן" },
                    { hours: 21, minutes: 0, title: "ארוחה 4 🍗", message: "זמן לארוחת ערב. אל תשכח לסמן ביומן" }
                );
            }

            const now = new Date();
            const isThursday = now.getDay() === 4;
            if (isThursday && settings.weighInReminder) {
                reminders.push({ hours: 6, minutes: 30, title: "שקילה שבועית! ⚖️", message: "לפני אוכל וקפה, אחרי שירותים, בלי בגדים" });
            }

            const syncTasks = reminders
                .map(r => {
                    const delaySeconds = getDelaySecondsForToday(r.hours, r.minutes);
                    if (delaySeconds !== null) {
                        return { title: r.title, promise: scheduleNtfyReminder({ title: r.title, message: r.message, delaySeconds }) };
                    }
                    return null;
                })
                .filter(item => item !== null);

            if (syncTasks.length === 0) {
                toast.info("כל התזכורות להיום כבר עברו");
                return;
            }

            const results = await Promise.allSettled(syncTasks.map(t => t.promise));
            
            results.forEach((result, index) => {
                const title = syncTasks[index]?.title;
                if (result.status === 'fulfilled') {
                    const value = result.value as any;
                    if (value?.success) {
                        console.log(`Notification sent successfully: ${title}`);
                    } else {
                        console.error(`Notification failed: ${title}`, value?.error ?? value);
                    }
                } else {
                    console.error(`Notification failed: ${title}`, result.reason);
                }
            });

            const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
            
            if (successful > 0) {
                const nowIso = new Date().toISOString();
                setLastSyncDate(nowIso);
                setIsSyncedToday(true);
                try {
                    localStorage.setItem(LAST_SYNC_KEY, nowIso);
                } catch (e) {
                    console.error('Error saving sync date:', e);
                }
                toast.success(`סונכרנו ${successful} תזכורות להמשך היום`);
            } else {
                toast.error("נכשלה סנכרון התזכורות");
            }
            
            console.log('Sync day notification results:', results);
        } catch (error) {
            console.error('Error syncing day:', error);
            toast.error("אירעה שגיאה בסנכרון היום");
        } finally {
            setIsSyncingDay(false);
        }
    };

    useEffect(() => {
        try {
            const seen = localStorage.getItem('oxygym_onboarding_seen');
            if (!seen) {
                setShowOnboarding(true);
            }

            const stored = localStorage.getItem(LAST_SYNC_KEY);
            if (stored) {
                setLastSyncDate(stored);
                const todayStr = new Date().toISOString().split('T')[0];
                const storedStr = new Date(stored).toISOString().split('T')[0];
                setIsSyncedToday(storedStr === todayStr);
            }
        } catch (error) {
            console.error('Error reading from localStorage:', error);
        }
    }, []);

    useEffect(() => {
        const recomputeIsSyncedToday = () => {
            if (!lastSyncDate) {
                setIsSyncedToday(false);
                return;
            }
            const todayStr = new Date().toISOString().split('T')[0];
            const storedStr = new Date(lastSyncDate).toISOString().split('T')[0];
            setIsSyncedToday(storedStr === todayStr);
        };

        const now = new Date();
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5, 0);
        const msUntilMidnight = midnight.getTime() - now.getTime();

        if (msUntilMidnight > 0) {
            const timeout = setTimeout(() => {
                recomputeIsSyncedToday();
                console.log('Sync status reset for new day');
            }, msUntilMidnight);
            return () => clearTimeout(timeout);
        }
    }, [lastSyncDate]);

    const handleDismissOnboarding = () => {
        try {
            localStorage.setItem('oxygym_onboarding_seen', 'true');
            setShowOnboarding(false);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    };

    const getStartOfWeek = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 0 : dayOfWeek;
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - diff);
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek.toISOString().split('T')[0];
    };

    const startOfWeek = getStartOfWeek();
    const today = new Date().toISOString().split('T')[0];

    const { data: weekWorkouts } = useQuery({
        queryKey: ['week-workouts', startOfWeek],
        queryFn: async () => {
            try {
                const logs = await WorkoutLog.query()
                    .gte('date', startOfWeek)
                    .lte('date', today)
                    .exec();
                return logs || [];
            } catch (error) {
                console.error('Error fetching workouts:', error);
                return [];
            }
        },
    });

    const { data: selectedDateNutrition } = useQuery({
        queryKey: ['selected-date-nutrition', selectedDate],
        queryFn: async () => {
            try {
                const logs = await NutritionLog.filter({ date: selectedDate });
                return logs || [];
            } catch (error) {
                console.error('Error fetching nutrition:', error);
                return [];
            }
        },
    });

    const normalizedNutrition = useMemo(() => normalizeNutritionLogs(selectedDateNutrition || []), [selectedDateNutrition]);

    const { data: waterLogSummary } = useQuery({
        queryKey: ['water-log-summary', selectedDate],
        queryFn: async () => {
            try {
                const logs = await WaterLog.filter({ date: selectedDate });
                return logs[0] || null;
            } catch (error) {
                console.error('Error fetching water log summary:', error);
                return null;
            }
        },
    });

    const totalCalories = normalizedNutrition?.reduce((sum, log) => sum + (log.total_calories || 0), 0) || 0;
    const totalProtein = normalizedNutrition?.reduce((sum, log) => sum + (log.protein || 0), 0) || 0;
    const totalCarbs = normalizedNutrition?.reduce((sum, log) => sum + (log.carbs || 0), 0) || 0;
    const totalFat = normalizedNutrition?.reduce((sum, log) => sum + (log.fat || 0), 0) || 0;

    const completedWorkouts = weekWorkouts?.filter(w => w.completed).length || 0;
    const mealsToday = normalizedNutrition?.length || 0;
    const waterGlasses = waterLogSummary?.glasses || 0;

    const caloriePercent = Math.round((totalCalories / dailyCalorieTarget) * 100);
    const proteinPercent = Math.round((totalProtein / dailyProteinTarget) * 100);

    return (
        <div className="min-h-screen bg-oxygym-dark pb-20">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="flex items-center justify-center mb-4">
                    <img 
                        src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/superdev-project-images/9d9da483-282b-4e6c-8640-d115b3edcbaf/e8bvhc02wqgh3kifuszrb/1767265370523-WhatsApp-Image-2026-01-01-at-13.00.57-removebg-preview.png" 
                        alt="OXYGYM Logo" 
                        className="w-32 h-32 mb-4 rounded-full"
                    />
                </div>
                <h1 className="text-4xl font-bold text-center text-white mb-2">OXYGYM Tracker</h1>
                <p className="text-center text-muted-foreground mb-6">סטטיסטיקות והתקדמות</p>

                <div className="mb-6 flex justify-center">
                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="bg-oxygym-yellow text-black hover:bg-oxygym-yellow/90 font-bold px-6 py-2 h-auto rounded-full shadow-lg shadow-oxygym-yellow/20 group transition-all hover:scale-105"
                    >
                        <LayoutDashboard className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                        פתח לוח בקרה חכם
                    </Button>
                </div>
                
                <div className="mb-6 flex justify-center">
                    <DateSelector />
                </div>

                {showOnboarding && (
                    <Card className="bg-oxygym-darkGrey border-oxygym-yellow/30 mb-4 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3 text-oxygym-yellow">
                                <Info className="w-5 h-5" />
                                <h3 className="font-bold">איך להתחיל?</h3>
                            </div>
                            <ul className="space-y-2 text-sm text-white mb-4">
                                <li className="flex items-center gap-2">
                                    <span className="w-5 h-5 flex items-center justify-center bg-oxygym-yellow text-black rounded-full text-xs font-bold">1</span>
                                    <span>מלא פרטי פרופיל ומשקל ראשוני</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-5 h-5 flex items-center justify-center bg-oxygym-yellow text-black rounded-full text-xs font-bold">2</span>
                                    <span>התחל לסמן ארוחות בתפריט התזונה</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-5 h-5 flex items-center justify-center bg-oxygym-yellow text-black rounded-full text-xs font-bold">3</span>
                                    <span>בצע אימון אחד ותעד אותו</span>
                                </li>
                            </ul>
                            <div className="flex justify-end">
                                <Button 
                                    onClick={handleDismissOnboarding}
                                    variant="outline" 
                                    size="sm"
                                    className="border-oxygym-yellow text-oxygym-yellow hover:bg-oxygym-yellow hover:text-black"
                                >
                                    הבנתי
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!isToday && (
                    <div className="mb-4 p-3 bg-oxygym-yellow/10 border border-oxygym-yellow rounded-lg">
                        <p className="text-center text-sm text-white">
                            📅 מציג נתונים מ{new Date(selectedDate).toLocaleDateString('he-IL')}
                        </p>
                    </div>
                )}

                {isToday && !isSyncedToday && (
                    <div className="mb-4 p-3 bg-red-600/20 border border-red-500 rounded-lg animate-pulse">
                        <p className="text-center text-sm text-red-200 font-semibold">
                            ⚠️ שים לב: טרם בוצע סנכרון תזכורות להיום!
                        </p>
                    </div>
                )}

                <Card className="bg-oxygym-darkGrey border-oxygym-yellow/20 mb-4">
                    <CardContent className="p-3 text-center">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            <span className="text-white font-medium">{isToday ? 'היום' : 'סיכום יום'}:</span>{' '}
                            <span className="text-oxygym-yellow">{mealsToday}/4</span> ארוחות ·{' '}
                            <span className="text-oxygym-yellow">{caloriePercent}%</span> קלוריות ·{' '}
                            <span className="text-oxygym-yellow">{proteinPercent}%</span> חלבון ·{' '}
                            <span className="text-oxygym-yellow">{waterGlasses}/{dailyWaterTargetGlasses}</span> כוסות מים
                        </p>
                    </CardContent>
                </Card>
                
                <div className="mb-6">
                    <WeightDialog />
                </div>

                <div className="mb-4">
                    <WeighInReminder />
                </div>

                <div className="mb-6">
                    <SleepTracker />
                </div>

                <div className="mb-6">
                    <WaterTracker />
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-between gap-3">
                        <Button
                            onClick={handleSyncDay}
                            disabled={isSyncingDay}
                            className="flex-1 bg-oxygym-yellow text-black hover:bg-oxygym-yellow/90 font-bold h-12 text-lg shadow-lg shadow-oxygym-yellow/20"
                        >
                            {isSyncingDay ? 'מסנכרן תזכורות...' : 'סנכרון יום'}
                        </Button>
                        {isSyncedToday && isToday && (
                            <div className="flex items-center gap-1 text-xs text-green-400 whitespace-nowrap bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                                <CheckCircle className="w-4 h-4" />
                                <span>מסונכרן להיום</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-2">
                        {(!settings.mealReminders && !settings.weighInReminder) ? (
                            <div className="flex items-center gap-1 justify-center py-1.5 px-3 bg-red-500/10 text-red-300 rounded-lg text-[10px] sm:text-xs border border-red-500/20">
                                <AlertCircle className="w-3 h-3" />
                                <span>אין תזכורות פעילות – סנכרון יום לא ישלח תזכורות</span>
                            </div>
                        ) : (
                            <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 justify-center">
                                <Bell className="w-3 h-3" />
                                <span>תזכורות פעילות: </span>
                                <span className="text-white font-medium">
                                    {settings.mealReminders && settings.weighInReminder 
                                        ? "ארוחות + שקילה" 
                                        : settings.mealReminders 
                                            ? "ארוחות בלבד" 
                                            : "שקילה בלבד"}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mt-2 text-center">
                        <Button 
                            variant="link" 
                            size="sm" 
                            className="text-muted-foreground hover:text-oxygym-yellow text-xs gap-1"
                            onClick={() => navigate('/notifications')}
                        >
                            <Settings className="w-3 h-3" />
                            הגדרות תזכורות
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <StatsCard
                        icon={Dumbbell}
                        title="אימונים השבוע"
                        value={`${completedWorkouts}/${weeklyWorkoutTarget}`}
                        subtitle="יעד שבועי"
                        color="text-blue-400"
                    />
                    <StatsCard
                        icon={Utensils}
                        title={isToday ? "ארוחות היום" : "ארוחות"}
                        value={`${mealsToday}/4`}
                        color="text-green-400"
                    />
                    <StatsCard
                        icon={Flame}
                        title={isToday ? "קלוריות היום" : "קלוריות"}
                        value={`${Math.round(totalCalories)}`}
                        subtitle={`מתוך ${dailyCalorieTarget.toLocaleString()}`}
                        color="text-oxygym-yellow"
                    />
                    <StatsCard
                        icon={Egg}
                        title={isToday ? "חלבון היום" : "חלבון"}
                        value={`${Math.round(totalProtein)}g`}
                        subtitle={`מתוך ${dailyProteinTarget}g`}
                        color="text-purple-400"
                    />
                </div>

                <div className="space-y-6">
                    <CalorieChart
                        protein={totalProtein}
                        carbs={totalCarbs}
                        fat={totalFat}
                        totalCalories={totalCalories}
                    />
                    
                    <WeightChart />
                </div>
            </div>
        </div>
    );
};

export default Index;