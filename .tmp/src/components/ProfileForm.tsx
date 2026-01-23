import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/entities';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const ProfileForm = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [gender, setGender] = useState('זכר');
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [goal, setGoal] = useState('מסה');
    const [dailyCalorieTarget, setDailyCalorieTarget] = useState('');
    const [dailyProteinTarget, setDailyProteinTarget] = useState('');
    const [dailyWaterTargetGlasses, setDailyWaterTargetGlasses] = useState('');
    const [weeklyWorkoutTarget, setWeeklyWorkoutTarget] = useState('');
    const [saving, setSaving] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    const { data: existingProfile, isLoading } = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            try {
                const profiles = await UserProfile.list();
                console.log('Checking for existing profile:', profiles);
                return profiles && profiles.length > 0 ? profiles[0] : null;
            } catch (error) {
                console.error('Error loading profile:', error);
                return null;
            }
        },
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (!isLoading && !hasChecked) {
            const profileCompleted = localStorage.getItem('oxygym-profile-completed');
            
            if (!existingProfile && !profileCompleted) {
                console.log('No profile found, opening dialog');
                setOpen(true);
            } else {
                console.log('Profile exists or already completed:', existingProfile);
                setOpen(false);
                if (existingProfile) {
                    if (existingProfile.gender) setGender(existingProfile.gender);
                    if (existingProfile.age) setAge(String(existingProfile.age));
                    if (existingProfile.height) setHeight(String(existingProfile.height));
                    if (existingProfile.goal) setGoal(existingProfile.goal);
                    if (existingProfile.daily_calorie_target) setDailyCalorieTarget(String(existingProfile.daily_calorie_target));
                    if (existingProfile.daily_protein_target) setDailyProteinTarget(String(existingProfile.daily_protein_target));
                    if (existingProfile.daily_water_target_glasses) setDailyWaterTargetGlasses(String(existingProfile.daily_water_target_glasses));
                    if (existingProfile.weekly_workout_target) setWeeklyWorkoutTarget(String(existingProfile.weekly_workout_target));
                }
            }
            setHasChecked(true);
        }
    }, [existingProfile, isLoading, hasChecked]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!gender || !age || !height || !goal) {
            toast({
                title: '❌ שדות חסרים',
                description: 'אנא מלא את כל השדות',
                variant: 'destructive',
            });
            return;
        }

        try {
            setSaving(true);
            
            const profileData = {
                gender,
                age: parseInt(age),
                height: parseInt(height),
                goal,
                daily_calorie_target: dailyCalorieTarget ? parseInt(dailyCalorieTarget) : undefined,
                daily_protein_target: dailyProteinTarget ? parseInt(dailyProteinTarget) : undefined,
                daily_water_target_glasses: dailyWaterTargetGlasses ? parseInt(dailyWaterTargetGlasses) : undefined,
                weekly_workout_target: weeklyWorkoutTarget ? parseInt(weeklyWorkoutTarget) : undefined,
            };

            if (existingProfile?.id) {
                await UserProfile.update(existingProfile.id, profileData);
                console.log('Profile updated successfully');
            } else {
                await UserProfile.create(profileData);
                console.log('Profile created successfully');
            }
            
            localStorage.setItem('oxygym-profile-completed', 'true');

            toast({
                title: '✅ הפרטים נשמרו בהצלחה',
                description: 'הפרופיל שלך עודכן',
            });

            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            setOpen(false);
        } catch (error) {
            console.error('Error saving profile:', error);
            toast({
                title: '❌ שגיאה',
                description: 'לא הצלחנו לשמור את הפרטים. נסה שוב.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleClose = (newOpen: boolean) => {
        if (!newOpen) {
            localStorage.setItem('oxygym-profile-completed', 'true');
        }
        setOpen(newOpen);
    };

    if (isLoading) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-oxygym-darkGrey border-border text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-center text-oxygym-yellow">
                        ברוך הבא ל-OXYGYM! 💪
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground">
                        בואו נכיר אותך קצת יותר טוב
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto px-1">
                    <div className="space-y-2">
                        <Label htmlFor="gender" className="text-white">מין</Label>
                        <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <RadioGroupItem value="זכר" id="male" className="border-oxygym-yellow text-oxygym-yellow" />
                                <Label htmlFor="male" className="cursor-pointer">זכר</Label>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <RadioGroupItem value="נקבה" id="female" className="border-oxygym-yellow text-oxygym-yellow" />
                                <Label htmlFor="female" className="cursor-pointer">נקבה</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="age" className="text-white">גיל</Label>
                            <Input
                                id="age"
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="הזן גיל"
                                className="bg-black border-border text-white"
                                min="1"
                                max="120"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="height" className="text-white">גובה (ס״מ)</Label>
                            <Input
                                id="height"
                                type="number"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                placeholder="הזן גובה"
                                className="bg-black border-border text-white"
                                min="100"
                                max="250"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="goal" className="text-white">מטרה</Label>
                        <RadioGroup value={goal} onValueChange={setGoal} className="flex gap-4">
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <RadioGroupItem value="חיטוב" id="tone" className="border-oxygym-yellow text-oxygym-yellow" />
                                <Label htmlFor="tone" className="cursor-pointer">חיטוב</Label>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <RadioGroupItem value="מסה" id="mass" className="border-oxygym-yellow text-oxygym-yellow" />
                                <Label htmlFor="mass" className="cursor-pointer">מסה</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="pt-4 border-t border-white/10 space-y-4">
                        <h4 className="text-sm font-bold text-oxygym-yellow">יעדים אישיים (לא חובה)</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="calories" className="text-xs text-white">יעד קלוריות יומי</Label>
                                <Input
                                    id="calories"
                                    type="number"
                                    value={dailyCalorieTarget}
                                    onChange={(e) => setDailyCalorieTarget(e.target.value)}
                                    placeholder="2410"
                                    className="bg-black border-border text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="protein" className="text-xs text-white">יעד חלבון (גרם)</Label>
                                <Input
                                    id="protein"
                                    type="number"
                                    value={dailyProteinTarget}
                                    onChange={(e) => setDailyProteinTarget(e.target.value)}
                                    placeholder="145"
                                    className="bg-black border-border text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="water" className="text-xs text-white">יעד מים (כוסות)</Label>
                                <Input
                                    id="water"
                                    type="number"
                                    value={dailyWaterTargetGlasses}
                                    onChange={(e) => setDailyWaterTargetGlasses(e.target.value)}
                                    placeholder="12"
                                    className="bg-black border-border text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="workouts" className="text-xs text-white">יעד אימונים שבועי</Label>
                                <Input
                                    id="workouts"
                                    type="number"
                                    value={weeklyWorkoutTarget}
                                    onChange={(e) => setWeeklyWorkoutTarget(e.target.value)}
                                    placeholder="3"
                                    className="bg-black border-border text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-oxygym-yellow hover:bg-yellow-500 text-black font-bold text-lg py-6 sticky bottom-0"
                    >
                        {saving ? 'שומר...' : '🚀 בואו נתחיל!'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};