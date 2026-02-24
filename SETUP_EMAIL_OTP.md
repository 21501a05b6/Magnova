# Email OTP Setup Guide

## Overview

The registration system now sends OTP (One-Time Password) via email for email verification. To enable this feature, you need to configure your email credentials.

## Setup Instructions for Gmail

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to https://myaccount.google.com/
2. Click "Security" in the left sidebar
3. Scroll down to "How you sign in to Google"
4. Enable "2-Step Verification"

### Step 2: Create an App Password
1. Go back to the Security section
2. Scroll down and find "App passwords"
3. Select "Mail" and "Windows Computer"
4. Google will generate a 16-character password
5. Copy this password

### Step 3: Update .env File
Open `backend/.env` and update:

```env
SENDER_EMAIL=jyoshnamoturi@gmail.com
SENDER_PASSWORD=xxxx xxxx xxxx xxxx
```

**Note:** The password has spaces - copy it exactly as Google provides it.

## How It Works

1. User enters email and clicks "Verify"
2. System validates the email format
3. OTP is generated (6 digits) and stored in MongoDB with 10-minute expiry
4. OTP is sent to the email address
5. User enters the OTP to verify their email
6. Once verified, they can complete registration

## Database Storage

All OTPs are stored in the `email_otps` collection in MongoDB with:
- `email`: The email address
- `otp`: The 6-digit OTP code
- `created_at`: When OTP was generated
- `expires_at`: When OTP expires (10 minutes)

Once verified, OTP record is automatically deleted from the database.

## Error Messages

- **"Invalid email format"** - Email doesn't match standard format
- **"Email already registered"** - Email is already in use
- **"Failed to send OTP email"** - Email credentials are not configured
- **"OTP not found"** - OTP has been deleted or not generated yet
- **"OTP expired"** - 10 minutes have passed since generation
- **"Incorrect OTP"** - The entered OTP doesn't match

## Testing

### Option 1: Use a Test Email Service (Recommended for Development)
Use a service like:
- Mailtrap.io (free tier available)
- Ethereal Email (instant test account)
- MailHog (local SMTP server)

### Option 2: Use Real Gmail
Follow the steps above to configure real Gmail account.

## Troubleshooting

If emails are not sending:

1. **Check .env file configuration**
   ```bash
   cat backend/.env | grep SENDER
   ```

2. **Check backend logs** for SMTP errors
   ```
   SMTP authentication failed. Check SENDER_EMAIL and SENDER_PASSWORD.
   ```

3. **Verify Gmail App Password**
   - Make sure you copied the entire 16-character password with spaces
   - Don't use your regular Gmail password

4. **Check MongoDB connection**
   - Ensure OTP is being saved to database before sending

## Alternative Email Providers

If you prefer to use a different email provider:

```env
# For Outlook
SMTP_SERVER=smtp.office365.com
SMTP_PORT=587
SENDER_EMAIL=your-email@outlook.com
SENDER_PASSWORD=your-password

# For SendGrid
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
SENDER_EMAIL=apikey
SENDER_PASSWORD=SG.xxxxxxxxxxxxxx
```

## Security Notes

- Never commit .env file with real credentials to git
- Use App Passwords instead of main account password
- OTPs expire after 10 minutes
- Previous OTP is deleted when a new one is requested
- Email is marked as verified only after successful OTP verification
