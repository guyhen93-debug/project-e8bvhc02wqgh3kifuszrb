import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkoutCardProps {
    id: string;
    title: string;
    description: string;
    path: string;
}

export const WorkoutCard = ({ id, title, description, path }: WorkoutCardProps) => {
    const navigate = useNavigate();

    return (
        <Card className="bg-oxygym-darkGrey border-border hover:border-oxygym-yellow transition-colors">
            <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-oxygym-yellow rounded-full flex items-center justify-center">
                        <Dumbbell className="w-6 h-6 text-black" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                </div>
                <Button
                    onClick={() => navigate(path)}
                    className="w-full bg-oxygym-yellow hover:bg-yellow-500 text-black font-bold"
                >
                    התחל אימון
                </Button>
            </CardContent>
        </Card>
    );
};