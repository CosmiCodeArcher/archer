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
    const fiveMinFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    const thirtyMinFromNow = new Date(now.getTime() + 30 * 60 * 1000);

    const todayIsoDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const fiveMinIsoTime = fiveMinFromNow.toTimeString().split(' ')[0].slice(0, 8); // HH:MM:SS
    const thirtyMinIsoTime = thirtyMinFromNow.toTimeString().split(' ')[0].slice(0, 8); // HH:MM:SS

    const { data: meetings, error: supabaseError } = await supabase
        .from('meetings')
        .select('*')
        .eq('reminder_sent', false)
        .eq('date', todayIsoDate) // Only consider today's date
        .gte('time', fiveMinIsoTime)
        .lte('time', thirtyMinIsoTime);

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
                <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #F5E8C7 0%, #C2D8B9 100%); min-height: 100vh;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                
                <!-- Main Card -->
                <div style="background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%); backdrop-filter: blur(20px); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15);">
                    
                    <!-- Header with Gradient -->
                    <div style="background: linear-gradient(135deg, #00CED1 0%, #FF7F50 100%); padding: 40px 30px; text-align: center; position: relative;">
                        <img src="https://awodi.netlify.app/bell.png" alt="Reminder Bell" style="width: 64px; height: auto; margin-bottom: 16px; display: inline-block;">
                        <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">Meeting Reminder!</h1>
                        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.95); font-size: 16px;">Your meeting is starting soon</p>
                    </div>

                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        
                        <!-- Greeting -->
                        <p style="font-size: 18px; color: #333; margin: 0 0 24px 0; line-height: 1.6;">
                            Hi <strong style="color: #FF7F50;">${m.name}</strong>,
                        </p>
                        
                        <p style="font-size: 16px; color: #555; margin: 0 0 32px 0; line-height: 1.6;">
                            Just a friendly reminder that your <strong style="color: #00CED1;">${m.type}</strong> meeting is coming up!
                        </p>

                        <!-- Meeting Details Card -->
                        <div style="background: linear-gradient(135deg, rgba(255,127,80,0.08) 0%, rgba(0,206,209,0.08) 100%); border-left: 4px solid #FF7F50; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                            
                            <div style="display: table; width: 100%; margin-bottom: 16px;">
                                <div style="display: table-cell; vertical-align: middle; width: 40px;">
                                    <img 
                                        src="https://awodi.netlify.app/weekend.png" 
                                        alt="Calendar Icon" 
                                        className="w-6 h-6 md:w-8 md:h-8 object-contain" 
                                        style={{ display: 'inline-block' }}
                                    />
                                </div>
                                <div style="display: table-cell; vertical-align: middle;">
                                    <div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Date & Time</div>
                                    <div style="color: #333; font-size: 16px; font-weight: 600;">${formattedDate}</div>
                                </div>
                            </div>

                            <div style="display: table; width: 100%;">
                                <div style="display: table-cell; vertical-align: middle; width: 40px;">
                                    <span style="font-size: 24px;">⏱️</span>
                                </div>
                                <div style="display: table-cell; vertical-align: middle;">
                                    <div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Duration</div>
                                    <div style="color: #333; font-size: 16px; font-weight: 600;">${m.duration} minutes</div>
                                </div>
                            </div>
                        </div>

                        <!-- Call to Action -->
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${m.meet_link}" style="display: inline-block; background: linear-gradient(135deg, #FF7F50 0%, #00CED1 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(255,127,80,0.3); transition: all 0.3s;">
                                Join Meeting Now
                            </a>
                        </div>

                    </div>

                    <!-- Footer -->
                    <div style="background: linear-gradient(135deg, rgba(245,232,199,0.3) 0%, rgba(194,216,185,0.3) 100%); padding: 30px; text-align: center; border-top: 1px solid rgba(0,0,0,0.05);">
                        <p style="margin: 0; color: #666; font-size: 14px;">
                            See you there!
                        </p>
                        <p style="margin: 0; color: #999; font-size: 12px;">
                            <strong style="background: linear-gradient(135deg, #FF7F50 0%, #00CED1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Awodi Portfolio</strong><br>
                            Building experiences that matter
                        </p>
                    </div>

                </div>

                <!-- Decorative Elements -->
                <div style="text-align: center; margin-top: 20px;">
                    <p style="color: rgba(0,0,0,0.3); font-size: 11px; margin: 0;">
                        Crafted with ❤️ and lots of ☕
                    </p>
                </div>

            </div>
        </body>
        </html>
                `;
                await transporter.sendMail({
                    from: `"Awodi Portfolio" <${GMAIL_USER}>`,
                    to: m.email,
                    subject: 'Reminder: Your Meeting is Starting Soon!',
                    html: reminderHtml,
                });

                await transporter.sendMail({
                    from: `"Awodi Portfolio" <${GMAIL_USER}>`,
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
