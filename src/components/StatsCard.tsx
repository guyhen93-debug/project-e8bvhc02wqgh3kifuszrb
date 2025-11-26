import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    icon: LucideIcon;
    title: string;
    value: string;
    subtitle?: string;
    color?: string;
}

export const StatsCard = ({ icon: Icon, title, value, subtitle, color = 'text-oxygym-yellow' }: StatsCardProps) => {
    return (
        <Card className="bg-oxygym-darkGrey border-border">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className={`${color}`}>
                        <Icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                        <p className="text-white font-semibold text-lg">{value}</p>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};