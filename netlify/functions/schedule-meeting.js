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

    const { name, email, date, time, duration, type, notes } = body;

    if (!name || !email || !date || !time || !duration || !type) {
        return { statusCode: 400, body: 'Missing fields' };
    }

    // Generate Meet link
    const meetLink = `https://meet.google.com/${Math.random().toString(36).substr(2, 9)}`;

    let parsedTime = time.trim();
    const [hourStr, minuteStr] = parsedTime.split(':');
    let hour = parseInt(hourStr, 10);
    const isPm = parsedTime.toLowerCase().includes('pm');

    if (isPm && hour < 12) {
        hour += 12;
    } else if (!isPm && hour === 12) {
        hour = 0; // 12 AM is 00 in 24-hour format
    }
    parsedTime = `${String(hour).padStart(2, '0')}:${minuteStr.split(' ')[0]}:00`;

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
    const dateObj = new Date(`${date}T${parsedTime}`);
    const formattedDate = dateObj.toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: 'numeric', hour12: true,
    });

    try {
        // Client email
        const clientHtml = `
        <html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#FF7F50;">Meeting Scheduled!</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thanks for booking a <strong>${type}</strong>!</p>
        <p><strong>Date & Time:</strong> ${formattedDate} (${duration} min)</p>
        <p><em>Meeting link will be sent 15 minutes before.</em></p>
        <hr><p style="font-size:12px;color:#666;">Awodi Portfolio</p>
        </body></html>
        `;
        await transporter.sendMail({
            from: GMAIL_USER,
            to: email,
            subject: 'Your Meeting is Confirmed!',
            html: clientHtml,
        });

        // Your notification
        const notificationHtml = `
        <html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h3 style="color:#00CED1;">New Meeting Booked!</h3>
        <p><strong>Client:</strong> ${name} (${email})</p>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>When:</strong> ${formattedDate}</p>
        <p><strong>Notes:</strong> ${notes || 'None'}</p>
        <p><strong>Meet Link:</strong> <a href="${meetLink}" style="color:#FF7F50;">${meetLink}</a></p>
        <hr><p style="font-size:12px;color:#666;">Reply to confirm.</p>
        </body></html>
        `;
        await transporter.sendMail({
            from: GMAIL_USER,
            to: YOUR_EMAIL,
            subject: `New Meeting: ${name}`,
            html: notificationHtml,
        });

        return { statusCode: 200, body: JSON.stringify({ success: true, data }) };
    } catch (emailError) {
        console.error('Email sending error:', emailError);
        return { statusCode: 500, body: JSON.stringify({ error: emailError.message }) };
    }
};
