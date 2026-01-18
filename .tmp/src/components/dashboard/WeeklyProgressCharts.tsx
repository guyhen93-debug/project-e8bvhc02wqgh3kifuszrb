import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    AreaChart, 
    Area,
    ReferenceLine,
    Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeeklyProgressChartsProps {
    days: {
        date: string;
        label: string;
        calories: number;
        calorieTarget: number;
        workouts: number;
        waterGlasses?: number;
        sleepHours?: number;
    }[];
}

export const WeeklyProgressCharts = ({ days }: WeeklyProgressChartsProps) => {
    return (
        <div className="space-y-6">
            <Card className="bg-oxygym-darkGrey border-oxygym-yellow/10">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-white">קלוריות יומיות מול יעד</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pb-4 h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis 
                                dataKey="label" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#888', fontSize: 12 }} 
                            />
                            <YAxis hide />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
                                itemStyle={{ color: '#FFE600' }}
                            />
                            <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                                {days.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.calories >= entry.calorieTarget ? '#FFE600' : '#444'} 
                                    />
                                ))}
                            </Bar>
                            <ReferenceLine y={2410} stroke="#FFE600" strokeDasharray="3 3" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="bg-oxygym-darkGrey border-oxygym-yellow/10">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-white">שעות שינה ומים</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pb-4 h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={days} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis 
                                dataKey="label" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#888', fontSize: 12 }} 
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="sleepHours" 
                                name="שינה (שעות)"
                                stroke="#60A5FA" 
                                fillOpacity={1} 
                                fill="url(#colorSleep)" 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="waterGlasses" 
                                name="מים (כוסות)"
                                stroke="#FFE600" 
                                fill="transparent" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};
