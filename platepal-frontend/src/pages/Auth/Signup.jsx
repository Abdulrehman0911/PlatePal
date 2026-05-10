import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/Toast';

const cities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad'];

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

export default function Signup() {
  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', city: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Min 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.city) e.city = 'City is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.city);
      addToast('Account created! Welcome to PlatePal 🎉', 'success');
      navigate('/');
    } catch (err) {
      addToast(err?.error || 'Sign up failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(form.password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-error', 'bg-secondary', 'bg-cal-yellow', 'bg-cal-green'];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-surface relative overflow-hidden">
      <div className="fixed bottom-0 left-0 w-full h-[265px] -z-10 bg-gradient-to-t from-primary-container/5 to-transparent" />

      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[var(--shadow-card)] p-8 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="material-symbols-outlined text-on-primary text-2xl">restaurant</span>
          </div>
          <h2 className="font-['Epilogue'] font-bold text-2xl text-on-surface mb-1">Create Account</h2>
          <p className="text-sm text-outline font-['Manrope']">Start your mindful health journey today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider px-1 font-['Manrope']">Full Name</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary-container text-lg">person</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Ahmed Khan"
                className="w-full h-13 pl-12 pr-4 bg-surface-container border-none rounded-xl text-sm font-['Manrope'] focus:ring-2 focus:ring-primary-container outline-none transition-all"
                id="signup-name"
              />
            </div>
            {errors.name && <p className="text-xs text-error px-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider px-1 font-['Manrope']">Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary-container text-lg">mail</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="hello@platepal.com"
                className="w-full h-13 pl-12 pr-4 bg-surface-container border-none rounded-xl text-sm font-['Manrope'] focus:ring-2 focus:ring-primary-container outline-none transition-all"
                id="signup-email"
              />
            </div>
            {errors.email && <p className="text-xs text-error px-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider px-1 font-['Manrope']">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary-container text-lg">lock</span>
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="Min 8 characters"
                className="w-full h-13 pl-12 pr-12 bg-surface-container border-none rounded-xl text-sm font-['Manrope'] focus:ring-2 focus:ring-primary-container outline-none transition-all"
                id="signup-password"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline">
                <span className="material-symbols-outlined text-lg">{showPw ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            {form.password && (
              <div className="flex items-center gap-2 px-1">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-outline-variant'}`} />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-outline">{strengthLabels[strength]}</span>
              </div>
            )}
            {errors.password && <p className="text-xs text-error px-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider px-1 font-['Manrope']">Confirm Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary-container text-lg">lock</span>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => set('confirmPassword', e.target.value)}
                placeholder="••••••••"
                className="w-full h-13 pl-12 pr-4 bg-surface-container border-none rounded-xl text-sm font-['Manrope'] focus:ring-2 focus:ring-primary-container outline-none transition-all"
                id="signup-confirm-password"
              />
            </div>
            {errors.confirmPassword && <p className="text-xs text-error px-1">{errors.confirmPassword}</p>}
          </div>

          {/* City */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider px-1 font-['Manrope']">City</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary-container text-lg">location_on</span>
              <select
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                className="w-full h-13 pl-12 pr-4 bg-surface-container border-none rounded-xl text-sm font-['Manrope'] focus:ring-2 focus:ring-primary-container outline-none transition-all appearance-none cursor-pointer"
                id="signup-city"
              >
                <option value="">Select your city</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">expand_more</span>
            </div>
            {errors.city && <p className="text-xs text-error px-1">{errors.city}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary-container text-on-primary font-['Manrope'] font-semibold rounded-xl shadow-[var(--shadow-elevated)] hover:brightness-110 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            id="signup-submit"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-on-surface font-['Manrope'] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-secondary hover:opacity-80 transition-opacity">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
