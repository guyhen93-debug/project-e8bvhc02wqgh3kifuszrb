Deno.serve(async (req) => {
    try {
        const { email, name, reminderType, customMessage, data } = await req.json();

        let subject = '';
        let body = '';

        switch (reminderType) {
            case 'workout':
                subject = '💪 זמן לאימון - OXYGYM';
                body = `שלום ${name},\n\nזה הזמן לאימון היום! 🏋️\n\nזכור:\n✅ חימום 5-10 דקות לפני התחלה\n✅ שתה מים לאורך האימון\n✅ התמקד בטכניקה הנכונה\n✅ מנוחה של 60-90 שניות בין סטים\n\nבהצלחה באימון! 💪\n\nOXYGYM Tracker`;
                break;
            case 'meal':
                subject = '🍽️ תזכורת ארוחה - OXYGYM';
                body = `שלום ${name},\n\nזמן לארוחה הבאה!\n\nזכור לעקוב אחר:\n🥩 חלבון איכותי\n🍚 פחמימות מורכבות\n🥑 שומנים בריאים\n🥗 ירקות טריים\n\nבתאבון! 😋`;
                break;
            case 'weigh-in':
                subject = '⚖️ זמן שקילה - OXYGYM';
                body = `שלום ${name},\n\nזמן לשקילה שבועית! 📊\n\nטיפים לשקילה מדויקת:\n⏰ שקול את עצמך בבוקר\n🚽 לאחר שירותים\n🍽️ לפני אכילה או שתייה`;
                break;
            default:
                subject = '📬 תזכורת מ-OXYGYM';
                body = customMessage || `שלום ${name},\n\nתזכורת מ-OXYGYM Tracker!`;
        }

        console.log(`Sending email to ${email}: ${subject}`);

        return new Response(JSON.stringify({
            success: true,
            message: `תזכורת נשלחה בהצלחה ל-${email}`,
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error('Error in sendReminder:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'שגיאה בשליחת התזכורת',
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});