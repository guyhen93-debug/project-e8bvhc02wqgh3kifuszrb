import { superdevClient } from "@/lib/superdev/client";

export const calculateMetrics = superdevClient.functions.calculateMetrics;
export const generateWeeklyReport = superdevClient.functions.generateWeeklyReport;
export const sendReminder = superdevClient.functions.sendReminder;
export const analyzeProgress = superdevClient.functions.analyzeProgress;
