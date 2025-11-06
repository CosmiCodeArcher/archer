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
      from: 'Awodi <onboarding@resend.dev>',
      to: 'gackmar@gmail.com',
      subject: 'Meeting Confirmed!',
      html: `
        <p>Your meeting is confirmed.</p>
      `,
    });

    console.log('Attempting to send client email with:');
    console.log('  From:', 'Awodi <onboarding@resend.dev>');
    console.log('  To:', 'gackmar@gmail.com');
    console.log('  Subject:', 'Meeting Confirmed!');

    // Your email
    await resend.emails.send({
      from: 'New Booking <onboarding@resend.dev>',
      to: 'gackmar@gmail.com',
      subject: `New Meeting: ${name}`,
      html: `
        <h3>New Meeting!</h3>
        <p><strong>${name}</strong> (${email})</p>
        <p><strong>${type}</strong> on <strong>${formattedDate}</strong></p>
        <p><strong>Link:</strong> ${meetLink}</p>
      `,
    });

    console.log('Attempting to send your email with:');
    console.log('  From:', 'New Booking <onboarding@resend.dev>');
    console.log('  To:', 'gackmar@gmail.com');
    console.log('  Subject:', `New Meeting: ${name}`);

    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    console.error('Error sending emails:', err);
    return { statusCode: 500, body: err.message };
  }
};