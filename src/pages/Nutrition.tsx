import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Droplet, Moon, ChevronDown, ChevronUp } from 'lucide-react';

const Nutrition = () => {
    const navigate = useNavigate();
    const [showShabbat, setShowShabbat] = useState(false);

    const meals = [
        {
            number: 1,
            time: 'עד 10:00',
            items: '4 פרוסות לחם כוסמין, 100 גרם גבינה לבנה 5%, 2 ביצים, 200 גרם ירקות.'
        },
        {
            number: 2,
            time: 'עד 12:30',
            items: '2 כפות גיינר עם מים.'
        },
        {
            number: 3,
            time: 'עד 15:30',
            items: '2 כפות גיינר עם מים.'
        },
        {
            number: 4,
            time: 'עד 22:00',
            items: '150 גרם חזה עוף, 80 גרם אורז (לפני בישול), 200 גרם ירקות.'
        },
    ];

    const shabbatOptions = [
        'דג מרוקאי (רוטב בסיר בלבד) + חלה קטנה + 200 גרם ירקות',
        'כרעיים (שוק+ירך) + 50 גרם אורז + סלט ירקות',
        '120 גרם סלמון + 200 גרם בטטה + 300 גרם ירקות בתנור',
        '100 גרם סינטה + סלט בורגול + 300 גרם ירקות',
    ];

    return (
        <div className="min-h-screen bg-oxygym-dark">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white">תפריט תזונה</h1>
                    <Button
                        onClick={() => navigate('/')}
                        variant="outline"
                        className="border-oxygym-yellow text-white hover:bg-oxygym-yellow hover:text-black"
                    >
                        <ArrowRight className="w-4 h-4 ml-2" />
                        חזרה
                    </Button>
                </div>

                <div className="mb-8">
                    <img 
                        src="https://ellprnxjjzatijdxcogk.supabase.co/storage/v1/object/public/files/chat-generated-images/project-e8bvhc02wqgh3kifuszrb/290546f6-d126-4cef-9c22-400e817b185f.png" 
                        alt="Healthy Meals" 
                        className="w-full h-56 object-cover rounded-xl mb-6"
                    />
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <Card className="bg-oxygym-darkGrey border-border">
                            <CardContent className="p-4 flex items-center gap-3">
                                <Droplet className="w-8 h-8 text-blue-400" />
                                <div>
                                    <p className="text-white font-semibold">3 ליטר מים</p>
                                    <p className="text-sm text-muted-foreground">יעד יומי</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-oxygym-darkGrey border-border">
                            <CardContent className="p-4 flex items-center gap-3">
                                <Moon className="w-8 h-8 text-purple-400" />
                                <div>
                                    <p className="text-white font-semibold">7-9 שעות שינה</p>
                                    <p className="text-sm text-muted-foreground">יעד יומי</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    {meals.map((meal) => (
                        <Card key={meal.number} className="bg-oxygym-darkGrey border-border">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center justify-between">
                                    <span>ארוחה {meal.number}</span>
                                    <span className="text-oxygym-yellow text-sm font-normal">{meal.time}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{meal.items}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Button
                    onClick={() => setShowShabbat(!showShabbat)}
                    className="w-full bg-oxygym-yellow hover:bg-yellow-500 text-black font-bold mb-4"
                >
                    אופציות לשבת
                    {showShabbat ? (
                        <ChevronUp className="w-5 h-5 mr-2" />
                    ) : (
                        <ChevronDown className="w-5 h-5 mr-2" />
                    )}
                </Button>

                {showShabbat && (
                    <div className="space-y-3">
                        {shabbatOptions.map((option, index) => (
                            <Card key={index} className="bg-oxygym-darkGrey border-oxygym-yellow">
                                <CardContent className="p-4">
                                    <p className="text-white">{option}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Nutrition;