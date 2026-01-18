import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Utensils, Scale, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/hooks/useNotifications';

const Notifications = () => {
    const navigate = useNavigate();
    const { settings, toggleMealNotifications, toggleWeighInNotification } = useNotifications();

    return (
        <div className="min-h-screen bg-oxygym-dark pb-20">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="flex items-center gap-4 mb-8">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigate('/')}
                        className="text-white hover:bg-oxygym-darkGrey"
                    >
                        <ArrowRight className="w-6 h-6" />
                    </Button>
                    <h1 className="text-2xl font-bold text-white">הגדרות תזכורות</h1>
                </div>

                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2 text-oxygym-yellow">
                        <Bell className="w-5 h-5" />
                        <h2 className="text-lg font-semibold">נהלו את ההתראות שלכם</h2>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        התזכורות נשלחות ישירות לטלפון שלכם דרך שירות ntfy. 
                        כאן תוכלו לבחור אילו סוגי תזכורות ייווצרו כשתלחצו על כפתור "סנכרון יום" במסך הבית.
                    </p>
                </div>

                <div className="space-y-6">
                    <Card className="bg-oxygym-darkGrey border-oxygym-yellow/20">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-400/10 rounded-lg">
                                        <Utensils className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-white text-base">תזכורות ארוחות</CardTitle>
                                        <CardDescription className="text-muted-foreground text-xs">
                                            תזכורות לאורך היום לאכילה וסימון ביומן
                                        </CardDescription>
                                    </div>
                                </div>
                                <Switch 
                                    checked={settings.mealReminders}
                                    onCheckedChange={toggleMealNotifications}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                כולל 4 תזכורות: ארוחת בוקר, 2 גיינרים וארוחת ערב.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-oxygym-darkGrey border-oxygym-yellow/20">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-400/10 rounded-lg">
                                        <Scale className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-white text-base">שקילה שבועית</CardTitle>
                                        <CardDescription className="text-muted-foreground text-xs">
                                            תזכורת בימי חמישי בבוקר
                                        </CardDescription>
                                    </div>
                                </div>
                                <Switch 
                                    checked={settings.weighInReminder}
                                    onCheckedChange={toggleWeighInNotification}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                מופיע רק בסנכרון של ימי חמישי בשעה 06:30.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-oxygym-yellow/5 border-oxygym-yellow/10">
                        <CardContent className="p-4 flex gap-3">
                            <Info className="w-5 h-5 text-oxygym-yellow shrink-0" />
                            <p className="text-xs text-white/80 leading-relaxed">
                                שימו לב: שינוי ההגדרות ישפיע רק על ה"סנכרון" הבא שתבצעו. 
                                תזכורות שכבר תוזמנו להמשך היום לא יושפעו משינוי זה.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
