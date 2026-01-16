import { superdevClient } from "@/lib/superdev/client";

export const analyzeProgress = superdevClient.functions.analyzeProgress;
export const calculateMetrics = superdevClient.functions.calculateMetrics;
export const generateWeeklyReport = superdevClient.functions.generateWeeklyReport;
export const sendReminder = superdevClient.functions.sendReminder;
export const telegramSendMessage = superdevClient.functions.telegramSendMessage;
export const notifyRestEnd = superdevClient.functions.notifyRestEnd;
export const scheduleNtfyReminder = superdevClient.functions.scheduleNtfyReminder;
