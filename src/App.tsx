import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { GlobalTimer } from "@/components/GlobalTimer";
import { OrientationHint } from "@/components/OrientationHint";
import { ProfileForm } from "@/components/ProfileForm";
import { TimerProvider } from "@/contexts/TimerContext";
import { DateProvider } from "@/contexts/DateContext";
import Index from "./pages/Index";
import Workouts from "./pages/Workouts";
import WorkoutA from "./pages/WorkoutA";
import WorkoutB from "./pages/WorkoutB";
import WorkoutC from "./pages/WorkoutC";
import Nutrition from "./pages/Nutrition";
import Calendar from "./pages/Calendar";
import WeightHistory from "./pages/WeightHistory";
import Status from "./pages/Status";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <DateProvider>
                <TimerProvider>
                    <Toaster />
                    <Sonner />
                    <ProfileForm />
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/workouts" element={<Workouts />} />
                            <Route path="/workout-a" element={<WorkoutA />} />
                            <Route path="/workout-b" element={<WorkoutB />} />
                            <Route path="/workout-c" element={<WorkoutC />} />
                            <Route path="/nutrition" element={<Nutrition />} />
                            <Route path="/calendar" element={<Calendar />} />
                            <Route path="/weight-history" element={<WeightHistory />} />
                            <Route path="/status" element={<Status />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                        <OrientationHint />
                        <GlobalTimer />
                        <BottomNav />
                    </BrowserRouter>
                </TimerProvider>
            </DateProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
