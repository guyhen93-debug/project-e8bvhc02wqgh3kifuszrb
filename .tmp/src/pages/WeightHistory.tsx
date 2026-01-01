import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, History, Calendar as CalendarIcon, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeightLog } from '@/entities';

const WeightHistory = () => {
    const navigate = useNavigate();

    const { data: weightLogs, isLoading } = useQuery({
        queryKey: ['weight-logs-full'],
        queryFn: async () => {
            try {
                // Fetching up to 365 logs (about a year of daily weighing or more if less frequent)
                const logs = await WeightLog.list('-date', 365);
                return logs || [];
            } catch (error) {
                console.error('Error fetching full weight history:', error);
                return [];
            }
        },
    });

    const sortedLogs = weightLogs ? [...weightLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];
    
    const chartData = sortedLogs.map(log => ({
        date: new Date(log.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' }),
        fullDate: new Date(log.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: '2-digit' }),
        weight: log.weight,
    }));

    const currentWeight = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1].weight : null;
    const previousWeight = sortedLogs.length > 1 ? sortedLogs[sortedLogs.length - 2].weight : null;
    const oldestWeight = sortedLogs.length > 0 ? sortedLogs[0].weight : null;

    const weeklyChange = (currentWeight !== null && previousWeight !== null) ? currentWeight - previousWeight : null;
    const totalChange = (currentWeight !== null && oldestWeight !== null) ? currentWeight - oldestWeight : null;

    const formatChange = (val: number | null) => {
        if (val === null) return "—";
        const sign = val > 0 ? "+" : "";
        return `${sign}${val.toFixed(1)}`;
    };

    const getChangeColor = (val: number | null) => {
        if (val === null || val === 0) return "text-white";
        return val < 0 ? "text-emerald-400" : "text-red-400";
    };

    const weights = chartData.map(d => d.weight);
    const minWeight = weights.length > 0 ? Math.min(...weights) : 0;
    const maxWeight = weights.length > 0 ? Math.max(...weights) : 100;
    const yAxisMin = Math.floor(minWeight - 1);
    const yAxisMax = Math.ceil(maxWeight + 1);

    return (
        <div className="min-h-screen bg-oxygym-dark pb-24">
            <div className="container mx-auto px-4 py-6 max-w-3xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button 
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        aria-label="חזרה"
                    >
                        <ArrowRight className="w-6 h-6 text-white" />
                    </button>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <History className="w-6 h-6 text-oxygym-yellow" />
                        היסטוריית משקל
                    </h1>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-oxygym-yellow"></div>
                    </div>
                ) : sortedLogs.length === 0 ? (
                    <div className="text-center py-20 bg-oxygym-darkGrey rounded-xl border border-border">
                        <p className="text-muted-foreground">אין עדיין שקילות בהיסטוריה. התחל לתעד את המשקל שלך!</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="mt-4 text-oxygym-yellow underline"
                        >
                            חזרה לדף הבית
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <Card className="bg-oxygym-darkGrey border-border overflow-hidden">
                                <CardContent className="p-3 text-center">
                                    <p className="text-muted-foreground text-[10px] mb-1 font-medium">נוכחי</p>
                                    <p className="text-white text-lg font-bold">{currentWeight}<span className="text-[10px] font-normal ml-0.5 opacity-60">ק"ג</span></p>
                                </CardContent>
                            </Card>
                            <Card className="bg-oxygym-darkGrey border-border overflow-hidden">
                                <CardContent className="p-3 text-center">
                                    <p className="text-muted-foreground text-[10px] mb-1 font-medium">שינוי אחרון</p>
                                    <p className={`text-lg font-bold ${getChangeColor(weeklyChange)}`}>
                                        {formatChange(weeklyChange)}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="bg-oxygym-darkGrey border-border overflow-hidden">
                                <CardContent className="p-3 text-center">
                                    <p className="text-muted-foreground text-[10px] mb-1 font-medium">שינוי כולל</p>
                                    <p className={`text-lg font-bold ${getChangeColor(totalChange)}`}>
                                        {formatChange(totalChange)}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Extended Chart */}
                        <Card className="bg-oxygym-darkGrey border-border overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-white text-sm flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-oxygym-yellow" />
                                    מגמת משקל מלאה
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 pb-4">
                                <div className="pl-4 pr-2 mt-4">
                                    <ResponsiveContainer width="100%" height={260}>
                                        <LineChart data={chartData} margin={{ left: -10, right: 30, top: 10, bottom: 5 }}>
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
                                                strokeWidth={2.5}
                                                dot={{ fill: '#FFE600', r: 3, strokeWidth: 0 }}
                                                activeDot={{ r: 5, stroke: '#FFE600', strokeWidth: 2, fill: '#1a1a1a' }}
                                                animationDuration={1000}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Full List of Entries */}
                        <div className="space-y-3">
                            <h2 className="text-lg font-bold text-white px-1 flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-oxygym-yellow" />
                                כל השקילות
                            </h2>
                            <div className="space-y-2">
                                {[...sortedLogs].reverse().map((log, index) => (
                                    <div 
                                        key={log.id || index}
                                        className="flex justify-between items-center bg-oxygym-darkGrey/60 border border-white/5 rounded-xl px-4 py-3 shadow-sm"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-white text-sm font-medium">
                                                {new Date(log.date).toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            {log.notes && (
                                                <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                                                    {log.notes}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white text-lg font-bold">{log.weight}</span>
                                            <span className="text-[10px] text-muted-foreground font-normal">ק"ג</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeightHistory;
