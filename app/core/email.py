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

import httpx

from app.core.config import settings
from app.core.logging_config import get_logger

logger = get_logger(__name__)


async def _send_resend_email_async(
    recipient: str,
    subject: str,
    html_content: str,
) -> tuple[bool, str]:
    """Send an email using Resend HTTP REST API."""
    if not settings.RESEND_API_KEY:
        return False, "RESEND_API_KEY is not configured."

    sender = settings.SMTP_FROM_EMAIL
    # Resend sandbox default if custom domain isn't verified
    if not sender or sender.endswith("@infra-safe.ai"):
        sender = "InfraSafe AI <onboarding@resend.dev>"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY.strip()}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": sender,
                    "to": [recipient],
                    "subject": subject,
                    "html": html_content,
                },
            )
            if resp.status_code in (200, 201):
                logger.info("resend_email_sent_successfully", extra={"recipient": recipient})
                return True, "Email sent successfully via Resend"
            else:
                try:
                    err_json = resp.json()
                    err_msg = err_json.get("message") or str(err_json)
                except Exception:
                    err_msg = resp.text
                logger.error(
                    "resend_email_failed",
                    extra={"recipient": recipient, "status": resp.status_code, "body": resp.text},
                )
                return False, f"Resend API error ({resp.status_code}): {err_msg}"
    except Exception as exc:
        logger.error(
            "resend_email_request_error",
            extra={"recipient": recipient, "error": str(exc)},
        )
        return False, f"Resend connection failed: {str(exc)}"


def _send_smtp_email_sync(
    recipient: str,
    subject: str,
    html_content: str,
    text_content: str,
) -> tuple[bool, str]:
    """Synchronous SMTP email delivery."""
    if not settings.SMTP_HOST:
        return False, "SMTP_HOST is not configured."

    sender = settings.SMTP_FROM_EMAIL
    # When using Gmail / Outlook SMTP, From must match the authenticated user
    if settings.SMTP_USER and ("@" in settings.SMTP_USER) and sender.endswith("@infra-safe.ai"):
        sender = settings.SMTP_USER

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = recipient

    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    try:
        if settings.SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12)
            server.ehlo()
            server.starttls()
            server.ehlo()

        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)

        server.sendmail(sender, [recipient], msg.as_string())
        server.quit()
        logger.info("smtp_email_sent_successfully", extra={"recipient": recipient})
        return True, "Email sent successfully via SMTP"
    except Exception as exc:
        logger.error(
            "smtp_email_delivery_failed",
            extra={"recipient": recipient, "error": str(exc)},
        )
        return False, f"SMTP delivery failed: {str(exc)}"


async def send_otp_email(recipient: str, otp: str) -> tuple[bool, str]:
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

    reasons: list[str] = []

    # 1. Try SMTP first if configured (e.g. Gmail SMTP can send to ANY email address with 0 sandbox restrictions)
    if settings.SMTP_HOST:
        smtp_ok, smtp_reason = await asyncio.to_thread(
            _send_smtp_email_sync,
            recipient,
            subject,
            html_content,
            text_content,
        )
        if smtp_ok:
            return True, smtp_reason
        reasons.append(smtp_reason)

    # 2. Try Resend HTTP API as alternate / fallback
    if settings.RESEND_API_KEY:
        resend_ok, resend_reason = await _send_resend_email_async(recipient, subject, html_content)
        if resend_ok:
            return True, resend_reason
        reasons.append(resend_reason)

    if not reasons:
        reasons.append(
            "No email service configured. Please ensure RESEND_API_KEY or SMTP_HOST is set in Render environment variables."
        )

    logger.warning("email_dispatch_failed", extra={"recipient": recipient, "reasons": reasons})
    return False, " | ".join(reasons)
