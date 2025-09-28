# backend/app/utils/email_utils.py
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

def send_reset_email(to_email, token):
    sender_email = os.getenv("MAIL_USERNAME")
    password = os.getenv("MAIL_PASSWORD")

    # Build email
    message = MIMEMultipart("alternative")
    message["Subject"] = "MoringaDesk Password Reset"
    message["From"] = sender_email
    message["To"] = to_email

    reset_link = f"http://localhost:5173/reset-password?token={token}"
    text = f"Use this link to reset your password:\n\n{reset_link}\n\nOr token:\n{token}"
    html = f"""
    <html>
      <body>
        <p>Click the link below to reset your password:<br>
           <a href="{reset_link}">{reset_link}</a>
        </p>
        <p><b>Or use this token:</b> {token}</p>
      </body>
    </html>
    """

    message.attach(MIMEText(text, "plain"))
    message.attach(MIMEText(html, "html"))

    try:
        # Prefer TLS (587)
        context = ssl.create_default_context()
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls(context=context)
            server.login(sender_email, password)
            server.sendmail(sender_email, to_email, message.as_string())
        print("✅ Reset email sent via TLS (587)")

    except Exception as e1:
        print(f"⚠️ TLS failed: {e1}")
        try:
            # Fallback to SSL (465)
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
                server.login(sender_email, password)
                server.sendmail(sender_email, to_email, message.as_string())
            print("✅ Reset email sent via SSL (465)")

        except Exception as e2:
            # If both fail, log the token for testing
            print(f"❌ Failed to send email: {e2}")
            print(f"🔑 DEBUG TOKEN for {to_email}: {token}")
