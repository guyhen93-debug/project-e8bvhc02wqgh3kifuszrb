import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { WeightLog } from '@/entities';

export const WeightChart = () => {
    const { data: weightLogs } = useQuery({
        queryKey: ['weight-logs'],
        queryFn: async () => {
            try {
                const logs = await WeightLog.list('-date', 20);
                return logs.reverse();
            } catch (error) {
                console.error('Error fetching weight logs:', error);
                return [];
            }
        },
    });

    const chartData = weightLogs?.map(log => ({
        date: new Date(log.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' }),
        weight: log.weight,
    })) || [];

    if (chartData.length === 0) {
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

    return (
        <Card className="bg-oxygym-darkGrey border-border">
            <CardHeader>
                <CardTitle className="text-white">גרף משקל</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData} margin={{ left: 50, right: 10, top: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis 
                            dataKey="date" 
                            stroke="#999"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                            stroke="#999"
                            style={{ fontSize: '11px' }}
                            domain={[yAxisMin, yAxisMax]}
                            tickFormatter={(value) => `${value}`}
                            width={80}
                            tickMargin={30}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#1a1a1a', 
                                border: '1px solid #333',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                            formatter={(value: any) => [`${value} ק"ג`, 'משקל']}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="#FFE600" 
                            strokeWidth={3}
                            dot={{ fill: '#FFE600', r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};