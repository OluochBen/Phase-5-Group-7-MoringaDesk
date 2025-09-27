from flask import current_app
import smtplib
from email.mime.text import MIMEText

def send_reset_email(to_email, token):
    reset_link = f"{current_app.config.get('FRONTEND_URL')}/reset-password?token={token}"
    msg = MIMEText(f"Click here to reset your password: {reset_link}")
    msg["Subject"] = "Password Reset"
    msg["From"] = current_app.config.get("MAIL_FROM", "noreply@example.com")
    msg["To"] = to_email

    with smtplib.SMTP(current_app.config.get("SMTP_HOST", "localhost"), current_app.config.get("SMTP_PORT", 25)) as server:
        if current_app.config.get("SMTP_USER"):
            server.login(current_app.config["SMTP_USER"], current_app.config["SMTP_PASS"])
        server.sendmail(msg["From"], [to_email], msg.as_string())
