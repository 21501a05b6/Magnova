import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import api from '../utils/api';
import { Check, Send, Mail, CheckCircle2 } from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    organization: '',
    role: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  /**
   * Step 1 — Click "Verify":
   * Backend generates OTP, stores it in DB, and sends it to the user's email via EmailJS.
   */
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSendingOtp(true);
    try {
      // Backend generates OTP and sends it to the user's email via EmailJS
      const res = await api.post('/auth/send-otp', { email: formData.email });
      setShowOTPInput(true);

      if (res.data?.email_sent === false) {
        // OTP stored but email delivery failed (misconfiguration); still show input for retry
        toast.warning('OTP generated but email delivery failed. Check EmailJS config.');
      } else {
        toast.success('OTP sent to your email! Check your inbox.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to send OTP. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSendingOtp(false);
    }
  };

  /**
   * Step 2 — Enter OTP and click "Verify":
   * Backend verifies OTP from DB. On success → green tick, Create Account enabled.
   */
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    try {
      await api.post('/auth/verify-otp', { email: formData.email, otp });
      setEmailVerified(true);
      setShowOTPInput(false);
      setOtp('');
      toast.success('✅ Email verified successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  /**
   * Step 3 — Submit form (only enabled after email is verified):
   * Backend registers user and sends Welcome email.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailVerified) {
      toast.error('Please verify your email first');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      toast.success('🎉 Account created successfully! Welcome to Magnova!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8 bg-neutral-50"
      data-testid="register-page"
    >
      <Card className="w-full max-w-md shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neutral-900">Create Account</CardTitle>
          <CardDescription className="text-neutral-600">
            Register for a new Magnova account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">

            {/* ── Email + Verify button ── */}
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={emailVerified || showOTPInput}
                    required
                    data-testid="register-email-input"
                    className={emailVerified ? 'pr-10 bg-green-50 border-green-400' : ''}
                  />
                  {/* Green tick icon inside the email input */}
                  {emailVerified && (
                    <CheckCircle2
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5"
                      data-testid="email-verified-icon"
                    />
                  )}
                </div>

                {/* Show Verify / Sending button only when NOT yet verified */}
                {!emailVerified && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendOTP}
                    disabled={sendingOtp || !formData.email || showOTPInput}
                    className="whitespace-nowrap"
                    data-testid="send-otp-button"
                  >
                    {sendingOtp ? (
                      <>
                        <Mail className="w-4 h-4 mr-2 animate-pulse" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {showOTPInput ? 'Sent' : 'Verify'}
                      </>
                    )}
                  </Button>
                )}

                {/* Verified badge shown beside the field */}
                {emailVerified && (
                  <span className="flex items-center gap-1 text-green-600 text-sm font-medium whitespace-nowrap">
                    <Check className="w-4 h-4" />
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* ── OTP Input (shown after Verify clicked, hidden after success) ── */}
            {showOTPInput && !emailVerified && (
              <div
                className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2"
                data-testid="otp-section"
              >
                <Label htmlFor="otp" className="text-blue-900 font-semibold">
                  Enter OTP
                </Label>
                <p className="text-xs text-blue-700">
                  A 6-digit OTP has been sent to <strong>{formData.email}</strong>.
                  It is valid for 10 minutes.
                </p>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    maxLength="6"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="text-center text-xl tracking-widest font-mono"
                    data-testid="otp-input"
                  />
                  <Button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={otpLoading || otp.length !== 6}
                    data-testid="verify-otp-button"
                  >
                    {otpLoading ? (
                      <>
                        <Mail className="w-4 h-4 mr-2 animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      'Verify OTP'
                    )}
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowOTPInput(false);
                    setOtp('');
                  }}
                  className="text-xs text-blue-500 hover:underline mt-1"
                >
                  Change email
                </button>
              </div>
            )}

            {/* ── Full Name ── */}
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                data-testid="register-name-input"
              />
            </div>

            {/* ── Password ── */}
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                data-testid="register-password-input"
              />
            </div>

            {/* ── Organization ── */}
            <div>
              <Label htmlFor="organization">Organization</Label>
              <Select
                value={formData.organization}
                onValueChange={(value) => setFormData({ ...formData, organization: value })}
                required
              >
                <SelectTrigger data-testid="register-organization-select">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Magnova">Magnova Exim Pvt. Ltd.</SelectItem>
                  <SelectItem value="Nova">Nova Enterprises</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ── Role ── */}
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                required
              >
                <SelectTrigger data-testid="register-role-select">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Purchase">Purchase Team</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="InternalPayments">Internal Payments</SelectItem>
                  <SelectItem value="ExternalPayments">External Payments</SelectItem>
                  <SelectItem value="Logistics">Logistics</SelectItem>
                  <SelectItem value="Inventory">Inventory</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ── WhatsApp (optional) ── */}
            <div>
              <Label htmlFor="phone">WhatsApp Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                data-testid="register-phone-input"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Format: +91 followed by 10-digit number
              </p>
            </div>

            {/* ── Create Account (disabled until email verified) ── */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !emailVerified}
              data-testid="register-submit-button"
            >
              {loading ? (
                'Creating account…'
              ) : emailVerified ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Create Account
                </>
              ) : (
                'Create Account (verify email first)'
              )}
            </Button>

            {/* Helper text when not yet verified */}
            {!emailVerified && (
              <p className="text-xs text-center text-neutral-400">
                You must verify your email before creating an account.
              </p>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-neutral-600 hover:underline font-medium"
                data-testid="login-link"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
