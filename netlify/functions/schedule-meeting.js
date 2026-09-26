// ES module syntax (import/export), because package.json declares
// "type": "module": every .js file in this repo is an ES module. This file
// used require()/exports (CommonJS), which Node refuses to load in an ES
// module scope. The live function crashed on load with a 502, and since
// Netlify began enforcing the check, every deploy failed (hotfix 0007).
// The Lambda-style handler signature is unchanged; ROADMAP P1.2 moves to
// Netlify's newer Request/Response API.
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Config
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const YOUR_EMAIL = process.env.YOUR_EMAIL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Meeting room (ROADMAP P1.1)
// A fixed, real room — a Zoom personal room or a Meet link made from the Meet
// homepage — configured in Netlify as MEETING_ROOM_URL. It replaces a URL that
// was generated from a random string and led nowhere.
//
// Why an env var and not src/config/site.js: anything in site.js ships in the
// public JavaScript bundle. The room should only reach people who have booked.
//
// Fail safe: if the variable is missing or isn't an https URL, this returns
// null. The client's email then says the link will follow, and the operator's
// copy flags the problem. A missing setting never produces a dead link.
const getMeetingRoom = () => {
    const raw = (process.env.MEETING_ROOM_URL || '').trim();
    try {
        const url = new URL(raw);
        return url.protocol === 'https:' ? url.toString() : null;
    } catch {
        return null;
    }
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
    },
});

export const handler = async (event) => {
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

    const meetingRoom = getMeetingRoom();

    // FIX #1: Parse the ISO string correctly to preserve user's local time
    const dateObj = new Date(dateTime);
    
    // Extract local date and time without timezone conversion
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = '00';

    const date = `${year}-${month}-${day}`;
    const parsedTime = `${hours}:${minutes}:${seconds}`;

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
            duration, type, notes,
            // Records which link this client was sent. '' rather than null
            // when no room is configured: the table's schema isn't in the
            // repo yet, so we can't be sure the column accepts null.
            meet_link: meetingRoom ?? '',
        })
        .select()
        .single();

    if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        return { statusCode: 500, body: JSON.stringify({ error: supabaseError.message }) };
    }

    // FIX #2: Format date for display in email (user's local time)
    const formattedDate = dateObj.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'America/New_York',
    });

    // FIX #3: Generate Google Calendar links with correct timezone handling
    // For Google Calendar, we use the local datetime as-is (no Z suffix)
    const startDateTime = new Date(dateObj.getTime());
    const endDateTime = new Date(dateObj.getTime() + duration * 60 * 1000);

    // Format as YYYYMMDDTHHMMSS (without Z - local time)
    const formatGCalTime = (d) => {
        const y = d.getFullYear();
        const mo = String(d.getMonth() + 1).padStart(2, '0');
        const da = String(d.getDate()).padStart(2, '0');
        const h = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        const s = String(d.getSeconds()).padStart(2, '0');
        return `${y}${mo}${da}T${h}${mi}${s}`;
    };

    const startGCalTime = formatGCalTime(startDateTime);
    const endGCalTime = formatGCalTime(endDateTime);

    const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(type + ' with ' + name)}&dates=${startGCalTime}/${endGCalTime}&details=${encodeURIComponent('Meeting Details:\nLink: ' + (meetingRoom || 'to follow by email') + '\nNotes: ' + (notes || 'None'))}${meetingRoom ? `&location=${encodeURIComponent(meetingRoom)}` : ''}&sf=true&output=xml`;

    // What the client is told about the link. The old text promised the link
    // "15 minutes before our scheduled time", but nothing sends it (the
    // reminder function was removed in 4838a4d). Only promise what happens.
    const clientLinkHtml = meetingRoom
        ? `<strong>🔗 Your meeting link</strong><br>
                                <a href="${meetingRoom}" target="_blank" rel="noopener noreferrer" style="color: #FF7F50; font-weight: 600;">Join the meeting</a><br>
                                <span style="color: #666;">You'll be let in when the meeting starts. The link is also in the calendar event below.</span>`
        : `<strong>🔗 Meeting link</strong><br>
                                <span style="color: #666;">I'll email you the meeting link before we meet.</span>`;

    // Shown only in the operator's copy, only when something needs doing.
    const operatorRoomNotice = meetingRoom ? '' : `
                        <div style="background: #FFF4E5; border-left: 4px solid #FF7F50; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
                            <p style="margin: 0; color: #8A4B00; font-size: 14px; line-height: 1.6;">
                                <strong>⚠️ Action needed: no meeting link was sent.</strong><br>
                                MEETING_ROOM_URL isn't set in Netlify (or isn't an https URL). The client was told you'll email the link — send it before the meeting.
                            </p>
                        </div>
`;

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
                        <img src="https://cc-archer.netlify.app/weekend.png" alt="Calendar" style="width: 64px; height: auto; margin-bottom: 16px; display: inline-block;">
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
                                        src="https://cc-archer.netlify.app/weekend.png" 
                                        alt="Calendar Icon" 
                                        style="width: 24px; height: 24px; display: inline-block;" 
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
                                ${clientLinkHtml}
                            </p>
                        </div>

                        <!-- Call to Action - FIX #4: Make button functional Google Calendar link -->
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${googleCalendarLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #FF7F50 0%, #00CED1 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(255,127,80,0.3); transition: all 0.3s;">
                                <img src="https://cc-archer.netlify.app/weekend.png" alt="Calendar" style="width: 16px; height: auto; margin-bottom: 0; display: inline-block; vertical-align: middle;"> Add to Google Calendar
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

        // Your notification email (admin version) - FIX #5: Add "Add to Calendar" button for admin too
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
                        <img src="https://cc-archer.netlify.app/bell.png" alt="Bell" style="width: 64px; height: auto; margin-bottom: 16px; display: inline-block;">
                        <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">New Meeting Alert!</h1>
                        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.95); font-size: 16px;">You have a new meeting scheduled</p>
                    </div>

                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        
${operatorRoomNotice}
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
                                <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;"><img src="https://cc-archer.netlify.app/weekend.png" alt="Calendar" style="width: 16px; height: auto; margin-bottom: 0; display: inline-block; vertical-align: middle;"> When</span>
                                <div style="color: #333; font-size: 16px; font-weight: 600; margin-top: 4px;">${formattedDate}</div>
                            </div>
                            
                            <div style="margin-bottom: 12px;">
                                <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">⏱️ Duration</span>
                                <div style="color: #333; font-size: 16px; font-weight: 600; margin-top: 4px;">${duration} minutes</div>
                            </div>
                        </div>

                        <!-- Notes (if provided) -->
                        ${notes ? `
                        <div style="background: rgba(245,232,199,0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                            <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">📝 Client Notes</span>
                            <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 8px 0 0 0; font-style: italic;">"${notes}"</p>
                        </div>
                        ` : ''}

                        <div style="text-align: center; margin-top: 32px;">
                            <div style="display: inline-block;">
                                <a href="${googleCalendarLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #00CED1 0%, #FF7F50 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 0 0 8px 8px;"><img src="https://cc-archer.netlify.app/weekend.png" alt="Calendar" style="width: 16px; height: auto; margin-bottom: 0; display: inline-block; vertical-align: middle;"> Add to Calendar</a>
                            </div>
                        </div>

                    </div>

                    <!-- Footer -->
                    <div style="background: linear-gradient(135deg, rgba(245,232,199,0.3) 0%, rgba(194,216,185,0.3) 100%); padding: 24px; text-align: center; border-top: 1px solid rgba(0,0,0,0.05);">
                        <p style="margin: 0; color: #666; font-size: 12px;">
                            Meeting is all set.
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