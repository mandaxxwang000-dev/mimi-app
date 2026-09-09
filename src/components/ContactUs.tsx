import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, X } from 'lucide-react';

interface ContactUsProps {
  onClose: () => void;
  userId?: string;
}

export default function ContactUs({ onClose, userId }: ContactUsProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!subject || !message) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    // Save to Supabase
    const { error: supabaseError } = await supabase
      .from('feedback')
      .insert([
        {
          subject,
          message,
          user_id: userId || null,
          status: 'new',
          created_at: new Date().toISOString(),
        },
      ]);

    setLoading(false);

    if (supabaseError) {
      setError(supabaseError.message);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-xl font-bold text-green-600">Thank You!</h2>
            <p className="text-gray-600 mt-2">Your feedback has been sent. We'll get back to you soon.</p>
            <button
              onClick={onClose}
              className="mt-4 w-full bg-[#2D6A4F] text-white py-2 rounded-xl font-semibold hover:bg-[#1D4A3F] transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#2D6A4F]">📧 Contact Us</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 transition"
              required
            >
              <option value="">Select a topic...</option>
              <option value="bug">🐛 Bug Report</option>
              <option value="feature">💡 Feature Request</option>
              <option value="complaint">😤 Complaint</option>
              <option value="question">❓ Question</option>
              <option value="other">📝 Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Describe your issue or feedback..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 transition resize-none"
              rows={5}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] py-3.5 font-semibold text-white shadow-lg shadow-[#2D6A4F]/20 transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Sending...' : 'Send Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}