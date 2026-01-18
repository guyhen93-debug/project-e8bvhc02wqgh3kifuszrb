/**
 * Nutrition utility functions for OXYGYM Tracker.
 *
 * Domain Model:
 * - One daily calorie target (e.g., 2410 calories)
 * - Multiple meal templates (weekday, shabbat) - these are PRESETS only
 * - User can mix meals from ANY template
 * - Daily total = sum of ALL selected meals regardless of template
 */

export interface NutritionTotals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

/**
 * Normalizes NutritionLog records for a specific day.
 *
 * 1. De-duplicates logs by (menu_type, meal_number), keeping only the latest version.
 * 2. Returns ALL logs from ALL menu types (since they're just presets, not exclusive).
 *
 * This allows users to mix meals from different templates while preventing
 * duplicate entries for the same meal slot.
 */
export const normalizeNutritionLogs = (logs: any[]): any[] => {
    if (!logs?.length) return [];

    const deDuplicatedMap = new Map<string, any>();

    for (const log of logs) {
        const menuType = log.menu_type || 'weekday';
        const mealNumber = log.meal_number;
        const key = `${menuType}-${mealNumber}`;

        const existing = deDuplicatedMap.get(key);

        if (!existing) {
            deDuplicatedMap.set(key, log);
        } else {
            // Compare ISO strings directly (lexicographic comparison works for ISO format)
            const existingTime = existing.updated_at || existing.created_at || '';
            const currentTime = log.updated_at || log.created_at || '';

            if (currentTime > existingTime) {
                deDuplicatedMap.set(key, log);
            }
        }
    }

    // Return ALL logs from all menu types, sorted by meal_number
    return Array.from(deDuplicatedMap.values())
        .sort((a, b) => (a.meal_number || 0) - (b.meal_number || 0));
};

/**
 * Calculate daily nutrition totals from all consumed meals.
 *
 * One daily target, multiple meal templates, one total sum.
 * This sums ALL meals regardless of which template they came from.
 */
export const calculateDailyTotals = (logs: any[]): NutritionTotals => {
    const normalized = normalizeNutritionLogs(logs);

    return normalized.reduce(
        (acc, log) => ({
            calories: acc.calories + (log.total_calories || 0),
            protein: acc.protein + (log.protein || 0),
            carbs: acc.carbs + (log.carbs || 0),
            fat: acc.fat + (log.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
};

/**
 * Get logs filtered by menu type (for UI display purposes).
 * Use this when you need to show only one template's meals.
 */
export const getLogsByMenuType = (logs: any[], menuType: 'weekday' | 'shabbat'): any[] => {
    const normalized = normalizeNutritionLogs(logs);
    return normalized.filter(log => (log.menu_type || 'weekday') === menuType);
};
