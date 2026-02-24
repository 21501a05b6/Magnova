# EmailJS OTP Integration - Quick Start Guide

## Overview

The registration system now uses **EmailJS** to send OTP (One-Time Password) emails directly from the frontend. This eliminates the need for backend email configuration and provides real-time email delivery.

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create EmailJS Account
1. Visit **https://www.emailjs.com/**
2. Click **"Free Sign Up"**
3. Create account and verify email

### Step 2: Set Up Email Service (Choose One)

#### Option A: Gmail (Recommended)
1. Go to **Dashboard → Email Services**
2. Click **"Add Service"**
3. Select **"Gmail"**
4. Click **"Connect Account"** and authorize
5. Click **"Create Service"**
6. **Copy** the **Service ID** (format: `service_xxxxxxxxx`)

#### Option B: SendGrid / Other Services
1. Go to **Dashboard → Email Services**
2. Click **"Add Service"**
3. Select your preferred service
4. Follow the setup wizard
5. **Copy** the **Service ID**

### Step 3: Create Email Template

1. Go to **Dashboard → Email Templates**
2. Click **"Create New Template"**
3. Enter **Name**: `magnova_otp_verification`
4. Fill in the template (use HTML provided in `EMAILJS_SETUP.md`)
5. Click **"Save"**
6. **Copy** the **Template ID** (format: `template_xxxxxxxxx`)

### Step 4: Get Your Public Key

1. Go to **Account → Integration**
2. Find **"Public Key"** section
3. **Copy** the Public Key (safe to expose in frontend)

### Step 5: Configure Frontend

1. Open `frontend/.env`
2. Update the following:

```env
REACT_APP_EMAILJS_SERVICE_ID=service_xxxxxxxxx
REACT_APP_EMAILJS_TEMPLATE_ID=template_xxxxxxxxx
REACT_APP_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxxx
```

3. **Save** and **restart React** dev server:

```bash
cd frontend
npm install emailjs-com
npm start
```

---

## 📧 Template Variables

The email template uses these variables (in HTML):

```html
<!-- User's name -->
{{user_name}}

<!-- OTP code -->
{{otp_code}}

<!-- Recipient email -->
{{to_email}}
```

**Example HTML:**
```html
<p>Hi {{user_name}},</p>
<p>Your OTP is: <strong>{{otp_code}}</strong></p>
<p>This OTP will expire in 10 minutes.</p>
```

---

## 🔄 OTP Flow Explained

```
User Registration Flow:
├─ User enters email and clicks "Verify"
├─ Frontend generates 6-digit OTP
├─ Frontend stores OTP in Backend (MongoDB)
├─ Frontend sends email via EmailJS ✅
├─ User receives email with OTP
├─ User enters OTP in form
├─ Frontend verifies OTP with Backend
└─ Email marked as verified with ✓ checkmark
```

---

## ✅ Testing the Setup

### Test 1: EmailJS Dashboard
1. Go to **Email Templates**
2. Select `magnova_otp_verification`
3. Click **"Test"** button
4. Check your email inbox

### Test 2: Registration Flow
1. Start frontend: `npm start`
2. Go to **Login** page
3. Click **"Register Here"**
4. Enter email address
5. Click **"Verify"**
6. Check email for OTP
7. Enter OTP in registration form
8. Complete registration ✅

### Troubleshooting Tests
- Check **browser console** for errors (F12 → Console)
- Check **EmailJS dashboard** for failed sends (Dashboard → Activity)
- Verify **.env** variables are set correctly
- Ensure backend is running (OTP storage in MongoDB)

---

## 🔐 Security Features

✅ **Frontend OTP Generation** - Random, cryptographically secure
✅ **Backend Verification** - OTP checked against MongoDB
✅ **Expiration** - OTP expires after 10 minutes
✅ **Single Use** - OTP deleted after verification
✅ **Rate Limiting** - EmailJS handles abuse prevention

