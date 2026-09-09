import { useState } from 'react';
import { X, Globe, Trash2, AlertTriangle, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SettingsProps {
  onClose: () => void;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
}

const LANGUAGES = [
  // East Asian
  { code: 'zh-CN', label: '简体中文 (Simplified Chinese)' },
  { code: 'zh-TW', label: '繁體中文 (Traditional Chinese)' },
  { code: 'ja', label: '日本語 (Japanese)' },
  { code: 'ko', label: '한국어 (Korean)' },
  
  // Southeast Asian
  { code: 'vi', label: 'Tiếng Việt (Vietnamese)' },
  { code: 'th', label: 'ภาษาไทย (Thai)' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'tl', label: 'Tagalog' },
  
  // South Asian
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'ur', label: 'اردو (Urdu)' },
  
  // European
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español (Spanish)' },
  { code: 'fr', label: 'Français (French)' },
  { code: 'de', label: 'Deutsch (German)' },
  { code: 'it', label: 'Italiano (Italian)' },
  { code: 'pt', label: 'Português (Portuguese)' },
  { code: 'ru', label: 'Русский (Russian)' },
  { code: 'pl', label: 'Polski (Polish)' },
  { code: 'uk', label: 'Українська (Ukrainian)' },
  { code: 'ro', label: 'Română (Romanian)' },
  { code: 'hu', label: 'Magyar (Hungarian)' },
  { code: 'cs', label: 'Čeština (Czech)' },
  { code: 'sv', label: 'Svenska (Swedish)' },
  { code: 'da', label: 'Dansk (Danish)' },
  { code: 'fi', label: 'Suomi (Finnish)' },
  { code: 'no', label: 'Norsk (Norwegian)' },
  
  // Middle Eastern
  { code: 'ar', label: 'العربية (Arabic)' },
  { code: 'fa', label: 'فارسی (Persian)' },
  { code: 'he', label: 'עברית (Hebrew)' },
  { code: 'tr', label: 'Türkçe (Turkish)' },
  
  // African
  { code: 'sw', label: 'Kiswahili (Swahili)' },
  { code: 'ha', label: 'Hausa' },
  { code: 'yo', label: 'Yorùbá' },
  { code: 'ig', label: 'Igbo' },
  { code: 'am', label: 'አማርኛ (Amharic)' },
  
  // Other Major Languages
  { code: 'el', label: 'Ελληνικά (Greek)' },
  { code: 'nl', label: 'Nederlands (Dutch)' },
];

// Brand color
const BRAND_COLOR = '#ace1af';

export default function Settings({ onClose, currentLanguage, onLanguageChange }: SettingsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  // Filter languages based on search
  const filteredLanguages = LANGUAGES.filter(lang =>
    lang.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError('');
    
    const { error } = await supabase.rpc('delete_user');
    
    setLoading(false);
    
    if (error) {
      setError(error.message);
    } else {
      await supabase.auth.signOut();
      window.location.href = '/';
    }
  };

  // Get current language label
  const currentLanguageLabel = LANGUAGES.find(lang => lang.code === currentLanguage)?.label || 'English';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2D6A4F]">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Language Section - COLLAPSIBLE */}
        <div className="mb-6">
          {/* Language Toggle Button - with brand color accent */}
          <button
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition bg-white"
            style={{
              borderColor: isLanguageOpen ? BRAND_COLOR : '#e5e7eb',
              boxShadow: isLanguageOpen ? `0 0 0 4px ${BRAND_COLOR}30` : 'none'
            }}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" style={{ color: BRAND_COLOR }} />
              <span className="font-medium text-gray-700">Language</span>
              <span className="text-sm text-gray-400 ml-2">
                ({currentLanguageLabel})
              </span>
            </div>
            {isLanguageOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {/* Language Dropdown - Only shows when isLanguageOpen is true */}
          {isLanguageOpen && (
            <div className="mt-3 border border-gray-200 rounded-xl p-3 bg-gray-50">
              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 transition bg-white"
                />
              </div>
              
              {/* Language List - CLICKABLE */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setIsLanguageOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl border-2 transition ${
                      currentLanguage === lang.code
                        ? 'bg-white font-semibold'
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
                    }`}
                    style={{
                      borderColor: currentLanguage === lang.code ? BRAND_COLOR : '#e5e7eb',
                      backgroundColor: currentLanguage === lang.code ? `${BRAND_COLOR}15` : 'white',
                    }}
                  >
                    {lang.label}
                    {currentLanguage === lang.code && (
                      <span className="float-right" style={{ color: BRAND_COLOR }}>✅</span>
                    )}
                  </button>
                ))}
                {filteredLanguages.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No languages found</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Delete Account Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-red-600 mb-3 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Danger Zone
          </h3>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full text-left px-4 py-3 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 transition"
            >
              🗑️ Delete Account
            </button>
          ) : (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Are you sure?</p>
                  <p className="text-sm text-red-600">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>
              </div>
              
              {error && (
                <p className="text-sm text-red-600 bg-red-100 rounded-lg px-3 py-2 mb-3">
                  {error}
                </p>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-semibold hover:bg-red-600 transition disabled:opacity-60"
                >
                  {loading ? 'Deleting...' : 'Yes, Delete Everything'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}