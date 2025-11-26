import { useQuery } from '@tanstack/react-query';
import { Dumbbell, Droplet, Utensils } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { WeightChart } from '@/components/WeightChart';
import { CalorieChart } from '@/components/CalorieChart';
import { WorkoutLog, NutritionLog } from '@/entities';

const Home = () => {
    const today = new Date().toISOString().split('T')[0];

    const { data: todayWorkouts } = useQuery({
        queryKey: ['today-workouts', today],
        queryFn: async () => {
            try {
                const logs = await WorkoutLog.filter({ date: today });
                return logs || [];
            } catch (error) {
                console.error('Error fetching workouts:', error);
                return [];
            }
        },
    });

    const { data: todayNutrition } = useQuery({
        queryKey: ['today-nutrition', today],
        queryFn: async () => {
            try {
                const logs = await NutritionLog.filter({ date: today });
                return logs || [];
            } catch (error) {
                console.error('Error fetching nutrition:', error);
                return [];
            }
        },
    });

    const totalCalories = todayNutrition?.reduce((sum, log) => sum + (log.total_calories || 0), 0) || 0;
    const totalProtein = todayNutrition?.reduce((sum, log) => sum + (log.protein || 0), 0) || 0;
    const totalCarbs = todayNutrition?.reduce((sum, log) => sum + (log.carbs || 0), 0) || 0;
    const totalFat = todayNutrition?.reduce((sum, log) => sum + (log.fat || 0), 0) || 0;

    const workoutsThisWeek = todayWorkouts?.filter(w => w.completed).length || 0;
    const mealsToday = todayNutrition?.length || 0;

    return (
        <div className="min-h-screen bg-oxygym-dark pb-20">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="flex items-center justify-center mb-8">
                    <img 
                        src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/files/chat-generated-images/project-e8bvhc02wqgh3kifuszrb/69e66df0-f040-4cc8-b3fa-00d6cbd9d70e.png" 
                        alt="OXYGYM Logo" 
                        className="w-20 h-20 mb-4"
                    />
                </div>
                <h1 className="text-4xl font-bold text-center text-white mb-2">OXYGYM Tracker</h1>
                <p className="text-center text-muted-foreground mb-8">סטטיסטיקות והתקדמות</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <StatsCard
                        icon={Dumbbell}
                        title="אימונים היום"
                        value={`${workoutsThisWeek}/3`}
                        subtitle="השבוע"
                        color="text-blue-400"
                    />
                    <StatsCard
                        icon={Utensils}
                        title="ארוחות היום"
                        value={`${mealsToday}/4`}
                        color="text-green-400"
                    />
                    <StatsCard
                        icon={Droplet}
                        title="שתיית מים"
                        value="3 ליטר"
                        subtitle="יעד יומי"
                        color="text-cyan-400"
                    />
                    <StatsCard
                        icon={Utensils}
                        title="קלוריות היום"
                        value={`${Math.round(totalCalories)}`}
                        subtitle="מתוך 2,409"
                        color="text-oxygym-yellow"
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

export default Home;