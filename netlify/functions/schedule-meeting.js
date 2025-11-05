import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { name, email, date, time, duration, notes, type } = body;

  // Validate required fields
  if (!name || !email || !date || !time || !duration || !type) {
    return { statusCode: 400, body: 'Missing required fields' };
  }

  // Generate Google Meet link
  const meetLink = `https://meet.google.com/${Math.random().toString(36).substr(2, 9)}`;

  // Format date for email
  const dateObj = new Date(`${date}T${time}`);
  const formattedDate = dateObj.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  try {
    // Email to Client
    await resend.emails.send({
      from: 'Awodi <no-reply@resend.dev>',
      to: email,
      subject: 'Your Meeting is Confirmed!',
      html: `
        <h2>Meeting Scheduled!</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p><strong>${type}</strong> on <strong>${formattedDate}</strong> (${duration} min)</p>
        <p><em>Meeting link will be sent 15 minutes before.</em></p>
        <hr>
        <p><small>Awodi Portfolio</small></p>
      `,
    });

    // Email to You
    await resend.emails.send({
      from: 'New Booking <no-reply@resend.dev>',
      to: 'gackmar@gmail.com', // CHANGE THIS
      subject: `New Meeting: ${name}`,
      html: `
        <h3>New Meeting!</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>When:</strong> ${formattedDate}</p>
        <p><strong>Notes:</strong> ${notes || 'None'}</p>
        <p><strong>Meet Link:</strong> ${meetLink}</p>
      `,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, meetLink }),
    };
  } catch (err) {
    console.error('Resend error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};