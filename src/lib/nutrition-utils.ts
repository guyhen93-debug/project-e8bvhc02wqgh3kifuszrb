
/**
 * Normalizes NutritionLog records for a specific day.
 * 
 * 1. De-duplicates logs by (menu_type, meal_number), keeping only the latest version.
 * 2. Groups logs by menu_type (defaulting to 'weekday').
 * 3. Chooses the menu_type with the highest total calorie sum as the "active" menu for that day.
 * 4. Returns only the logs from that active menu type, sorted by meal_number.
 * 
 * This is used for aggregations and UI display to prevent inflated totals from duplicate or stale records.
 */
export const normalizeNutritionLogs = (logs: any[]): any[] => {
    if (!logs || logs.length === 0) return [];

    // 1. De-duplicate: Keep latest updated_at for each (menu_type, meal_number)
    const deDuplicatedMap = new Map<string, any>();

    logs.forEach(log => {
        const menuType = log.menu_type || 'weekday';
        const mealNumber = log.meal_number;
        const key = `${menuType}-${mealNumber}`;

        const existing = deDuplicatedMap.get(key);
        if (!existing) {
            deDuplicatedMap.set(key, log);
        } else {
            // Keep the one with the later update time
            const existingDate = new Date(existing.updated_at || existing.created_at || 0).getTime();
            const currentDate = new Date(log.updated_at || log.created_at || 0).getTime();
            
            if (currentDate > existingDate) {
                deDuplicatedMap.set(key, log);
            }
        }
    });

    const uniqueLogs = Array.from(deDuplicatedMap.values());

    // 2. Group by menu_type and calculate calorie sums
    const groups = new Map<string, { logs: any[], totalCalories: number }>();

    uniqueLogs.forEach(log => {
        const menuType = log.menu_type || 'weekday';
        if (!groups.has(menuType)) {
            groups.set(menuType, { logs: [], totalCalories: 0 });
        }
        
        const group = groups.get(menuType)!;
        group.logs.push(log);
        group.totalCalories += (log.total_calories || 0);
    });

    // 3. Find active menu_type (the one with the highest calorie sum)
    let activeMenuType = 'weekday';
    let maxCalories = -1;

    groups.forEach((data, menuType) => {
        if (data.totalCalories > maxCalories) {
            maxCalories = data.totalCalories;
            activeMenuType = menuType;
        }
    });

    // 4. Return logs from the active menu type, sorted by meal_number
    return (groups.get(activeMenuType)?.logs || [])
        .sort((a, b) => (a.meal_number || 0) - (b.meal_number || 0));
};
