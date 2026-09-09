import { LogOut, Cat as CatIcon, Heart, MapPin, PawPrint } from 'lucide-react';
import { CatSpot, CATEGORY_META } from '@/lib/types';
import { useState } from 'react';
import ContactUs from './ContactUs';
import Settings from './Settings';

interface Props {
  email: string;
  mySpots: CatSpot[];
  totalLikes: number;
  onSignOut(): void;
}

export default function Profile({ email, mySpots, totalLikes, onSignOut }: Props) {
  // 👇 ALL STATE DECLARATIONS
  const [showContact, setShowContact] = useState(false);
  const [showSettings, setShowSettings] = useState(false);  // 👈 ADD THIS
  const [language, setLanguage] = useState(() => {          // 👈 ADD THIS
    return localStorage.getItem('catatlas_language') || 'en';
  });
  
  const name = email.split('@')[0];

  // 👇 LANGUAGE CHANGE FUNCTION
  const handleLanguageChange = (lang: string) => {          // 👈 ADD THIS
    setLanguage(lang);
    localStorage.setItem('catatlas_language', lang);
    window.location.reload();
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F6F6F1] pb-28">
      {/* HEADER */}
      <header className="bg-[#2D6A4F] px-5 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)] text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FEFE] text-[#2D6A4F] shadow-lg">
              <CatIcon className="h-9 w-9" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-extrabold capitalize">{name}</h1>
              <p className="truncate text-sm text-[#FEFAE0]/90">{email}</p>
            </div>
          </div>
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition text-white flex-shrink-0"
            aria-label="Settings"
          >
            <span className="text-xl">⚙️</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="px-5 pt-4">
        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat icon={PawPrint} value={mySpots.length} label="Spots" />
          <Stat icon={Heart} value={totalLikes} label="Likes" />
          <Stat
            icon={MapPin}
            value={mySpots.filter((s) => s.category === 'emergency_rescue').length}
            label="Rescues"
          />
        </div>

        {/* My Spots */}
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-bold text-gray-900">My Cat Spots</h2>
          {mySpots.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <PawPrint className="mx-auto mb-2 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">
                You haven't shared any cats yet. Tap the green button to add your first one.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {mySpots.map((spot) => {
                const meta = CATEGORY_META[spot.category];
                return (
                  <div key={spot.id} className="relative aspect-square overflow-hidden rounded-xl bg-gray-200">
                    {spot.image_url ? (
                      <img src={spot.image_url} alt={spot.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-300">
                        <CatIcon className="h-8 w-8 text-white/50" />
                      </div>
                    )}
                    <span
                      className="absolute left-1 top-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium text-white"
                      style={{ backgroundColor: meta.color }}
                    >
                      {meta.short}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Contact Us Button */}
        <button
          onClick={() => setShowContact(true)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] py-3.5 font-semibold text-white shadow-lg shadow-[#2D6A4F]/20 transition active:scale-[0.98]"
        >
          <span className="text-lg">📧</span>
          Contact Us
        </button>

        {/* Sign Out Button */}
        <button
          onClick={onSignOut}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 py-3.5 font-semibold text-red-600 transition active:scale-[0.98]"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      {/* Contact Us Modal */}
      {showContact && (
        <ContactUs onClose={() => setShowContact(false)} />
      )}

      {/* 👇 SETTINGS MODAL - ADD THIS 👇 */}
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          currentLanguage={language}
          onLanguageChange={handleLanguageChange}
        />
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Heart;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 py-3 text-center backdrop-blur">
      <Icon className="mx-auto mb-1 h-5 w-5 text-[#FEFAE0]" />
      <div className="text-xl font-extrabold">{value}</div>
      <div className="text-[11px] text-[#FEFAE0]/80">{label}</div>
    </div>
  );
}