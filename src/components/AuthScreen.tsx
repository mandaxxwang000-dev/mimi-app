import { useState, FormEvent } from 'react';
import { Cat, Loader2, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

    // Forgot Password Function
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/reset-password',
    });
    setBusy(false);

    if (error) {
      setError(error.message);
    } else {
      setError(null);
      alert('📧 Password reset email sent! Check your inbox.');
    }
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setBusy(true);
    const fn = mode === 'signin' ? signIn : signUp;
    const { error: err } = await fn(email.trim(), password);
    setBusy(false);

    if (err) {
      if (err.toLowerCase().includes('already registered')) {
        setError('That email is already registered. Try signing in.');
      } else if (err.toLowerCase().includes('invalid login')) {
        setError('Wrong email or password.');
      } else {
        setError(err);
      }
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#2D6A4F] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center text-white">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-[#FEFAE0] flex items-center justify-center shadow-xl">
            <Cat className="w-11 h-11 text-[#2D6A4F]" strokeWidth={2.2} />
          </div>
          <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#B45309] flex items-center justify-center shadow-lg">
            <MapPin className="w-4 h-4 text-white" />
          </span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Cat Atlas</h1>
        <p className="mt-2 max-w-xs text-[#FEFAE0]/90 leading-relaxed">
          Spot strays, share rescues and discover the coziest cat cafes near you.
        </p>
      </div>

      <div className="bg-white rounded-t-[2rem] px-6 pt-8 pb-10 shadow-2xl">
        <div className="mx-auto max-w-sm">
          <div className="flex rounded-full bg-[#FEFAE0] p-1 mb-6">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                  mode === m ? 'bg-[#2D6A4F] text-white shadow' : 'text-[#2D6A4F]'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 transition"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
{/* Forgot Password - Add this right after the password input */}
{mode === 'signin' && (
  <div className="text-right mb-4">
    <button
      type="button"
      onClick={handleForgotPassword}
      className="text-sm text-[#2D6A4F] hover:underline"
    >
      Forgot password?
    </button>
  </div>
)}
            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] py-3.5 font-semibold text-white shadow-lg shadow-[#2D6A4F]/20 transition active:scale-[0.98] disabled:opacity-60"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-gray-400 leading-relaxed">
            By continuing you agree to keep stray cat locations private and treat every
            whiskered friend with kindness.
          </p>
        </div>
      </div>
    </div>
  );
}
