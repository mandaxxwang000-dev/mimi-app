import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setMessage('✅ Password updated successfully! You can now login.');
      // Redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2D6A4F] p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-[#2D6A4F] mb-2">
          Reset Password
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          Enter your new password below.
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 transition"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {message && (
            <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] py-3.5 font-semibold text-white shadow-lg shadow-[#2D6A4F]/20 transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          Remember your password?{' '}
          <a href="/" className="text-[#2D6A4F] hover:underline font-medium">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}