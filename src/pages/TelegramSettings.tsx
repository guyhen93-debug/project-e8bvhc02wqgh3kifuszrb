import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Check, AlertCircle, ArrowRight, MessageSquare, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTelegramSettings } from '@/hooks/useTelegramSettings';
import { useToast } from '@/hooks/use-toast';
import { telegramSendMessage } from '@/functions';

const TelegramSettings = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { settings, setChatId, setToken } = useTelegramSettings();
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        // localStorage is already updated by the hook's setters, but we'll show feedback
        setTimeout(() => {
            setIsSaving(false);
            toast({
                title: "✅ ההגדרות נשמרו",
                description: "הגדרות הטלגרם עודכנו בהצלחה",
            });
        }, 500);
    };

    const handleTestMessage = async () => {
        if (!settings.chatId) {
            toast({
                variant: "destructive",
                title: "❌ חסר Chat ID",
                description: "אנא הזן Chat ID כדי לשלוח הודעת ניסיון",
            });
            return;
        }

        setIsTesting(true);
        try {
            const result = await telegramSendMessage({
                chatId: settings.chatId,
                text: "👋 <b>הודעת ניסיון מ-OXYGYM!</b>\n\nאם קיבלת את ההודעה הזו, סימן שהחיבור עובד בצורה תקינה. עכשיו תקבל תזכורות לארוחות ואימונים ישירות לכאן! 💪"
            });

            // The function response might vary, but we expect success
            toast({
                title: "🚀 הודעה נשלחה!",
                description: "בדוק את הטלגרם שלך.",
            });
        } catch (error) {
            console.error('Telegram test failed:', error);
            toast({
                variant: "destructive",
                title: "❌ השליחה נכשלה",
                description: "וודא שה-Chat ID נכון ושהבוט הופעל (לחץ Start בבוט)",
            });
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="min-h-screen bg-oxygym-dark pb-24 rtl">
            <div className="container mx-auto px-4 py-8 max-w-2xl text-right">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate('/')} 
                    className="mb-6 text-muted-foreground hover:text-white"
                >
                    <ArrowRight className="ml-2 w-4 h-4" />
                    חזרה לבית
                </Button>

                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="p-4 bg-blue-500/10 rounded-full mb-4">
                        <Send className="w-10 h-10 text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">הגדרות Telegram</h1>
                    <p className="text-muted-foreground">חבר את הבוט כדי לקבל תזכורות לארוחות, אימונים ושקילה</p>
                </div>

                <div className="space-y-6">
                    <Card className="bg-oxygym-darkGrey border-oxygym-yellow/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white justify-end">
                                <MessageSquare className="w-5 h-5 text-oxygym-yellow" />
                                פרטי התקשרות
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                הזן את ה-ID האישי שלך כדי שהבוט ידע לאן לשלוח את ההודעות
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="chatId" className="text-white block text-right">Telegram Chat ID</Label>
                                <Input
                                    id="chatId"
                                    placeholder="לדוגמה: 123456789"
                                    value={settings.chatId}
                                    onChange={(e) => setChatId(e.target.value)}
                                    className="bg-oxygym-dark border-oxygym-yellow/10 focus:border-oxygym-yellow text-white text-right"
                                />
                                {!settings.chatId && (
                                    <div className="flex items-center gap-2 text-xs text-amber-400 mt-1 justify-end">
                                        <AlertCircle className="w-3 h-3" />
                                        חובה להזין Chat ID כדי לקבל הודעות
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground">נשמר מקומית בלבד</span>
                                    <Label htmlFor="token" className="text-white block text-right">Bot Token (לצפייה בלבד)</Label>
                                </div>
                                <Input
                                    id="token"
                                    type="password"
                                    placeholder="הזן את הטוקן של הבוט (אופציונלי)"
                                    value={settings.token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="bg-oxygym-dark border-oxygym-yellow/10 focus:border-oxygym-yellow text-white text-right font-mono"
                                />
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row-reverse gap-3">
                                <Button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 bg-oxygym-yellow text-black hover:bg-oxygym-yellow/90 font-bold"
                                >
                                    {isSaving ? (
                                        <>
                                            <Check className="ml-2 w-4 h-4" />
                                            נשמר!
                                        </>
                                    ) : (
                                        "שמירת הגדרות"
                                    )}
                                </Button>
                                <Button 
                                    variant="outline"
                                    onClick={handleTestMessage}
                                    disabled={isTesting || !settings.chatId}
                                    className="flex-1 border-blue-400/50 text-blue-400 hover:bg-blue-400/10"
                                >
                                    {isTesting ? "שולח..." : "שלח הודעת ניסיון"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-oxygym-darkGrey/50 border-blue-400/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-blue-400 flex items-center gap-2 justify-end">
                                <ShieldCheck className="w-4 h-4" />
                                איך מוצאים את ה-Chat ID שלי?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>1. חפש בטלגרם את הבוט <code className="text-white bg-blue-900/30 px-1 rounded">@userinfobot</code></p>
                            <p>2. לחץ על <code className="text-white bg-blue-900/30 px-1 rounded">Start</code></p>
                            <p>3. הבוט ישלח לך את ה-ID שלך (מספר ארוך)</p>
                            <p>4. העתק אותו והדבק בשדה ה-Chat ID למעלה</p>
                            <div className="mt-4 p-3 bg-blue-400/5 rounded-lg border border-blue-400/10 text-xs">
                                <b>טיפ:</b> וודא שהפעלת גם את הבוט של האפליקציה כדי שיוכל לשלוח לך הודעות.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TelegramSettings;
