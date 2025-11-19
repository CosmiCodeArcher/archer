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
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (error) {
        console.error('Invalid JSON:', error);
        return { statusCode: 400, body: 'Invalid JSON' };
    }

    const { name, email, dateTime, duration, type, notes } = body;

    if (!name || !email || !dateTime || !duration || !type) {
        return { statusCode: 400, body: 'Missing fields' };
    }

    // Generate Meet link
    const meetLink = `https://meet.google.com/${Math.random().toString(36).substr(2, 9)}`;

    // Parse dateTime
    const date = dateTime.split('T')[0];
    const parsedTime = dateTime.split('T')[1].split('.')[0]; // Extract time and remove milliseconds

    // Check for duplicate booking
    const { data: existingMeetings, error: checkError } = await supabase
        .from('meetings')
        .select('id')
        .eq('date', date)
        .eq('time', parsedTime);

    if (checkError) {
        console.error('Supabase check error:', checkError);
        return { statusCode: 500, body: JSON.stringify({ error: checkError.message }) };
    }

    if (existingMeetings && existingMeetings.length > 0) {
        return { statusCode: 409, body: JSON.stringify({ error: 'This slot is already booked. Please choose another time.' }) };
    }

    // Save to Supabase
    const { data, error: supabaseError } = await supabase
        .from('meetings')
        .insert({
            name, email, date, time: parsedTime,
            duration, type, notes, meet_link: meetLink,
        })
        .select()
        .single();

    if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        return { statusCode: 500, body: JSON.stringify({ error: supabaseError.message }) };
    }

    // Format date for email
    // Construct date using individual components to avoid timezone issues with string parsing
    // Assuming date is 'YYYY-MM-DD' and parsedTime is 'HH:MM:SS'
    const dateIsoString = `${date}T${parsedTime}Z`; // Combine and force UTC interpretation
    const dateObj = new Date(dateIsoString);
    
    const formattedDate = dateObj.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'UTC',
    });

    // Generate Google Calendar link
    const startDateTime = dateObj.toISOString().replace(/\.\d{3}Z$/, 'Z'); // Ensure ISO format with Z for Google Calendar
    const endDateTime = new Date(dateObj.getTime() + duration * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');
    const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(type + ' with ' + name)}&dates=${startDateTime.replace(/[-:]/g, '').substring(0, 15)}/${endDateTime.replace(/[-:]/g, '').substring(0, 15)}&details=${encodeURIComponent('Meeting Details:\nLink: ' + meetLink + '\nNotes: ' + (notes || 'None'))}&location=${encodeURIComponent(meetLink)}&sf=true&output=xml`;

    try {
        // Client email
        const clientHtml = `
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
                    <div style="background: linear-gradient(135deg, #FF7F50 0%, #00CED1 100%); padding: 40px 30px; text-align: center; position: relative;">
                        <img src="https://awodi.netlify.app/weekend.png" alt="Calendar" style="width: 64px; height: auto; margin-bottom: 16px; display: inline-block;">
                        <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">Meeting Confirmed!</h1>
                        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.95); font-size: 16px;">Your time has been reserved</p>
                    </div>

                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        
                        <!-- Greeting -->
                        <p style="font-size: 18px; color: #333; margin: 0 0 24px 0; line-height: 1.6;">
                            Hi <strong style="color: #FF7F50;">${name}</strong>,
                        </p>
                        
                        <p style="font-size: 16px; color: #555; margin: 0 0 32px 0; line-height: 1.6;">
                            Great news! Your <strong style="color: #00CED1;">${type}</strong> has been successfully scheduled. I'm looking forward to connecting with you!
                        </p>

                        <!-- Meeting Details Card -->
                        <div style="background: linear-gradient(135deg, rgba(255,127,80,0.08) 0%, rgba(0,206,209,0.08) 100%); border-left: 4px solid #FF7F50; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                            
                            <div style="display: table; width: 100%; margin-bottom: 16px;">
                                <div style="display: table-cell; vertical-align: middle; width: 40px;">
                                    <img 
                                        src="https://awodi.netlify.app/weekend.png" 
                                        alt="Calendar Icon" 
                                        className="w-1 h-1 md:w-1 md:h-1 object-contain" 
                                        style={{ display: 'inline-block' }}
                                    />
                                </div>
                                <div style="display: table-cell; vertical-align: middle;">
                                    <div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Date & Time</div>
                                    <div style="color: #333; font-size: 16px; font-weight: 600;">${formattedDate}</div>
                                </div>
                            </div>

                            <div style="display: table; width: 100%; margin-bottom: 16px;">
                                <div style="display: table-cell; vertical-align: middle; width: 40px;">
                                    <span style="font-size: 24px;">⏱️</span>
                                </div>
                                <div style="display: table-cell; vertical-align: middle;">
                                    <div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Duration</div>
                                    <div style="color: #333; font-size: 16px; font-weight: 600;">${duration} minutes</div>
                                </div>
                            </div>

                            <div style="display: table; width: 100%;">
                                <div style="display: table-cell; vertical-align: middle; width: 40px;">
                                    <span style="font-size: 24px;">💬</span>
                                </div>
                                <div style="display: table-cell; vertical-align: middle;">
                                    <div style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Meeting Type</div>
                                    <div style="color: #333; font-size: 16px; font-weight: 600;">${type}</div>
                                </div>
                            </div>

                        </div>

                        <!-- Info Box -->
                        <div style="background: linear-gradient(135deg, rgba(0,206,209,0.1) 0%, rgba(194,216,185,0.1) 100%); border-radius: 12px; padding: 20px; margin-bottom: 32px; border: 1px solid rgba(0,206,209,0.2);">
                            <p style="margin: 0; color: #00CED1; font-size: 14px; line-height: 1.6;">
                                <strong>📧 Confirmation email sent</strong><br>
                                <span style="color: #666;">The meeting link will be sent to you 15 minutes before our scheduled time.</span>
                            </p>
                        </div>

                        <!-- Call to Action -->
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${meetLink}" style="display: inline-block; background: linear-gradient(135deg, #FF7F50 0%, #00CED1 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(255,127,80,0.3); transition: all 0.3s;">
                                Add to Calendar
                            </a>
                        </div>

                        <!-- Notes Section (if provided) -->
                        ${notes ? `
                        <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid rgba(0,0,0,0.05);">
                            <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Your Notes</p>
                            <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">"${notes}"</p>
                        </div>
                        ` : ''}

                    </div>

                    <!-- Footer -->
                    <div style="background: linear-gradient(135deg, rgba(245,232,199,0.3) 0%, rgba(194,216,185,0.3) 100%); padding: 30px; text-align: center; border-top: 1px solid rgba(0,0,0,0.05);">
                        <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">
                            Need to reschedule? Just reply to this email.
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
            to: email,
            subject: `✅ Your ${type} is Confirmed - ${formattedDate}`,
            html: clientHtml,
        });

        // Your notification email (admin version)
        const notificationHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #F5E8C7 0%, #C2D8B9 100%); min-height: 100vh;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                
                <div style="background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%); backdrop-filter: blur(20px); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15);">
                    
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #00CED1 0%, #FF7F50 100%); padding: 40px 30px; text-align: center;">
                        <img src="https://awodi.netlify.app/bell.png" alt="Bell" style="width: 64px; height: auto; margin-bottom: 16px; display: inline-block;">
                        <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">New Meeting Alert!</h1>
                        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.95); font-size: 16px;">You have a new meeting scheduled</p>
                    </div>

                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        
                        <!-- Client Info -->
                        <div style="background: linear-gradient(135deg, rgba(0,206,209,0.08) 0%, rgba(255,127,80,0.08) 100%); border-left: 4px solid #00CED1; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                            <h2 style="margin: 0 0 20px 0; color: #00CED1; font-size: 20px; font-weight: 700;">Client Information</h2>
                            
                            <div style="margin-bottom: 12px;">
                                <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Name</span>
                                <div style="color: #333; font-size: 16px; font-weight: 600; margin-top: 4px;">${name}</div>
                            </div>
                            
                            <div style="margin-bottom: 12px;">
                                <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</span>
                                <div style="color: #333; font-size: 16px; font-weight: 600; margin-top: 4px;">
                                    <a href="mailto:${email}" style="color: #00CED1; text-decoration: none;">${email}</a>
                                </div>
                            </div>
                            
                            <div>
                                <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Meeting Type</span>
                                <div style="color: #333; font-size: 16px; font-weight: 600; margin-top: 4px;">${type}</div>
                            </div>
                        </div>

                        <!-- Meeting Details -->
                        <div style="background: linear-gradient(135deg, rgba(255,127,80,0.08) 0%, rgba(0,206,209,0.08) 100%); border-left: 4px solid #FF7F50; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                            <h2 style="margin: 0 0 20px 0; color: #FF7F50; font-size: 20px; font-weight: 700;">Meeting Details</h2>
                            
                            <div style="margin-bottom: 12px;">
                                <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                                 <img 
                                        src="https://awodi.netlify.app/weekend.png" 
                                        alt="Calendar Icon" 
                                        className="w-1 h-1 md:w-1 md:h-1 object-contain" 
                                        style={{ display: 'inline-block' }}
                                    />
                                 When
                                 </span>
                                <div style="color: #333; font-size: 16px; font-weight: 600; margin-top: 4px;">${formattedDate}</div>
                            </div>
                            
                            <div style="margin-bottom: 12px;">
                                <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">⏱️ Duration</span>
                                <div style="color: #333; font-size: 16px; font-weight: 600; margin-top: 4px;">${duration} minutes</div>
                            </div>
                            
                            <div>
                                <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">🔗 Meeting Link</span>
                                <div style="margin-top: 8px;">
                                    <a href="${meetLink}" style="display: inline-block; background: linear-gradient(135deg, #FF7F50 0%, #00CED1 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">Join Meeting</a>
                                </div>
                            </div>
                        </div>

                        <!-- Notes (if provided) -->
                        ${notes ? `
                        <div style="background: rgba(245,232,199,0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                            <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">📝 Client Notes</span>
                            <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 8px 0 0 0; font-style: italic;">"${notes}"</p>
                        </div>
                        ` : ''}

                        <!-- Quick Actions -->
                        <div style="text-align: center; margin-top: 32px;">
                            <p style="color: #888; font-size: 14px; margin-bottom: 16px;">Quick Actions</p>
                            <a href="mailto:${email}" style="display: inline-block; background: white; color: #00CED1; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; border: 2px solid #00CED1; margin: 0 8px 8px 0;">Reply to Client</a>
                            <a href="${meetLink}" style="display: inline-block; background: linear-gradient(135deg, #FF7F50 0%, #00CED1 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 0 0 8px 0;">Test Meeting Link</a>
                        </div>

                    </div>

                    <!-- Footer -->
                    <div style="background: linear-gradient(135deg, rgba(245,232,199,0.3) 0%, rgba(194,216,185,0.3) 100%); padding: 24px; text-align: center; border-top: 1px solid rgba(0,0,0,0.05);">
                        <p style="margin: 0; color: #666; font-size: 12px;">
                            Reminder will be sent to <strong>${name}</strong> 15 minutes before the meeting
                        </p>
                    </div>

                </div>

            </div>
        </body>
        </html>
        `;

        await transporter.sendMail({
            from: `"Meeting Scheduler" <${GMAIL_USER}>`,
            to: YOUR_EMAIL,
            subject: `🔔 New Meeting: ${name} - ${type}`,
            html: notificationHtml,
        });

        return { statusCode: 200, body: JSON.stringify({ success: true, data }) };
    } catch (emailError) {
        console.error('Email sending error:', emailError);
        return { statusCode: 500, body: JSON.stringify({ error: emailError.message }) };
    }
};
