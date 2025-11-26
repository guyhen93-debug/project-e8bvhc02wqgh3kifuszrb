/**
 * פונקציה לשליחת תזכורות במייל
 * שולחת תזכורות לאימונים, ארוחות, שקילה וכו'
 */

interface SendReminderRequest {
    email: string;
    name: string;
    reminderType: 'workout' | 'meal' | 'weigh-in' | 'water' | 'weekly-report';
    customMessage?: string;
    data?: any;
}

interface SendReminderResponse {
    success: boolean;
    message: string;
}

export default async function sendReminder(
    req: SendReminderRequest
): Promise<SendReminderResponse> {
    const { email, name, reminderType, customMessage, data } = req;

    let subject = '';
    let body = '';

    switch (reminderType) {
        case 'workout':
            subject = '💪 זמן לאימון - OXYGYM';
            body = `
שלום ${name},

זה הזמן לאימון היום! 🏋️

זכור:
✅ חימום 5-10 דקות לפני התחלה
✅ שתה מים לאורך האימון
✅ התמקד בטכניקה הנכונה
✅ מנוחה של 60-90 שניות בין סטים

בהצלחה באימון! 💪

OXYGYM Tracker
            `.trim();
            break;

        case 'meal':
            subject = '🍽️ תזכורת ארוחה - OXYGYM';
            body = `
שלום ${name},

זמן לארוחה הבאה! 

זכור לעקוב אחר:
🥩 חלבון איכותי
🍚 פחמימות מורכבות
🥑 שומנים בריאים
🥗 ירקות טריים

עקוב אחרי התוכנית התזונתית שלך ב-OXYGYM Tracker!

בתאבון! 😋

OXYGYM Tracker
            `.trim();
            break;

        case 'weigh-in':
            subject = '⚖️ זמן שקילה - OXYGYM';
            body = `
שלום ${name},

זמן לשקילה שבועית! 📊

טיפים לשקילה מדויקת:
⏰ שקול את עצמך בבוקר
🚽 לאחר שירותים
🍽️ לפני אכילה או שתייה
👕 ללא בגדים או עם בגדים קלים

תעד את המשקל שלך ב-OXYGYM Tracker!

בהצלחה! 💪

OXYGYM Tracker
            `.trim();
            break;

        case 'water':
            subject = '💧 תזכורת שתיית מים - OXYGYM';
            body = `
שלום ${name},

זכור לשתות מים! 💧

היעד היומי שלך: 3 ליטר

טיפים:
✅ שתה כוס מים כל שעה
✅ תמיד החזק בקבוק מים לידך
✅ שתה מים לפני, במהלך ואחרי האימון

הידרציה נכונה = ביצועים טובים יותר! 💪

OXYGYM Tracker
            `.trim();
            break;

        case 'weekly-report':
            subject = '📊 דו"ח התקדמות שבועי - OXYGYM';
            body = `
שלום ${name},

הנה הדו"ח השבועי שלך! 📈

${data?.summary || 'בדוק את האפליקציה לפרטים מלאים.'}

${data?.achievements && data.achievements.length > 0 ? `
🏆 ההישגים שלך:
${data.achievements.map((a: string) => `  ${a}`).join('\n')}
` : ''}

${data?.recommendations && data.recommendations.length > 0 ? `
💡 המלצות לשבוע הבא:
${data.recommendations.map((r: string) => `  ${r}`).join('\n')}
` : ''}

המשך כך! אתה על המסלול הנכון! 🚀

OXYGYM Tracker
            `.trim();
            break;

        default:
            subject = '📬 תזכורת מ-OXYGYM';
            body = customMessage || `
שלום ${name},

תזכורת מ-OXYGYM Tracker! 

המשך לעקוב אחרי התוכנית שלך והישארו עקביים! 💪

OXYGYM Tracker
            `.trim();
    }

    try {
        // כאן תוכל להשתמש בשירות שליחת מיילים כמו SendGrid, AWS SES, וכו'
        // לצורך הדוגמה, נדמה שליחה מוצלחת
        
        console.log(`Sending email to ${email}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body}`);

        // TODO: הוסף קוד לשליחת מייל בפועל
        // לדוגמה עם SendGrid:
        // await sendgrid.send({ to: email, subject, text: body });

        return {
            success: true,
            message: `תזכורת נשלחה בהצלחה ל-${email}`,
        };
    } catch (error) {
        console.error('Error sending reminder:', error);
        return {
            success: false,
            message: 'שגיאה בשליחת התזכורת',
        };
    }
}