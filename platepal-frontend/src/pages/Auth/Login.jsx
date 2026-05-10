import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/Toast';

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return addToast('Please fill in all fields', 'error');
    setLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back!', 'success');
      navigate('/');
    } catch (err) {
      addToast(err?.error || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed bottom-0 left-0 w-full h-[265px] -z-10 bg-gradient-to-t from-primary-container/5 to-transparent" />
      <div className="hidden lg:block fixed top-10 right-10 w-[320px] h-[400px] -z-10 opacity-30 rounded-[40px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=500&fit=crop"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="hidden lg:block fixed bottom-10 left-10 w-[280px] h-[280px] -z-10 opacity-20 rounded-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Card */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-[var(--shadow-card)] p-8 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="material-symbols-outlined text-on-primary text-2xl">restaurant</span>
          </div>
          <h2 className="font-['Epilogue'] font-bold text-2xl text-on-surface mb-1">Welcome Back</h2>
          <p className="text-sm text-outline font-['Manrope']">Continue your journey to mindful health.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-outline uppercase tracking-wider px-1 font-['Manrope']">Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary-container text-lg">mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@platepal.com"
                className="w-full h-14 pl-12 pr-4 bg-surface-container border-none rounded-xl text-sm font-['Manrope'] focus:ring-2 focus:ring-primary-container outline-none transition-all"
                id="login-email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider font-['Manrope']">Password</label>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary-container text-lg">lock</span>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-14 pl-12 pr-12 bg-surface-container border-none rounded-xl text-sm font-['Manrope'] focus:ring-2 focus:ring-primary-container outline-none transition-all"
                id="login-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-lg">{showPw ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded accent-primary-container"
              id="remember-me"
            />
            <label htmlFor="remember-me" className="text-xs text-outline font-['Manrope']">Remember me</label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary-container text-on-primary font-['Manrope'] font-semibold rounded-xl shadow-[var(--shadow-elevated)] hover:brightness-110 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            id="login-submit"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-outline-variant" />
          <span className="text-[11px] font-bold text-outline uppercase tracking-wider font-['Manrope']">or continue with</span>
          <div className="flex-1 h-px bg-outline-variant" />
        </div>

        {/* Social buttons */}
        <div className="flex gap-3 mb-6">
          <button className="flex-1 h-12 border border-outline-variant rounded-xl flex items-center justify-center hover:bg-surface-container transition-colors">
            <span className="text-lg font-bold">G</span>
          </button>
          <button className="flex-1 h-12 border border-outline-variant rounded-xl flex items-center justify-center hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">phone_iphone</span>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-on-surface font-['Manrope']">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-secondary hover:opacity-80 transition-opacity">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
