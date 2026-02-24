# EmailJS Template Setup Guide for Magnova

## Your Credentials (already configured in backend/.env)
- **Public Key:** `d0G1MUdndI38q69jX`
- **Private Key:** `_KqGEDjtuOWlTgWxkVqFP`

---

## Step 1 — Find your Service ID

1. Log in to https://emailjs.com
2. Go to **Email Services** in the left sidebar
3. Copy the **Service ID** (format: `service_xxxxxxxx`)
4. Open `backend/.env` and set:
   ```
   EMAILJS_SERVICE_ID=service_xxxxxxxx
   ```

---

## Step 2 — Create the OTP Email Template

1. Go to **Email Templates** → **Create New Template**
2. Set **Template Name**: `magnova_otp`
3. Set **Subject**: `Your Magnova OTP Code`
4. **To email field**: `{{to_email}}`
5. Paste the following HTML body:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;}
    .wrapper{max-width:600px;margin:30px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);}
    .header{background:#1a1a2e;padding:24px 32px;}
    .header h1{color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;}
    .body{padding:32px;}
    .otp-card{background:#f0fdf4;border:2px solid #22c55e;border-radius:10px;text-align:center;padding:24px;margin:20px 0;}
    .otp-code{font-size:42px;font-weight:700;letter-spacing:10px;color:#16a34a;font-family:monospace;}
    .info{font-size:14px;color:#555;margin-top:8px;}
    .footer{background:#f8f8f8;padding:16px 32px;font-size:12px;color:#888;text-align:center;border-top:1px solid #eee;}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🔒 Magnova — Email Verification</h1>
    </div>
    <div class="body">
      <p>To authenticate, please use the following One Time Password (OTP):</p>
      <div class="otp-card">
        <div class="otp-code">{{passcode}}</div>
        <div class="info">This OTP will be valid for 10 minutes till <strong>{{time}}</strong>.</div>
      </div>
      <p>Do not share this OTP with anyone. If you didn't make this request, you can safely ignore this email.</p>
      <p style="color:#888;font-size:13px;">Magnova will never contact you about this email or ask for any login codes or links. Beware of phishing scams.</p>
      <p>Thanks for visiting Magnova!</p>
    </div>
    <div class="footer">
      <strong>Magnova Exim Pvt. Ltd.</strong> &bull; Procurement &amp; Sales Management System
    </div>
  </div>
</body>
</html>
```

6. Click **Save**
7. Copy the **Template ID** (format: `template_xxxxxxxx`)
8. Open `backend/.env` and set:
   ```
   EMAILJS_OTP_TEMPLATE_ID=template_xxxxxxxx
   ```

---

## Step 3 — Create the Welcome Email Template

1. Go to **Email Templates** → **Create New Template**
2. Set **Template Name**: `magnova_welcome`
3. Set **Subject**: `Welcome to Magnova!`
4. **To email field**: `{{to_email}}`
5. Paste the following HTML body:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;}
    .wrapper{max-width:600px;margin:30px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);}
    .header{background:#1a1a2e;padding:24px 32px;text-align:center;}
    .header h1{color:#ffffff;margin:0;font-size:24px;}
    .body{padding:32px;text-align:center;}
    .cta-btn{display:inline-block;margin-top:20px;padding:14px 36px;background:#22c55e;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;}
    .footer{background:#f8f8f8;padding:16px 32px;font-size:12px;color:#888;text-align:center;border-top:1px solid #eee;}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🎉 Welcome to Magnova!</h1>
    </div>
    <div class="body">
      <h2>Welcome to the Magnova family, {{name}}!</h2>
      <p>We're excited to have you on board.</p>
      <p>Your account has been successfully created. You're now ready to manage procurement, inventory, payments, and more — all in one place.</p>
      <a href="http://localhost:3000/dashboard" class="cta-btn">Open Magnova →</a>
      <p style="margin-top:28px;font-size:13px;color:#888;">
        If you have any questions, our support team is here at
        <a href="mailto:ramakrishna.mtr@magnova.in">ramakrishna.mtr@magnova.in</a>
      </p>
    </div>
    <div class="footer">
      Best regards, The Magnova Team &bull; Magnova Exim Pvt. Ltd.
    </div>
  </div>
</body>
</html>
```

6. Click **Save**
7. Copy the **Template ID** (format: `template_xxxxxxxx`)
8. Open `backend/.env` and set:
   ```
   EMAILJS_WELCOME_TEMPLATE_ID=template_xxxxxxxx
   ```

---

## Template Variables Summary

| Template         | Variable     | Value                          |
|------------------|--------------|--------------------------------|
| OTP Template     | `{{passcode}}`| The 6-digit OTP code          |
| OTP Template     | `{{time}}`   | Expiry time (HH:MM UTC)        |
| OTP Template     | `{{to_email}}`| Recipient email address       |
| Welcome Template | `{{name}}`   | User's full name               |
| Welcome Template | `{{to_email}}`| Recipient email address       |

---

## Final backend/.env (after setup)

```env
EMAILJS_SERVICE_ID=service_xxxxxxxx
EMAILJS_OTP_TEMPLATE_ID=template_xxxxxxxx
EMAILJS_WELCOME_TEMPLATE_ID=template_xxxxxxxx
EMAILJS_PUBLIC_KEY=d0G1MUdndI38q69jX
EMAILJS_PRIVATE_KEY=_KqGEDjtuOWlTgWxkVqFP
```

---

## How the Flow Works (After Setup)

```
1. User enters email → clicks "Verify"
   └─ Frontend → POST /api/auth/send-otp
      └─ Backend: generates OTP → stores in MongoDB (10 min TTL)
         └─ Backend → EmailJS REST API → sends OTP email to user

2. User receives email → reads OTP → enters 6-digit code → clicks "Verify OTP"
   └─ Frontend → POST /api/auth/verify-otp
      └─ Backend: checks OTP in MongoDB (validates code + expiry)
         └─ ✅ Green tick appears, Create Account button ENABLED

3. User fills rest of form → clicks "Create Account"
   └─ Frontend → POST /api/auth/register
      └─ Backend: creates user account
         └─ Backend → EmailJS REST API → sends Welcome email to user
         └─ User redirected to Dashboard
```
