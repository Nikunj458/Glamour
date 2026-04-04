import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token }  = useParams();
  const navigate   = useNavigate();
  const { login: setAuthUser } = useAuth();
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm)
      return toast.error('Passwords do not match');
    if (password.length < 6)
      return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      // Auto log in with the new credentials
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed — link may have expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-ivory/90 backdrop-blur-sm border-b border-gray-100 px-4 h-14 flex items-center">
        <div className="flex-1 text-center">
          <span className="font-display text-lg italic text-charcoal">Glamour</span>
          <span className="font-sans text-[8px] tracking-[0.3em] text-rose uppercase ml-1">Boutique</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">

          {!success ? (
            <>
              <div className="w-16 h-16 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock size={28} className="text-rose" />
              </div>

              <h1 className="font-display text-3xl italic text-charcoal text-center mb-2">Reset Password</h1>
              <p className="font-sans text-xs text-mink text-center leading-relaxed mb-8">
                Enter your new password below.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-sans tracking-widests uppercase text-mink mb-2">
                    New Password <span className="text-rose">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      style={{ fontSize: '16px' }}
                      className="w-full border border-gray-200 bg-white px-4 py-3.5 pr-12 font-sans text-charcoal placeholder-gray-400 focus:outline-none focus:border-rose transition-colors"
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-mink hover:text-charcoal transition-colors">
                      {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-sans tracking-widests uppercase text-mink mb-2">
                    Confirm Password <span className="text-rose">*</span>
                  </label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    style={{ fontSize: '16px' }}
                    className="w-full border border-gray-200 bg-white px-4 py-3.5 font-sans text-charcoal placeholder-gray-400 focus:outline-none focus:border-rose transition-colors"
                  />
                  {confirm && password !== confirm && (
                    <p className="font-sans text-[11px] text-rose mt-1">Passwords do not match</p>
                  )}
                </div>

                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${
                        password.length >= i * 3 ? (password.length >= 10 ? 'bg-green-400' : 'bg-rose') : 'bg-gray-200'
                      }`} />
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (confirm && password !== confirm)}
                  className="w-full bg-charcoal text-ivory py-4 font-sans text-xs tracking-widests uppercase flex items-center justify-center gap-2 hover:bg-rose transition-colors active:scale-[0.98] disabled:opacity-70"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" /> Resetting…</>
                  ) : 'Reset Password'}
                </button>
              </form>

              <div className="mt-6 text-center border-t border-gray-100 pt-6">
                <Link to="/login" className="text-[11px] font-sans text-mink tracking-widests uppercase flex items-center justify-center gap-1.5 hover:text-rose transition-colors">
                  <ArrowLeft size={11} /> Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="font-display text-2xl italic text-charcoal mb-2">Password Reset!</h2>
              <p className="font-sans text-xs text-mink leading-relaxed mb-6">
                Your password has been updated. Redirecting you to the home page…
              </p>
              <div className="w-6 h-6 border-2 border-rose border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
