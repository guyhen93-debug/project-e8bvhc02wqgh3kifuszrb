import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dumbbell, Utensils, Calendar as CalendarIcon, Scale } from 'lucide-react';
import { WeightModal } from '@/components/WeightModal';

const Index = () => {
    const navigate = useNavigate();
    const [weightModalOpen, setWeightModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-oxygym-dark pb-20">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">OXYGYM</h1>
                    <p className="text-oxygym-yellow text-lg">מעקב אימונים ותזונה</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card 
                        className="bg-oxygym-darkGrey border-border hover:border-oxygym-yellow transition-all cursor-pointer"
                        onClick={() => navigate('/workouts')}
                    >
                        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[140px]">
                            <Dumbbell className="w-12 h-12 text-oxygym-yellow mb-3" />
                            <h2 className="text-xl font-bold text-white">אימונים</h2>
                        </CardContent>
                    </Card>

                    <Card 
                        className="bg-oxygym-darkGrey border-border hover:border-oxygym-yellow transition-all cursor-pointer"
                        onClick={() => navigate('/nutrition')}
                    >
                        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[140px]">
                            <Utensils className="w-12 h-12 text-oxygym-yellow mb-3" />
                            <h2 className="text-xl font-bold text-white">תפריט תזונה</h2>
                        </CardContent>
                    </Card>

                    <Card 
                        className="bg-oxygym-darkGrey border-border hover:border-oxygym-yellow transition-all cursor-pointer"
                        onClick={() => navigate('/calendar')}
                    >
                        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[140px]">
                            <CalendarIcon className="w-12 h-12 text-oxygym-yellow mb-3" />
                            <h2 className="text-xl font-bold text-white">לוח שנה</h2>
                        </CardContent>
                    </Card>

                    <Card 
                        className="bg-oxygym-darkGrey border-border hover:border-oxygym-yellow transition-all cursor-pointer"
                        onClick={() => setWeightModalOpen(true)}
                    >
                        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[140px]">
                            <Scale className="w-12 h-12 text-oxygym-yellow mb-3" />
                            <h2 className="text-xl font-bold text-white">תיעוד משקל</h2>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-gradient-to-br from-oxygym-yellow to-yellow-600 border-0">
                    <CardContent className="p-6">
                        <h3 className="text-2xl font-bold text-black mb-2">💪 מוכן להתחיל?</h3>
                        <p className="text-black/80">בחר אימון או תעד את התזונה שלך</p>
                    </CardContent>
                </Card>
            </div>

            <WeightModal 
                open={weightModalOpen} 
                onOpenChange={setWeightModalOpen}
            />
        </div>
    );
};

export default Index;