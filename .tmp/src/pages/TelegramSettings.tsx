import { useState } from 'react';
import { useTelegramSettings } from '@/hooks/useTelegramSettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Send, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { telegramSendMessage } from '@/functions';

const TelegramSettingsPage = () => {
    const { settings, setChatId, setToken } = useTelegramSettings();
    const [isSaved, setIsSaved] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const { toast } = useToast();

    const handleSave = () => {
        // useTelegramSettings updates on every change, but we show confirmation
        setIsSaved(true);
        toast({
            title: "ההגדרות נשמרו",
            description: "פרטי הטלגרם עודכנו בהצלחה במכשיר שלך.",
        });
        setTimeout(() => setIsSaved(false), 3000);
    };

    const handleTestMessage = async () => {
        if (!settings.chatId) {
            toast({
                title: "חסר Chat ID",
                description: "אנא הזן Chat ID כדי לשלוח הודעת ניסיון.",
                variant: "destructive"
            });
            return;
        }

        setIsTesting(true);
        try {
            const result = await telegramSendMessage({
                chatId: settings.chatId,
                text: "👋 <b>הודעת ניסיון מ-OXYGYM!</b>\n\nהחיבור לטלגרם הוגדר בהצלחה. מעכשיו תקבל כאן תזכורות ועדכונים."
            });

            if (result.success) {
                toast({
                    title: "הודעה נשלחה!",
                    description: "בדוק את הטלגרם שלך.",
                });
            } else {
                throw new Error(result.error || "שגיאה בשליחת ההודעה");
            }
        } catch (error) {
            console.error("Test message failed:", error);
            toast({
                title: "שליחה נכשלה",
                description: "וודא שה-Chat ID תקין ושהבוט הופעל.",
                variant: "destructive"
            });
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="min-h-screen bg-oxygym-dark pb-24 pt-8">
            <div className="container mx-auto px-4 max-w-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <Send className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">הגדרות Telegram</h1>
                        <p className="text-muted-foreground text-sm">קבלת תזכורות ישירות לנייד</p>
                    </div>
                </div>

                <Card className="bg-oxygym-darkGrey border-oxygym-yellow/20 mb-6">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">חיבור לבוט</CardTitle>
                        <CardDescription>
                            הבוט של OXYGYM שולח תזכורות על ארוחות, אימונים ושקילה.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="chatId" className="text-white">Telegram Chat ID</Label>
                            <Input
                                id="chatId"
                                value={settings.chatId}
                                onChange={(e) => setChatId(e.target.value)}
                                placeholder="לדוגמה: 123456789"
                                className="bg-oxygym-dark border-oxygym-yellow/20 text-white"
                            />
                            {!settings.chatId && (
                                <p className="text-xs text-amber-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    בלי Chat ID לא נוכל לשלוח הודעות לטלגרם.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="token" className="text-white">Bot Token (לצפייה בלבד)</Label>
                            <Input
                                id="token"
                                type="password"
                                value={settings.token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="לא חובה - נשמר מקומית בלבד"
                                className="bg-oxygym-dark border-oxygym-yellow/20 text-white"
                            />
                            <p className="text-[10px] text-muted-foreground">
                                הערה: הבוט משתמש במפתח מאובטח בשרת. השדה הזה נועד לתיעוד אישי שלך ונשמר רק בדפדפן זה.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <Button 
                                onClick={handleSave}
                                className="w-full bg-oxygym-yellow text-black hover:bg-oxygym-yellow/90 font-bold"
                            >
                                {isSaved ? (
                                    <>
                                        <Check className="w-4 h-4 ml-2" />
                                        נשמר!
                                    </>
                                ) : "שמירת הגדרות"}
                            </Button>

                            <Button 
                                variant="outline"
                                onClick={handleTestMessage}
                                disabled={isTesting || !settings.chatId}
                                className="w-full border-blue-500 text-blue-500 hover:bg-blue-500/10"
                            >
                                {isTesting ? "שולח..." : "שלח הודעת ניסיון"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h3 className="text-blue-400 font-bold text-sm mb-2">איך מוצאים את ה-Chat ID?</h3>
                    <ol className="text-xs text-white/80 space-y-2 list-decimal list-inside">
                        <li>חפשו בטלגרם את הבוט <b>@userinfobot</b></li>
                        <li>שלחו לו הודעה כלשהי</li>
                        <li>הוא יחזיר לכם את ה-Id שלכם. העתיקו אותו לכאן.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default TelegramSettingsPage;
