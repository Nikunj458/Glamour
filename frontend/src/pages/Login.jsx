import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [mode,     setMode]     = useState('login');
  const [form,     setForm]     = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { login, register } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await login(form.email, form.password);
        toast.success(`Welcome back, ${data.user.name}! ✨`);
        navigate(data.user.role === 'admin' ? '/admin' : from, { replace: true });
      } else {
        await register(form.name, form.email, form.password);
        toast.success('Account created! Welcome 🌸');
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">

      {/* ── MOBILE HEADER ─────────────────────────── */}
      <div className="sticky top-0 z-10 bg-ivory/90 backdrop-blur-sm border-b border-gray-100 px-4 h-14 flex items-center md:hidden">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center text-charcoal -ml-2">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 text-center">
          <span className="font-display text-lg italic text-charcoal">Glamour</span>
          <span className="font-sans text-[8px] tracking-[0.3em] text-rose uppercase ml-1">Boutique</span>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex flex-1">

        {/* ── DESKTOP LEFT PANEL ────────────────────── */}
        <div className="hidden md:flex md:w-1/2 relative overflow-hidden min-h-screen">
          <img
            src="https://images.unsplash.com/photo-1727430334140-c21dc3d415f1?q=80&w=870&auto=format&fit=crop"
            alt="Boutique"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent" />
          <div className="absolute bottom-12 left-10 right-10">
            <Link to="/">
              <span className="font-display text-5xl italic text-ivory block">Glamour</span>
              <span className="font-sans text-[10px] tracking-[0.5em] text-rose uppercase">Boutique</span>
            </Link>
            <p className="font-sans text-white/70 text-sm mt-5 leading-relaxed max-w-xs">
              Fashion that tells your story. Curated with love, crafted with purpose.
            </p>
            <div className="flex gap-3 mt-6">
              {[['1000+', 'Styles'], ['15+', 'Years'], ['50k+', 'Customers']].map(([num, label]) => (
                <div key={label} className="text-center bg-white/10 backdrop-blur-sm px-4 py-3">
                  <p className="font-display text-2xl italic text-ivory">{num}</p>
                  <p className="text-[9px] font-sans text-white/60 tracking-widest uppercase">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FORM PANEL ────────────────────────────── */}
        <div className="w-full md:w-1/2 flex items-start md:items-center justify-center px-5 py-8 md:py-12">
          <div className="w-full max-w-sm">

            {/* Mode toggle */}
            <div className="flex bg-champagne/60 p-1 mb-8 gap-1">
              {['login', 'register'].map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-3 text-xs font-sans tracking-widest uppercase transition-all duration-200 ${
                    mode === m ? 'bg-charcoal text-ivory shadow-sm' : 'text-mink hover:text-charcoal'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            {/* Heading */}
            <div className="mb-7">
              <p className="font-sans text-[10px] tracking-widest uppercase text-mink flex items-center gap-1.5 mb-1">
                <Sparkles size={10} />
                {mode === 'login' ? 'Welcome back' : 'Join us'}
              </p>
              <h1 className="font-display text-3xl italic text-charcoal">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {mode === 'register' && (
                <div>
                  <label className="block text-[10px] font-sans tracking-widests uppercase text-mink mb-2">
                    Full Name <span className="text-rose">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your full name"
                    style={{ fontSize: '16px' }}
                    className="w-full border border-gray-200 bg-white px-4 py-3.5 font-sans text-charcoal placeholder-gray-400 focus:outline-none focus:border-rose transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-sans tracking-widests uppercase text-mink mb-2">
                  Email <span className="text-rose">*</span>
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  style={{ fontSize: '16px' }}
                  className="w-full border border-gray-200 bg-white px-4 py-3.5 font-sans text-charcoal placeholder-gray-400 focus:outline-none focus:border-rose transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans tracking-widests uppercase text-mink mb-2">
                  Password <span className="text-rose">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 6 characters"
                    style={{ fontSize: '16px' }}
                    className="w-full border border-gray-200 bg-white px-4 py-3.5 pr-12 font-sans text-charcoal placeholder-gray-400 focus:outline-none focus:border-rose transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-mink hover:text-charcoal transition-colors"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Forgot password — only on login mode */}
              {mode === 'login' && (
                <div className="text-right -mt-2">
                  <a href="/forgot-password" className="text-[11px] font-sans text-mink hover:text-rose transition-colors underline underline-offset-2">
                    Forgot password?
                  </a>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-charcoal text-ivory py-4 font-sans text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-rose transition-colors active:scale-[0.98] mt-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                  </>
                ) : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Switch mode */}
            <p className="text-center mt-6 text-xs font-sans text-mink">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
                className="text-rose font-medium underline underline-offset-2"
              >
                {mode === 'login' ? 'Register' : 'Sign in'}
              </button>
            </p>

            {/* Back to site */}
            <div className="mt-6 text-center border-t border-gray-100 pt-6">
              <Link to="/" className="text-[11px] font-sans text-mink tracking-widests uppercase flex items-center justify-center gap-1.5 hover:text-rose transition-colors">
                <ArrowLeft size={11} /> Back to Home
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
