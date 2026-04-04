import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-ivory/90 backdrop-blur-sm border-b border-gray-100 px-4 h-14 flex items-center">
        <button onClick={() => navigate('/login')} className="w-10 h-10 flex items-center justify-center text-charcoal -ml-2">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 text-center">
          <span className="font-display text-lg italic text-charcoal">Glamour</span>
          <span className="font-sans text-[8px] tracking-[0.3em] text-rose uppercase ml-1">Boutique</span>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">

          {!sent ? (
            <>
              {/* Icon */}
              <div className="w-16 h-16 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail size={28} className="text-rose" />
              </div>

              <h1 className="font-display text-3xl italic text-charcoal text-center mb-2">Forgot Password?</h1>
              <p className="font-sans text-xs text-mink text-center leading-relaxed mb-8">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-sans tracking-widests uppercase text-mink mb-2">
                    Email Address <span className="text-rose">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    inputMode="email"
                    autoComplete="email"
                    style={{ fontSize: '16px' }}
                    className="w-full border border-gray-200 bg-white px-4 py-3.5 font-sans text-charcoal placeholder-gray-400 focus:outline-none focus:border-rose transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-charcoal text-ivory py-4 font-sans text-xs tracking-widests uppercase flex items-center justify-center gap-2 hover:bg-rose transition-colors active:scale-[0.98] disabled:opacity-70"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" /> Sending…</>
                  ) : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center border-t border-gray-100 pt-6">
                <Link to="/login" className="text-[11px] font-sans text-mink tracking-widests uppercase flex items-center justify-center gap-1.5 hover:text-rose transition-colors">
                  <ArrowLeft size={11} /> Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            /* Success state */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="font-display text-2xl italic text-charcoal mb-2">Check your inbox</h2>
              <p className="font-sans text-xs text-mink leading-relaxed mb-2">
                We've sent a password reset link to
              </p>
              <p className="font-sans text-sm font-medium text-charcoal mb-6">{email}</p>
              <p className="font-sans text-xs text-mink leading-relaxed mb-8">
                The link expires in 1 hour. Check your spam folder if you don't see it.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="btn-outline text-xs mb-4 w-full"
              >
                Try a different email
              </button>
              <Link to="/login" className="text-[11px] font-sans text-mink tracking-widests uppercase flex items-center justify-center gap-1.5 hover:text-rose transition-colors">
                <ArrowLeft size={11} /> Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
