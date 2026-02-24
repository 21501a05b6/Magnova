# EmailJS Setup Guide

## Overview
EmailJS is a service that allows you to send emails directly from your JavaScript/React application without any backend server. This guide will help you set up EmailJS for OTP email sending.

## Step 1: Create EmailJS Account

1. Go to https://www.emailjs.com/
2. Click "Free Sign Up"
3. Create an account with email and password
4. Verify your email

## Step 2: Set Up Email Service

### Add an Email Service:
1. Log in to your EmailJS dashboard
2. Go to **Email Services** in the left sidebar
3. Click **Add Service**
4. Choose a service provider (Gmail, Outlook, SendGrid, etc.)
5. For Gmail:
   - Select "Gmail"
   - Click "Connect Account"
   - Authorize EmailJS to access your Gmail
   - Or use app-specific password
6. Click "Create Service"
7. Copy your **Service ID** (looks like: `service_xxxxxxxxx`)

## Step 3: Create Email Template

1. Go to **Email Templates** in the left sidebar
2. Click **Create New Template**
3. Fill in the template:

**Template Name:** `magnova_otp_verification`

**Email Subject:** `Email Verification - MAGNOVA OTP`

**Email Content (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 20px; border-radius: 5px; }
        .otp-box { background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #007bff; }
        .footer { color: #666; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Email Verification</h2>
        </div>
        <p>Hi {{user_name}},</p>
        <p>Your One-Time Password (OTP) for email verification is:</p>
        <div class="otp-box">
            <div class="otp-code">{{otp_code}}</div>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr>
        <div class="footer">
            <p><strong>MAGNOVA-NOVA</strong><br>Procurement & Sales Management System</p>
        </div>
    </div>
</body>
</html>
```

4. Click "Save"
5. Copy your **Template ID** (looks like: `template_xxxxxxxxx`)

## Step 4: Get Your Public Key

1. Go to **Account** or **Integration** settings
2. Find your **Public Key** (looks like: `xxxxxxxxxxxxxxxxx`)
3. Note: This key is safe to expose in frontend code

## Step 5: Add Environment Variables

Create a `.env` file in the `frontend` directory (or update existing):

```env
REACT_APP_EMAILJS_SERVICE_ID=service_xxxxxxxxx
REACT_APP_EMAILJS_TEMPLATE_ID=template_xxxxxxxxx
REACT_APP_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxxx
```

**Replace** the `x`s with your actual IDs from EmailJS.

## Step 6: Install EmailJS Package

```bash
cd frontend
npm install emailjs-com
```

## Step 7: Update .env Configuration

Your `frontend/.env` file should have:
```
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
```

## How It Works

1. User enters email and clicks "Verify"
2. Frontend generates a random 6-digit OTP
3. Frontend sends OTP to backend to store in MongoDB
4. Frontend sends email via EmailJS with OTP
5. User receives email and enters OTP
6. Frontend verifies OTP with backend
7. Email is marked as verified

## Testing

### Test EmailJS Setup
1. Go to **Email Templates**
2. Click on your template
3. Use the **Test** button to send a test email to yourself

### Test OTP Flow
1. Go to registration page
2. Enter your email address
3. Click "Verify"
4. Check your email for OTP
5. Enter OTP in the form
6. Email should be verified (green checkmark appears)

## Troubleshooting

### Email Not Sending
- Check if REACT_APP_EMAILJS_SERVICE_ID, REACT_APP_EMAILJS_TEMPLATE_ID, and REACT_APP_EMAILJS_PUBLIC_KEY are correctly set
- Restart React development server after adding .env variables
- Check browser console for errors
- Verify email service is connected in EmailJS dashboard

### Template Variables Not Working
- Make sure template uses `{{variable_name}}` format
- Template variables in this setup: `{{otp_code}}`, `{{user_name}}`, `{{to_email}}`

### CORS Issues
- EmailJS handles CORS properly, but ensure you're using the correct public key
- Public key is safe to expose in frontend

## Security Notes

- The public key is meant to be exposed (it's safe)
- OTP is also generated and stored in backend for verification
- OTPs expire after 10 minutes
- Rate limiting can be set in EmailJS dashboard to prevent abuse

## Variables Used in Template

When sending email via EmailJS, the following variables are passed:
- `{{otp_code}}` - The 6-digit OTP
- `{{user_name}}` - User's full name or "User" if not provided
- `{{to_email}}` - Recipient email address

These are automatically replaced in the email template.
