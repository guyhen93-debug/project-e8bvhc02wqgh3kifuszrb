import { superdevClient } from "@/lib/superdev/client";

export const NutritionLog = superdevClient.entity("NutritionLog");
export const WeightLog = superdevClient.entity("WeightLog");
export const WorkoutLog = superdevClient.entity("WorkoutLog");
export const User = superdevClient.auth;
