import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { WeightLog } from '@/entities';

export const WeightChart = () => {
    const { data: weightLogs } = useQuery({
        queryKey: ['weight-logs'],
        queryFn: async () => {
            try {
                const logs = await WeightLog.list('-date', 52);
                return logs;
            } catch (error) {
                console.error('Error fetching weight logs:', error);
                return [];
            }
        },
    });

    const processData = () => {
        if (!weightLogs || weightLogs.length === 0) return { chartData: [], weeklyData: [] };

        const weeksMap = new Map();
        
        // Grouping by week - taking the most recent log per week
        weightLogs.forEach(log => {
            const d = new Date(log.date);
            const startOfWeek = new Date(d);
            startOfWeek.setDate(d.getDate() - d.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            const key = startOfWeek.getTime().toString();
            
            if (!weeksMap.has(key)) {
                weeksMap.set(key, {
                    date: d,
                    weight: log.weight,
                    sortDate: d.getTime()
                });
            }
        });

        const sortedWeeks = Array.from(weeksMap.values())
            .sort((a, b) => b.sortDate - a.sortDate)
            .slice(0, 10); // Last 10 weeks
        
        const chartData = [...sortedWeeks]
            .sort((a, b) => a.sortDate - b.sortDate)
            .map(d => ({
                date: d.date.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' }),
                weight: d.weight,
            }));

        return { chartData, weeklyData: sortedWeeks };
    };

    const { chartData, weeklyData } = processData();

    if (weeklyData.length === 0) {
        return (
            <Card className="bg-oxygym-darkGrey border-border">
                <CardHeader>
                    <CardTitle className="text-white">גרף משקל</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                        עדיין אין נתוני משקל. התחל לתעד את המשקל שלך!
                    </p>
                </CardContent>
            </Card>
        );
    }

    const weights = chartData.map(d => d.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const yAxisMin = Math.floor(minWeight - 1);
    const yAxisMax = Math.ceil(maxWeight + 1);

    const currentWeight = weeklyData[0]?.weight;
    const previousWeight = weeklyData[1]?.weight || null;
    const weeklyChange = previousWeight !== null ? currentWeight - previousWeight : null;
    const oldestInView = weeklyData[weeklyData.length - 1]?.weight;
    const totalChange = weeklyData.length > 1 ? currentWeight - oldestInView : null;

    const formatChange = (val: number | null) => {
        if (val === null) return "—";
        const sign = val > 0 ? "+" : "";
        return `${sign}${val.toFixed(1)}`;
    };

    const getChangeColor = (val: number | null) => {
        if (val === null || val === 0) return "text-white";
        return val < 0 ? "text-emerald-400" : "text-red-400";
    };

    return (
        <Card className="bg-oxygym-darkGrey border-border">
            <CardHeader>
                <CardTitle className="text-white">גרף משקל שבועי</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-6">
                <div className="grid grid-cols-3 gap-2 mb-6 px-4 py-4 bg-white/5 rounded-lg mx-4">
                    <div className="text-center">
                        <p className="text-muted-foreground text-[10px] mb-1 font-medium">משקל נוכחי</p>
                        <p className="text-white text-lg font-bold">
                            {currentWeight} <span className="text-xs font-normal opacity-70">ק"ג</span>
                        </p>
                    </div>
                    <div className="text-center border-x border-white/10">
                        <p className="text-muted-foreground text-[10px] mb-1 font-medium">שינוי שבועי</p>
                        <p className={`text-lg font-bold ${getChangeColor(weeklyChange)}`}>
                            {formatChange(weeklyChange)}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-muted-foreground text-[10px] mb-1 font-medium">שינוי כולל</p>
                        <p className={`text-lg font-bold ${getChangeColor(totalChange)}`}>
                            {formatChange(totalChange)}
                        </p>
                    </div>
                </div>

                <div className="pl-4 pr-2">
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData} margin={{ left: -10, right: 50, top: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                stroke="#666"
                                style={{ fontSize: '10px' }}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis 
                                stroke="#666"
                                style={{ fontSize: '10px' }}
                                domain={[yAxisMin, yAxisMax]}
                                tickFormatter={(value) => `${value}`}
                                orientation="left"
                                tickLine={false}
                                axisLine={false}
                                dx={-5}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#1a1a1a', 
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    direction: 'rtl',
                                    fontSize: '12px'
                                }}
                                formatter={(value: any) => [`${value} ק"ג`, 'משקל']}
                                labelStyle={{ color: '#999', marginBottom: '4px' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="weight" 
                                stroke="#FFE600" 
                                strokeWidth={3}
                                dot={{ fill: '#FFE600', r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 6, stroke: '#FFE600', strokeWidth: 2, fill: '#1a1a1a' }}
                                animationDuration={1000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <p className="text-[10px] text-muted-foreground text-center mt-4 px-4 opacity-60">
                    הגרף מציג את המגמה השבועי ב-10 השבועות האחרונים
                </p>
            </CardContent>
        </Card>
    );
};