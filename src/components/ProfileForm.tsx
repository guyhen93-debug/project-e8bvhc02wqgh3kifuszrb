import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/entities';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const ProfileForm = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [goal, setGoal] = useState('');
    const [saving, setSaving] = useState(false);

    const { data: currentUser } = useQuery({
        queryKey: ['current-user'],
        queryFn: async () => {
            try {
                const user = await User.me();
                return user;
            } catch (error) {
                console.error('Error loading user:', error);
                return null;
            }
        },
    });

    useEffect(() => {
        if (currentUser) {
            const hasProfile = currentUser.gender && currentUser.age && currentUser.height && currentUser.goal;
            if (!hasProfile) {
                setOpen(true);
            }
            
            if (currentUser.gender) setGender(currentUser.gender);
            if (currentUser.age) setAge(String(currentUser.age));
            if (currentUser.height) setHeight(String(currentUser.height));
            if (currentUser.goal) setGoal(currentUser.goal);
        }
    }, [currentUser]);

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
            
            await User.updateProfile({
                gender,
                age: parseInt(age),
                height: parseInt(height),
                goal,
            });

            toast({
                title: '✅ הפרטים נשמרו בהצלחה',
                description: 'הפרופיל שלך עודכן',
            });

            queryClient.invalidateQueries({ queryKey: ['current-user'] });
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
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