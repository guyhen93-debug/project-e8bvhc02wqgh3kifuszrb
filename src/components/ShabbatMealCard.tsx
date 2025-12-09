import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils } from 'lucide-react';

interface ShabbatMealOption {
    title: string;
    description: string;
    calories: number;
}

export const ShabbatMealCard = () => {
    const shabbatOptions: ShabbatMealOption[] = [
        {
            title: "אופציה 1",
            description: "נתח דג מרוקאי + חלה קטנה שלמה + 200 גרם ירקות",
            calories: 504
        },
        {
            title: "אופציה 2", 
            description: "כרעיים (שוק + ירך עוף) + 50 גרם אורז + סלט 200 גרם ירקות",
            calories: 562
        },
        {
            title: "אופציה 3",
            description: "120 גרם סלמון + 200 גרם בטטה + 300 גרם ירקות",
            calories: 507
        },
        {
            title: "אופציה 4",
            description: "100 גרם סינטה + סלט בורגול + 300 גרם ירקות",
            calories: 505
        }
    ];

    return (
        <Card className="bg-gradient-to-br from-oxygym-darkGrey to-oxygym-yellow/10 border-oxygym-yellow/50">
            <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                    <Utensils className="w-5 h-5 text-oxygym-yellow" />
                    <span>סעודות שבת - בחר אחת</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
                <div className="bg-oxygym-yellow/20 border border-oxygym-yellow/40 rounded-lg p-3 text-center">
                    <p className="text-sm text-white font-semibold">
                        ⚠️ ארוחה זו מחליפה ארוחה אחת ביום
                    </p>
                </div>
                
                <div className="space-y-2">
                    {shabbatOptions.map((option, index) => (
                        <div 
                            key={index}
                            className="bg-black/40 rounded-lg p-3 border border-border hover:border-oxygym-yellow/50 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-oxygym-yellow mb-1">
                                        {option.title}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        {option.description}
                                    </p>
                                </div>
                                <span className="text-xs text-oxygym-yellow font-semibold whitespace-nowrap">
                                    {option.calories} קל'
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-muted-foreground text-center mt-3">
                    💡 בקינוחים, בפיצוחים ובפירות - אומרים "לא"
                </p>
            </CardContent>
        </Card>
    );
};