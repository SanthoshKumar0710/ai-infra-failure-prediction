"""Email delivery utility for OTP and platform notifications.

Uses Python's standard smtplib with STARTTLS/SSL support.
If SMTP settings are not configured, it gracefully falls back to structured logging
so development, testing, and initial deployments work without third-party email dependencies.
"""

from __future__ import annotations

import asyncio
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings
from app.core.logging_config import get_logger

logger = get_logger(__name__)


def _send_smtp_email_sync(
    recipient: str,
    subject: str,
    html_content: str,
    text_content: str,
) -> bool:
    """Synchronous SMTP email delivery."""
    if not settings.SMTP_HOST:
        logger.info(
            "smtp_not_configured_skipping_email",
            extra={"recipient": recipient, "subject": subject},
        )
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM_EMAIL
    msg["To"] = recipient

    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    try:
        if settings.SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
            server.starttls()

        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)

        server.sendmail(settings.SMTP_FROM_EMAIL, [recipient], msg.as_string())
        server.quit()
        logger.info("smtp_email_sent_successfully", extra={"recipient": recipient})
        return True
    except Exception as exc:
        logger.error(
            "smtp_email_delivery_failed",
            extra={"recipient": recipient, "error": str(exc)},
        )
        return False


async def send_otp_email(recipient: str, otp: str) -> bool:
    """Send a 6-digit password reset OTP to the user's email address."""
    subject = f"Your InfraSafe AI Password Reset OTP: {otp}"

    text_content = (
        f"Hello,\n\n"
        f"You requested to reset your password for InfraSafe AI Platform.\n"
        f"Your verification code is: {otp}\n\n"
        f"This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes.\n"
        f"If you did not request this, please ignore this email.\n\n"
        f"InfraSafe AI Security Team"
    )

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #040711; color: #f1f5f9; padding: 24px; margin: 0; }}
        .container {{ max-width: 480px; margin: 0 auto; background: #0b1120; border: 1px solid #1e293b; border-radius: 12px; padding: 32px; }}
        .logo {{ font-size: 20px; font-weight: 700; color: #6366f1; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }}
        h1 {{ font-size: 22px; margin-bottom: 12px; color: #f8fafc; }}
        p {{ color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }}
        .otp-box {{ background: #131b2e; border: 2px dashed #6366f1; border-radius: 8px; padding: 18px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #818cf8; margin-bottom: 24px; }}
        .footer {{ font-size: 13px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 16px; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">⚡ InfraSafe AI</div>
        <h1>Password Reset Verification</h1>
        <p>You requested a one-time verification code to reset your password. Use the 6-digit OTP below to complete the reset and sign in:</p>
        <div class="otp-box">{otp}</div>
        <p>This code will expire in <strong>{settings.OTP_EXPIRE_MINUTES} minutes</strong>. If you did not make this request, you can safely disregard this email.</p>
        <div class="footer">InfraSafe AI Failure Prediction Platform • Automated Security Notification</div>
      </div>
    </body>
    </html>
    """

    # Always log OTP in server logs for zero-friction debugging
    logger.info("password_reset_otp_generated", extra={"recipient": recipient, "otp": otp})

    # Run blocking SMTP IO in thread pool
    return await asyncio.to_thread(
        _send_smtp_email_sync,
        recipient,
        subject,
        html_content,
        text_content,
    )
