import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [mode,     setMode]     = useState('login');
  const [form,     setForm]     = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await login(form.email, form.password);
        toast.success(`Welcome back, ${data.user.name}! ✨`);
        navigate(data.user.role === 'admin' ? '/admin' : '/');
      } else {
        await register(form.name, form.email, form.password);
        toast.success('Account created! Welcome 🌸');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory h-screen flex flex-col">

      {/* ── MOBILE HEADER ─────────────────────────── */}
      <div className="sticky top-0 z-10 bg-ivory/90 backdrop-blur-sm border-b border-gray-100 px-4 h-14 flex items-center md:hidden">
        <button onClick={() => navigate(-1)} className="icon-btn text-charcoal -ml-2">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 text-center">
          <span className="font-display text-lg italic text-charcoal">Glamour</span>
          <span className="font-sans text-[8px] tracking-[0.3em] text-rose uppercase ml-1">Boutique</span>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex flex-1 min-h-0 h-screen ">

        {/* ── DESKTOP LEFT PANEL ────────────────────── */}
        <div className="hidden md:flex h-screen md:w-1/2 relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1727430334140-c21dc3d415f1?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Boutique"
            className="w-full h-full overflow-y-hidden object-cover"
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
              {['1000+\nStyles', '15+\nYears', '50k+\nCustomers'].map((stat) => {
                const [num, label] = stat.split('\n');
                return (
                  <div key={label} className="text-center bg-white/10 backdrop-blur-sm px-4 py-3">
                    <p className="font-display text-2xl italic text-ivory">{num}</p>
                    <p className="text-[9px] font-sans text-white/60 tracking-widest uppercase">{label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── FORM PANEL ────────────────────────────── */}
        <div className="w-full md:w-1/2 flex items-center justify-center   px-5 py-8 md:py-12 overflow-y-hidden">
          <div className="w-full max-w-sm min-h-[520px] flex flex-col justify-center">

            {/* Mode toggle pills */}
            <div className="flex bg-champagne/60 mt-[60px] p-1 mb-8 gap-1">
              {['login', 'register'].map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 text-xs font-sans tracking-widest uppercase transition-all duration-200 ${
                    mode === m
                      ? 'bg-charcoal text-ivory shadow-sm'
                      : 'text-mink hover:text-charcoal'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            {/* Heading */}
            <div className="mb-7">
              <p className="tag  flex items-center gap-1.5">
                <Sparkles size={10} />
                {mode === 'login' ? 'Welcome back' : 'Join us'}
              </p>
              <h1 className="font-display text-3xl italic text-charcoal">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-[10px] font-sans tracking-widest uppercase text-mink ">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="input-field"
                    placeholder="Your full name"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-sans tracking-widest uppercase text-mink ">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input-field"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans tracking-widest uppercase text-mink ">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="input-field pb-[px] pr-11"
                    placeholder="Min. 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-mink"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-1"
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
            <p className="text-center mt-5 text-xs font-sans text-mink">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
                className="text-rose font-medium underline underline-offset-2"
              >
                {mode === 'login' ? 'Register' : 'Sign in'}
              </button>
            </p>

            {/* Back to site */}
            <div className="mt-6 text-center">
              <Link to="/" className="text-[11px] mb-[10px] font-sans text-mink tracking-widest uppercase flex items-center justify-center gap-1.5 hover:text-rose transition-colors">
                <ArrowLeft size={11} /> Back to Home
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}