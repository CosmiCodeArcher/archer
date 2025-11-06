# backend/functions/send-reminder.py
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from supabase import create_client, Client
import os
from datetime import datetime, timedelta

# Config
GMAIL_USER = os.environ['GMAIL_USER']
GMAIL_APP_PASSWORD = os.environ['GMAIL_APP_PASSWORD']
YOUR_EMAIL = os.environ['YOUR_EMAIL']
SUPABASE_URL = os.environ['SUPABASE_URL']
SUPABASE_KEY = os.environ['SUPABASE_ANON_KEY']

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def send_email(to_email, subject, html_body):
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = GMAIL_USER
    msg['To'] = to_email
    msg.attach(MIMEText(html_body, 'html'))

    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
    text = msg.as_string()
    server.sendmail(GMAIL_USER, to_email, text)
    server.quit()

def handler(event, context):
    now = datetime.utcnow()
    # Look for meetings scheduled within the next 30 minutes that haven't had a reminder sent
    # Adjust this logic based on how frequently this function will be triggered (e.g., via Netlify Scheduled Functions)
    in_30_min = now + timedelta(minutes=30)

    # Fetch meetings from Supabase
    # Assuming 'time' column stores HH:MM:SS
    # and 'date' column stores YYYY-MM-DD
    data, count = supabase.table('meetings').select('*').eq('reminder_sent', False).execute()

    if count == 0 or not data:
        return {'statusCode': 200, 'body': 'No meetings found or no data returned.'}

    meetings = data[1] # Actual data is usually in the second element for a single select

    for m in meetings:
        try:
            # Combine date and time, assuming 'YYYY-MM-DD' and 'HH:MM:SS' format from DB
            meeting_datetime_str = f"{m['date']} {m['time']}"
            meeting_datetime = datetime.strptime(meeting_datetime_str, '%Y-%m-%d %H:%M:%S')

            # Check if the meeting is within the reminder window (e.g., 15-30 minutes before)
            # This logic might need refinement based on exact desired reminder timing
            time_until_meeting = meeting_datetime - now
            
            # Send reminder if meeting is in the next 30 minutes and reminder_sent is False
            # And it's not too close to the meeting (e.g., more than 5 minutes away to avoid sending after start)
            if timedelta(minutes=5) < time_until_meeting <= timedelta(minutes=30):
                formatted_date = meeting_datetime.strftime('%A, %B %d, %Y at %I:%M %p')
                reminder_html = f"""
                <html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h3 style="color:#FF7F50;">Meeting Reminder!</h3>
                <p>Hi <strong>{m['name']}</strong>,</p>
                <p>Your <strong>{m['type']}</strong> meeting is starting soon!</p>
                <p><strong>Date & Time:</strong> {formatted_date}</p>
                <p><strong>Join here:</strong> <a href="{m['meet_link']}" style="color:#FF7F50;">Google Meet</a></p>
                <hr><p style="font-size:12px;color:#666;">Awodi Portfolio</p>
                </body></html>
                """
                send_email(m['email'], 'Reminder: Your Meeting is Starting Soon!', reminder_html)
                send_email(YOUR_EMAIL, f'Reminder Sent: {m["name"]}', f'<p>Reminder sent to {m["email"]} for meeting {m["name"]} at {formatted_date}.</p>')


                # Update reminder_sent status in Supabase
                supabase.table('meetings').update({'reminder_sent': True}).eq('id', m['id']).execute()
        except Exception as e:
            print(f"Error processing reminder for meeting {m.get('id', 'N/A')}: {e}")
            # Continue to next meeting even if one fails

    return {'statusCode': 200, 'body': 'Reminder function executed.'}
