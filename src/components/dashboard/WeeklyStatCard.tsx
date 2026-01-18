import { Card, CardContent } from '@/components/ui/card';
import { LucideAtom } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

interface WeeklyStatCardProps {
    icon?: ComponentType<SVGProps<SVGSVGElement>>;
    label: string;
    value: string;
    subtitle?: string;
    accentColorClass?: string;
}

export const WeeklyStatCard = ({
    icon: Icon = LucideAtom,
    label,
    value,
    subtitle,
    accentColorClass = 'text-oxygym-yellow'
}: WeeklyStatCardProps) => {
    return (
        <Card className="bg-oxygym-darkGrey border-oxygym-yellow/10 transition-all hover:border-oxygym-yellow/30 shadow-md">
            <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5 truncate">{label}</p>
                        <h4 className="text-lg font-bold text-white leading-none mb-1">{value}</h4>
                        {subtitle && (
                            <p className="text-[10px] text-muted-foreground truncate">{subtitle}</p>
                        )}
                    </div>
                    <div className={`p-2 bg-oxygym-dark rounded-lg ${accentColorClass} flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
