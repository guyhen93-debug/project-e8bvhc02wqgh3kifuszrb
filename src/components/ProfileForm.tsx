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
            
            await UserProfile.create({
                gender,
                age: parseInt(age),
                height: parseInt(height),
                goal,
            });

            console.log('Profile saved successfully');
            
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
                
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
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

                    <Button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-oxygym-yellow hover:bg-yellow-500 text-black font-bold text-lg py-6"
                    >
                        {saving ? 'שומר...' : '🚀 בואו נתחיל!'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};