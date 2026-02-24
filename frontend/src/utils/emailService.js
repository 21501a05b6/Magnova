import emailjs from 'emailjs-com';

// Initialize EmailJS
const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

// Initialize EmailJS on app load
if (PUBLIC_KEY && SERVICE_ID && TEMPLATE_ID) {
  emailjs.init(PUBLIC_KEY);
}

export const sendOTPEmail = async (email, otp, userName = 'User') => {
  /**
   * Send OTP email using EmailJS
   * @param {string} email - Recipient email address
   * @param {string} otp - 6-digit OTP code
   * @param {string} userName - User's name (optional)
   * @return {Promise} - EmailJS response
   */
  try {
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      throw new Error(
        'EmailJS credentials not configured. Please check your .env file.'
      );
    }

    const templateParams = {
      to_email: email,
      user_name: userName,
      otp_code: otp,
    };

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
    
    console.log('Email sent successfully:', response);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      message: error.message || 'Failed to send OTP email',
    };
  }
};

export const isEmailJSConfigured = () => {
  return !!(PUBLIC_KEY && SERVICE_ID && TEMPLATE_ID);
};
