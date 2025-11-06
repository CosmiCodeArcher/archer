import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from supabase import create_client, Client
import os
from datetime import datetime
import random
import string

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
    if event['httpMethod'] != 'POST':
        return {'statusCode': 405, 'body': 'Method Not Allowed'}

    body = json.loads(event['body'])
    name = body.get('name')
    email = body.get('email')
    date = body.get('date')
    time = body.get('time')
    duration = body.get('duration')
    type_ = body.get('type')
    notes = body.get('notes', '')

    if not all([name, email, date, time, duration, type_]):
        return {'statusCode': 400, 'body': 'Missing fields'}

    # Generate Meet link
    meet_link = f"https://meet.google.com/{''.join(random.choices(string.ascii_lowercase + string.digits, k=9))}-{''.join(random.choices(string.ascii_lowercase + string.digits, k=3))}-{''.join(random.choices(string.ascii_lowercase + string.digits, k=3))}"

    # Clean time
    db_time = time.replace(' AM', ':00').replace(' PM', ':00').split(' ')[0]

    # Save to Supabase
    data, count = supabase.table('meetings').insert({
        'name': name, 'email': email, 'date': date, 'time': db_time,
        'duration': duration, 'type': type_, 'notes': notes, 'meet_link': meet_link
    }).execute()

    if len(data) == 0:
        return {'statusCode': 500, 'body': 'DB error'}

    # Format date
    date_obj = datetime.strptime(f"{date} {time}", '%Y-%m-%d %I:%M %p')
    formatted_date = date_obj.strftime('%A, %B %d, %Y at %I:%M %p')

    # Client email
    client_html = f"""
    <html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
    <h2 style="color:#FF7F50;">Meeting Scheduled!</h2>
    <p>Hi <strong>{name}</strong>,</p>
    <p>Thanks for booking a <strong>{type_}</strong>!</p>
    <p><strong>Date & Time:</strong> {formatted_date} ({duration} min)</p>
    <p><em>Meeting link will be sent 15 minutes before.</em></p>
    <hr><p style="font-size:12px;color:#666;">Awodi Portfolio</p>
    </body></html>
    """
    send_email(email, 'Your Meeting is Confirmed!', client_html)

    # Your notification
    notification_html = f"""
    <html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
    <h3 style="color:#00CED1;">New Meeting Booked!</h3>
    <p><strong>Client:</strong> {name} ({email})</p>
    <p><strong>Type:</strong> {type_}</p>
    <p><strong>When:</strong> {formatted_date}</p>
    <p><strong>Notes:</strong> {notes or 'None'}</p>
    <p><strong>Meet Link:</strong> <a href="{meet_link}" style="color:#FF7F50;">{meet_link}</a></p>
    <hr><p style="font-size:12px;color:#666;">Reply to confirm.</p>
    </body></html>
    """
    send_email(YOUR_EMAIL, f'New Meeting: {name}', notification_html)

    return {'statusCode': 200, 'body': json.dumps({'success': True})}