---

## 🛠️ Troubleshooting

### ❌ Email Not Sending

**Check these in order:**

1. **Verify .env variables**
   ```bash
   cat frontend/.env | grep EMAILJS
   ```
   Should show all three values

2. **Restart development server**
   ```bash
   # Stop server (Ctrl+C)
   npm start
   ```

3. **Check browser console**
   - Open DevTools (F12)
   - Go to **Console** tab
   - Look for error messages

4. **Verify EmailJS service is connected**
   - Go to https://www.emailjs.com/
   - Dashboard → Email Services
   - Ensure service status is **"Connected"**

5. **Test template directly**
   - Go to Email Templates
   - Click on `magnova_otp_verification`
   - Click **"Test"** button
   - Should send test email

### ❌ Template Variables Showing Literally

**Issue:** Email shows `{{otp_code}}` instead of actual OTP

**Solution:**
- Template must use `{{variable_name}}` format (with curly braces)
- Variable names: `otp_code`, `user_name`, `to_email`
- Don't rename variables in JavaScript code without updating template

### ❌ "Invalid Template Variables"

**Solution:**
- Check template HTML for typos
- Use exact variable names from code:
  - `otp_code` (not `otp` or `code`)
  - `user_name` (not `name` or `username`)
  - `to_email` (not `email` or `recipient`)

### ❌ CORS or Network Errors

**Solution:**
- Don't worry - EmailJS handles CORS automatically
- Check internet connection
- Ensure public key is being used (not service ID)

---

## 📊 Backend Endpoints

### Generate OTP (Backend)
```
POST /api/auth/send-otp
Body: { "email": "user@example.com" }
Response: { "message": "...", "email": "...", "otp": "123456" }
```

### Store Frontend OTP (Backend)
```
POST /api/auth/store-otp
Body: { "email": "user@example.com", "otp": "123456" }
Response: { "message": "OTP stored successfully" }
```

### Verify OTP (Backend)
```
POST /api/auth/verify-otp
Body: { "email": "user@example.com", "otp": "123456" }
Response: { "message": "OTP verified successfully", "email": "..." }
```

---

## 📁 Files Modified

- ✅ `frontend/src/pages/RegisterPage.js` - Uses EmailJS
- ✅ `frontend/src/utils/emailService.js` - EmailJS utility functions
- ✅ `frontend/.env` - EmailJS credentials
- ✅ `backend/server.py` - New `/auth/store-otp` endpoint

---

## 🎯 Next Steps

1. ✅ Create EmailJS account
2. ✅ Set up email service
3. ✅ Create email template
4. ✅ Update `frontend/.env`
5. ✅ Restart frontend (`npm start`)
6. ✅ Test registration flow
7. 🎉 Done!

---

## 📞 Support

For issues:
1. Check **Troubleshooting** section above
2. Visit **https://www.emailjs.com/docs/**
3. Check EmailJS **Dashboard → Activity** for sent emails log
4. Check backend logs for OTP storage errors

---

## 🔔 Important Notes

- ⚠️ **Public key is safe** - It's meant to be exposed in frontend code
- ⚠️ **Don't commit credentials** - .env file is in .gitignore
- ⚠️ **Free tier limit** - EmailJS free tier: 200 emails/day
- ✅ **OTP generation** - Frontend generates random 6-digit numbers
- ✅ **Verification** - Backend validates OTP from MongoDB

---

## Alternative Email Services

If you prefer different providers:

### SendGrid
```env
REACT_APP_EMAILJS_SERVICE_ID=sendgrid_key
REACT_APP_EMAILJS_TEMPLATE_ID=template_id
React_APP_EMAILJS_PUBLIC_KEY=public_key
```

### AWS SES
```env
REACT_APP_EMAILJS_SERVICE_ID=aws_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=template_id
REACT_APP_EMAILJS_PUBLIC_KEY=public_key
```

All work with the same EmailJS setup process.
