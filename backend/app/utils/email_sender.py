import smtplib
import logging
from email.message import EmailMessage
from smtplib import SMTPAuthenticationError, SMTPException
from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(to_email: str, content: str):
    """
    Send an email using SMTP. Returns True on success, False on failure.
    """
    try:
        # Strip whitespace from credentials in case they were read incorrectly
        email = settings.SMTP_EMAIL.strip()
        password = settings.SMTP_PASSWORD.strip()
        
        if not email or not password:
            logger.error("SMTP_EMAIL or SMTP_PASSWORD is empty")
            return False
        
        # Debug info (don't log password, just length)
        logger.debug(f"Attempting to send email from {email} (password length: {len(password)})")
        
        # Gmail app passwords are 16 characters. Warn if different.
        if len(password) != 16:
            logger.warning(f"Password length is {len(password)} characters. Gmail App Passwords are typically 16 characters.")
        
        msg = EmailMessage()
        msg["Subject"] = "Benny App - Verification OTP"
        msg["From"] = email
        msg["To"] = to_email
        msg.set_content(content)

        # Try SMTP_SSL first (port 465)
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as smtp:
                smtp.login(email, password)
                smtp.send_message(msg)
            logger.info(f"Email sent successfully to {to_email}")
            return True
        except SMTPAuthenticationError:
            # If SSL fails, try STARTTLS (port 587) as fallback
            logger.info("SMTP_SSL failed, trying STARTTLS on port 587...")
            try:
                with smtplib.SMTP("smtp.gmail.com", 587, timeout=10) as smtp:
                    smtp.starttls()
                    smtp.login(email, password)
                    smtp.send_message(msg)
                logger.info(f"Email sent successfully to {to_email} via STARTTLS")
                return True
            except SMTPAuthenticationError as e2:
                logger.error(f"SMTP Authentication failed on both SSL and STARTTLS: {e2}")
                logger.error("=" * 60)
                logger.error("TROUBLESHOOTING GMAIL SMTP:")
                logger.error("1. Make sure you're using a Gmail App Password (16 characters)")
                logger.error("2. Generate a new App Password at: https://myaccount.google.com/apppasswords")
                logger.error("3. Select 'Mail' as the app and 'Other' as the device")
                logger.error("4. Copy the 16-character password (no spaces) to your .env file")
                logger.error("5. Make sure 2-Step Verification is enabled on your Google account")
                logger.error("6. Check that your .env file has no quotes around the password")
                logger.error(f"7. Current email: {email}, password length: {len(password)}")
                logger.error("=" * 60)
                return False
            except Exception as e2:
                logger.error(f"STARTTLS connection failed: {e2}")
                return False
        
    except SMTPException as e:
        logger.error(f"SMTP error: {e}")
        return False
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False
