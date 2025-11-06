import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405 };

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { name, email, date, time, duration, type, notes } = body;

  if (!name || !email || !date || !time || !duration || !type) {
    return { statusCode: 400, body: 'Missing fields' };
  }

  // Generate Meet link
  const meetLink = `https://meet.google.com/${Math.random().toString(36).substr(2, 9)}`;

  // Save to Supabase
  const { data, error } = await supabase
    .from('meetings')
    .insert({
      name,
      email,
      date,
      time: time.replace(' AM', '').replace(' PM', ''),
      duration,
      type,
      notes,
      meet_link: meetLink,
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    return { statusCode: 500, body: error.message };
  }

  const formattedDate = new Date(`${date}T${time}`).toLocaleString();

  try {
    console.log('Attempting to send emails...');
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('Client email (to): ', email);
    console.log('Your email (to): ', 'gackmar@gmail.com');
    // Client email
    await resend.emails.send({
      from: 'Awodi <no-reply@resend.dev>',
      to: email,
      subject: 'Meeting Confirmed!',
      html: `
        <h2>Meeting Scheduled!</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p><strong>${type}</strong> on <strong>${formattedDate}</strong> (${duration} min)</p>
        <p><em>Meeting link will be sent 15 minutes before.</em></p>
      `,
    });

    // Your email
    await resend.emails.send({
      from: 'New Booking <no-reply@resend.dev>',
      to: 'gackmar@gmail.com',
      subject: `New Meeting: ${name}`,
      html: `
        <h3>New Meeting!</h3>
        <p><strong>${name}</strong> (${email})</p>
        <p><strong>${type}</strong> on <strong>${formattedDate}</strong></p>
        <p><strong>Link:</strong> ${meetLink}</p>
      `,
    });

    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};