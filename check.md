**User**

I just booked a meeting to test, the email is "Meeting Scheduled!
Hi Gackmar,

Thanks for booking a Quick Chat!

Date & Time: Tuesday, November 11, 2025 at 2:00 PM (15 min)

Meeting link will be sent 15 minutes before.

Awodi Portfolio" I used today's date to book from the frontend but it's showing yesterday's date.

---

**Cursor**

You're absolutely right to catch that! Showing yesterday's date when you booked for today is a classic **timezone issue**.

Here's why this is happening:

1.  **`new Date(`${date}T${parsedTime}`)`**: When you create a `Date` object this way without explicitly stating a timezone offset (e.g., `Z` for UTC, or `+05:00` for an offset), JavaScript's `Date` constructor often assumes the date/time string is in **UTC**.
2.  **`dateObj.toLocaleString('en-US', { ... })`**: The `toLocaleString` method, by default, formats the date and time according to the **server's local timezone**.

If Netlify's server (where your function runs) is in a timezone significantly behind yours, a UTC time that is "today" for you might still be "yesterday" for the server's local time, causing the date to shift back.

To fix this, we need to ensure consistency. The most robust way is to either:
*   **Parse the input as a specific local time:** Treat the `date` and `time` as local to the user, create the `Date` object, and then format it.
*   **Force UTC parsing and then format as local:** Parse as UTC, but then explicitly format for a desired local timezone.

Given your input likely doesn't include a timezone, the simplest and most effective fix is to explicitly parse the `date` and `time` as a local date-time string, effectively telling `new Date()` that the input is already in the intended timezone.

I'll modify `netlify/functions/schedule-meeting.js` to construct the `Date` object in a way that better handles local time input, and explicitly specify `timeZone: 'UTC'` during formatting to prevent implicit server timezone shifts, or use a method that handles local time directly.

Let's adjust the `dateObj` creation and `formattedDate` generation in `netlify/functions/schedule-meeting.js`.

```javascript
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
    // Construct date using individual components to avoid timezone issues with string parsing
    // Assuming date is 'YYYY-MM-DD' and parsedTime is 'HH:MM:SS'
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute, second] = parsedTime.split(':').map(Number);
    const dateObj = new Date(year, month - 1, day, hour, minute, second); // Month is 0-indexed
    
    const formattedDate = dateObj.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        // Explicitly set timezone to prevent server timezone interference.
        // Using 'UTC' or client's timezone if known is often best.
        // For simple dates, local conversion is often desired.
        // Let's remove timeZone for now and rely on client's input parsed directly.
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

```

I've updated `netlify/functions/schedule-meeting.js` to create the `Date` object by parsing the year, month, day, hour, minute, and second components individually. This method is generally more reliable for handling date/time strings without explicit timezone information, as `new Date(year, monthIndex, day, hours, minutes, seconds)` creates a date object in the *local timezone* of the system running the code.

This should prevent the timezone shift and result in the correct date.

**Now, please redeploy your Netlify site.**

After redeploying, book another meeting and check the emails. The "When:" field should now display the correct date and time. Let me know the results!

---

**User**

There's an error in line 74 in @schedule-meeting.js that says Cannot redeclare block-scoped variable 'hour'.

---

**Cursor**

You're absolutely right! My apologies. That's a classic JavaScript scope error that I introduced when refactoring the date parsing. The `hour` variable was declared twice within the same scope.

I will fix this by renaming the `hour` variable in the date parsing section (line 74) to `parsedHour` to avoid the redeclaration conflict.

Here's how I'll modify `netlify/functions/schedule-meeting.js`:

```javascript
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
    // Construct date using individual components to avoid timezone issues with string parsing
    // Assuming date is 'YYYY-MM-DD' and parsedTime is 'HH:MM:SS'
    const [year, month, day] = date.split('-').map(Number);
    const [parsedHour, minute, second] = parsedTime.split(':').map(Number);
    const dateObj = new Date(year, month - 1, day, parsedHour, minute, second); // Month is 0-indexed
    
    const formattedDate = dateObj.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        // Explicitly set timezone to prevent server timezone interference.
        // Using 'UTC' or client's timezone if known is often best.
        // For simple dates, local conversion is often desired.
        // Let's remove timeZone for now and rely on client's input parsed directly.
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

```

I've fixed the "Cannot redeclare block-scoped variable 'hour'" error in `netlify/functions/schedule-meeting.js` by renaming the second instance of `hour` to `parsedHour`.

**Now, please redeploy your Netlify site.**

After redeploying, book another meeting to test. The date should now be correctly parsed and displayed in the emails, and the error should be gone. Let me know the results!

---

**User**

It's still doing it "Meeting Scheduled!
Hi Gackmar,

Thanks for booking a Quick Chat!

Date & Time: Tuesday, November 11, 2025 at 2:00 PM (15 min)

Meeting link will be sent 15 minutes before.

Awodi Portfolio"

---

**Cursor**

You're right, the "Date & Time: Tuesday, November 11, 2025 at 2:00 PM" when you booked for November 12, 2025, is a classic **timezone parsing issue**. My previous attempt to fix it wasn't robust enough for Netlify's server environment.

When `new Date()` receives a date string without explicit timezone information, it often defaults to UTC, and then `toLocaleString` formats it based on the server's local timezone. If the server's timezone is behind yours, a time that's "today" in your local time could be "yesterday" in the server's UTC-interpreted time when `toLocaleString` converts it back to the server's actual local time.

To ensure consistency, we need to explicitly tell JavaScript's `Date` constructor to interpret the combined date and time as **UTC**, and then `toLocaleString` will convert that UTC time to a human-readable string based on the desired locale/timezone.

I'll modify `netlify/functions/schedule-meeting.js` to combine the `date` and `parsedTime` into an ISO 8601 string and append a `'Z'` (Zulu time/UTC) to it. This forces `new Date()` to interpret it as UTC, preventing any implicit timezone shifts from the server. Then, `toLocaleString` will correctly format that UTC timestamp into the desired locale.

Here's how I'll modify `netlify/functions/schedule-meeting.js`:

```javascript
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
    // Construct date using individual components to avoid timezone issues with string parsing
    // Assuming date is 'YYYY-MM-DD' and parsedTime is 'HH:MM:SS'
    const dateIsoString = `${date}T${parsedTime}Z`; // Force UTC interpretation
    const dateObj = new Date(dateIsoString);
    
    const formattedDate = dateObj.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        // Explicitly set timezone to prevent server timezone interference.
        // Using 'UTC' or client's timezone if known is often best.
        // For simple dates, local conversion is often desired.
        // Let's remove timeZone for now and rely on client's input parsed directly.
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

```

I've modified `netlify/functions/schedule-meeting.js` to create the `Date` object by constructing an ISO 8601 string and appending `'Z'` to explicitly indicate UTC. This should force the date to be interpreted as the exact date and time you provide, without any implicit server timezone conversions, and `toLocaleString` will then format it correctly for the desired locale.

**Now, please redeploy your Netlify site.**

After redeploying, book another meeting using today's date and time from your frontend. The emails should now display the correct, intended date and time. Let me know the results!

