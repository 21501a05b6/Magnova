import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setFormData({ ...formData, email: e.target.value });
  };

  const allFieldsFilled =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.password.trim() &&
    formData.organization &&
    formData.role &&
    formData.phone.trim();

  const canRegister = allFieldsFilled;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canRegister) return;
    setLoading(true);
    try {
      await register(formData);
      toast.success(`Welcome to Magnova, ${formData.name}! Registration successful.`);
      navigate('/dashboard');
    } catch (error) {
      if (error.response?.data?.detail === "waiting_for_admin") {
        toast.info("Registration submitted! Waiting for Admin approval.");
        navigate('/login');
      } else {
        toast.error(error.response?.data?.detail || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="register-page">
      {/* ── Left half: branding image (same as login) ── */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1614571272828-2d8289ff8fc0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjB3YXJlaG91c2UlMjBsb2dpc3RpY3MlMjBhYnN0cmFjdHxlbnwwfHx8fDE3Njk4NzAzOTF8MA&ixlib=rb-4.1.0&q=85)',
        }}
      >
        <div className="absolute inset-0 bg-neutral-900/90" />
        <div className="relative z-10 p-12 flex flex-col justify-center text-white">
          <h1 className="text-5xl font-black tracking-tight mb-4">MAGNOVA-NOVA</h1>
          <p className="text-xl text-neutral-100">Procurement &amp; Sales Management System</p>
          <p className="text-neutral-200 mt-4">End-to-end visibility for your supply chain</p>
        </div>
      </div>

      {/* ── Right half: registration form ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-neutral-50/50 overflow-y-auto">
        <Card className="w-full max-w-lg shadow-sm bg-white border border-neutral-200 my-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-neutral-900">Create Account</CardTitle>
            <CardDescription className="text-neutral-500">Register for a new Magnova account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">

              {/* Full Name */}
              <div>
                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
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

              {/* Phone Number */}
              <div>
                <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  data-testid="register-phone-input"
                />
              </div>

              {/* Email + Verify */}
              <div>
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleEmailChange}
                      required
                      data-testid="register-email-input"
                    />
                  </div>
                </div>
              </div>


              {/* Password */}
              <div>
                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
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

              {/* Organization */}
              <div>
                <Label htmlFor="organization">Organization <span className="text-red-500">*</span></Label>
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

              {/* Role */}
              <div>
                <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
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

              {/* Register button */}
              <Button
                type="submit"
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canRegister || loading}
                data-testid="register-submit-button"
                title={!allFieldsFilled ? 'Please fill in all required fields' : ''}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</>
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Helper text */}
              {!canRegister && (
                <p className="text-xs text-neutral-500 text-center">
                  ⚠ Please fill in all required fields to enable registration.
                </p>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600">
                Already have an account?{' '}
                <Link to="/login" className="text-neutral-700 hover:underline font-medium" data-testid="login-link">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
