import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface CalorieChartProps {
    protein: number;
    carbs: number;
    fat: number;
    totalCalories: number;
    targetCalories?: number;
}

export const CalorieChart = ({ 
    protein, 
    carbs, 
    fat, 
    totalCalories,
    targetCalories = 2409
}: CalorieChartProps) => {
    const proteinCals = protein * 4;
    const carbsCals = carbs * 4;
    const fatCals = fat * 9;

    const data = [
        { name: 'חלבון', value: proteinCals, grams: protein, color: '#60A5FA' },
        { name: 'פחמימות', value: carbsCals, grams: carbs, color: '#34D399' },
        { name: 'שומן', value: fatCals, grams: fat, color: '#FB923C' },
    ];

    const percentage = Math.min((totalCalories / targetCalories) * 100, 100);
    const percentageDisplay = Math.round(percentage);

    return (
        <Card className="bg-oxygym-darkGrey border-border">
            <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                    <span>תזונה יומית</span>
                    <span className="text-sm text-muted-foreground">
                        {totalCalories} / {targetCalories} קלוריות
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full bg-black rounded-full h-3 mb-4">
                    <div 
                        className="bg-oxygym-yellow h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                
                {totalCalories > 0 ? (
                    <>
                        <div className="relative">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-oxygym-yellow">{percentageDisplay}%</p>
                                    <p className="text-xs text-muted-foreground">מהיעד</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            {data.map((item) => (
                                <div key={item.name} className="text-center">
                                    <div 
                                        className="w-3 h-3 rounded-full mx-auto mb-1" 
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <p className="text-xs text-muted-foreground">{item.name}</p>
                                    <p className="text-sm text-white font-semibold">{Math.round(item.grams)}g</p>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p className="text-muted-foreground text-center py-8">
                        התחל לסמן ארוחות כדי לראות את החלוקה התזונתית
                    </p>
                )}
            </CardContent>
        </Card>
    );
};