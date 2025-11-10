const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

// Config
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const YOUR_EMAIL = process.env.YOUR_EMAIL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
    },
});

exports.handler = async (event) => {
    const now = new Date();
    const in30Min = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

    const { data: meetings, error: supabaseError } = await supabase
        .from('meetings')
        .select('*')
        .eq('reminder_sent', false)
        .lte('date', in30Min.toISOString().split('T')[0])
        .gte('date', now.toISOString().split('T')[0]);

    if (supabaseError) {
        console.error('Supabase error fetching meetings:', supabaseError);
        return { statusCode: 500, body: JSON.stringify({ error: supabaseError.message }) };
    }

    if (!meetings || meetings.length === 0) {
        return { statusCode: 200, body: 'No meetings found or no data returned.' };
    }

    for (const m of meetings) {
        try {
            const meetingDateTimeStr = `${m.date}T${m.time}`;
            const meetingDateTime = new Date(meetingDateTimeStr);

            const timeUntilMeetingMs = meetingDateTime.getTime() - now.getTime();
            const timeUntilMeetingMinutes = timeUntilMeetingMs / (60 * 1000);

            // Send reminder if meeting is between 5 and 30 minutes away
            if (timeUntilMeetingMinutes > 5 && timeUntilMeetingMinutes <= 30) {
                const formattedDate = meetingDateTime.toLocaleString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    hour: 'numeric', minute: 'numeric', hour12: true,
                });

                const reminderHtml = `
                <html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h3 style="color:#FF7F50;">Meeting Reminder!</h3>
                <p>Hi <strong>${m.name}</strong>,</p>
                <p>Your <strong>${m.type}</strong> meeting is starting soon!</p>
                <p><strong>Date & Time:</strong> ${formattedDate}</p>
                <p><strong>Join here:</strong> <a href="${m.meet_link}" style="color:#FF7F50;">Google Meet</a></p>
                <hr><p style="font-size:12px;color:#666;">Awodi Portfolio</p>
                </body></html>
                `;
                await transporter.sendMail({
                    from: GMAIL_USER,
                    to: m.email,
                    subject: 'Reminder: Your Meeting is Starting Soon!',
                    html: reminderHtml,
                });

                await transporter.sendMail({
                    from: GMAIL_USER,
                    to: YOUR_EMAIL,
                    subject: `Reminder Sent: ${m.name}`,
                    html: `<p>Reminder sent to ${m.email} for meeting ${m.name} at ${formattedDate}.</p>`,
                });

                // Update reminder_sent status in Supabase
                const { error: updateError } = await supabase.from('meetings')
                    .update({ reminder_sent: true })
                    .eq('id', m.id);
                
                if (updateError) {
                    console.error('Supabase error updating reminder status:', updateError);
                }
            }
        } catch (error) {
            console.error(`Error processing reminder for meeting ${m.id || 'N/A'}:`, error);
            // Continue to next meeting even if one fails
        }
    }

    return { statusCode: 200, body: 'Reminder function executed.' };
};
