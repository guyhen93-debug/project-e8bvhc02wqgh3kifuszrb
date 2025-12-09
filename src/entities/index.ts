import { superdevClient } from "@/lib/superdev/client";

export const NutritionLog = superdevClient.entity("NutritionLog");
export const UserProfile = superdevClient.entity("UserProfile");
export const WeightLog = superdevClient.entity("WeightLog");
export const WorkoutLog = superdevClient.entity("WorkoutLog");
export const User = superdevClient.auth;
