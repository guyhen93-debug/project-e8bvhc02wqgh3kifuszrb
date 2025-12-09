import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserProfile } from '@/entities';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export const ProfileSetup = () => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [gender, setGender] = useState<string>('זכר');
    const [age, setAge] = useState<string>('');
    const [height, setHeight] = useState<string>('');
    const [goal, setGoal] = useState<string>('מסה');
    const [saving, setSaving] = useState(false);

    const { data: existingProfile, isLoading } = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            try {
                const profiles = await UserProfile.list();
                return profiles[0] || null;
            } catch (error) {
                console.error('Error loading profile:', error);
                return null;
            }
        },
    });

    useEffect(() => {
        if (!isLoading && !existingProfile) {
            setOpen(true);
        }
    }, [existingProfile, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!age || !height) {
            toast({
                title: "שגיאה",
                description: "נא למלא את כל השדות",
                variant: "destructive",
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

            toast({
                title: "מצוין!",
                description: "הפרטים נשמרו בהצלחה",
            });

            setOpen(false);
        } catch (error) {
            console.error('Error saving profile:', error);
            toast({
                title: "שגיאה",
                description: "אירעה שגיאה בשמירת הפרטים",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="bg-oxygym-darkGrey border-oxygym-yellow max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white text-center">
                        ברוך הבא ל-OXYGYM! 💪
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-center">
                        בואו נכיר אותך קצת כדי להתאים לך את התוכנית המושלמת
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="gender" className="text-white font-semibold">מין</Label>
                        <RadioGroup value={gender} onValueChange={setGender}>
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <RadioGroupItem value="זכר" id="male" className="border-oxygym-yellow" />
                                <Label htmlFor="male" className="text-white cursor-pointer">זכר</Label>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <RadioGroupItem value="נקבה" id="female" className="border-oxygym-yellow" />
                                <Label htmlFor="female" className="text-white cursor-pointer">נקבה</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="age" className="text-white font-semibold">גיל</Label>
                        <Input
                            id="age"
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="הכנס את הגיל שלך"
                            className="bg-black border-border text-white"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="height" className="text-white font-semibold">גובה (ס"מ)</Label>
                        <Input
                            id="height"
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            placeholder="הכנס את הגובה שלך"
                            className="bg-black border-border text-white"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="goal" className="text-white font-semibold">מטרה</Label>
                        <RadioGroup value={goal} onValueChange={setGoal}>
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <RadioGroupItem value="מסה" id="bulk" className="border-oxygym-yellow" />
                                <Label htmlFor="bulk" className="text-white cursor-pointer">מסה</Label>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <RadioGroupItem value="חיטוב" id="cut" className="border-oxygym-yellow" />
                                <Label htmlFor="cut" className="text-white cursor-pointer">חיטוב</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-oxygym-yellow hover:bg-yellow-500 text-black font-bold h-12"
                    >
                        {saving ? 'שומר...' : 'בואו נתחיל! 🚀'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};