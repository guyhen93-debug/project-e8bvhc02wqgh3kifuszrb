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
        isToday?: boolean;
        status?: 'green' | 'yellow' | 'red';
    }[];
}

export const WeeklyProgressCharts = ({ days }: WeeklyProgressChartsProps) => {
    const getStatusColor = (status?: string, isToday?: boolean) => {
        if (!status) return '#444';
        switch (status) {
            case 'green': return '#22c55e';
            case 'yellow': return '#eab308';
            case 'red': return '#ef4444';
            default: return '#444';
        }
    };
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
                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                                itemStyle={{ color: '#FFE600' }}
                                formatter={(value: number, name: string, props: any) => {
                                    const { payload } = props;
                                    return [`${value} / ${payload.calorieTarget}`, 'קלוריות'];
                                }}
                            />
                            <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                                {days.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={getStatusColor(entry.status, entry.isToday)}
                                        stroke={entry.isToday ? '#FFFFFF' : 'none'}
                                        strokeWidth={entry.isToday ? 2 : 0}
                                        fillOpacity={entry.isToday ? 1 : 0.8}
                                    />
                                ))}
                            </Bar>
                            <ReferenceLine y={2410} stroke="#FFE600" strokeDasharray="3 3" />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="px-4 mt-2 flex flex-wrap gap-x-4 gap-y-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">ירוק – קרוב ליעד</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#eab308]" />
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">צהוב – סביר</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">אדום – רחוק מהתוכנית</span>
                        </div>
                    </div>
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
                    <div className="px-4 pb-2">
                        <p className="text-[10px] text-muted-foreground">
                            הקו הכחול מסמן שעות שינה, הצהוב מסמן כוסות מים בכל יום.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
