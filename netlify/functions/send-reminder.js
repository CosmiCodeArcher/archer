import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const handler = async () => {
  const now = new Date();
  const in15Min = new Date(now.getTime() + 15 * 60 * 1000);

  const { data: meetings, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('reminder_sent', false)
    .lte('date', in15Min.toISOString().split('T')[0])
    .gte('date', now.toISOString().split('T')[0]);

  if (error || !meetings) return { statusCode: 200 };

  for (const m of meetings) {
    const meetingTime = new Date(`${m.date}T${m.time}`);
    const diff = Math.abs(meetingTime - in15Min);

    if (diff < 60 * 1000) {  // Within 1 min
      await resend.emails.send({
        from: 'Reminder <hello@resend.dev>',
        to: [m.email, 'gackmar@gmail.com'],
        subject: 'Meeting in 15 Minutes!',
        html: `
          <h2>Meeting Starts Soon!</h2>
          <p>Hi ${m.name},</p>
          <p>Your call is in 15 minutes.</p>
          <p><a href="${m.meet_link}">Join Google Meet</a></p>
        `,
      });

      await supabase
        .from('meetings')
        .update({ reminder_sent: true })
        .eq('id', m.id);
    }
  }

  return { statusCode: 200 };
};