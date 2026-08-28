import { Compass, Map as MapIcon, Store, User, Plus } from 'lucide-react';

export type Tab = 'discover' | 'map' | 'explore' | 'profile';

const TABS: { id: Tab; label: string; icon: typeof Compass }[] = [
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'map', label: 'Map', icon: MapIcon },
  { id: 'explore', label: 'Deals', icon: Store },
  { id: 'profile', label: 'Profile', icon: User },
];

interface Props {
  active: Tab;
  onChange: (t: Tab) => void;
  onAdd: () => void;
}

export default function BottomNav({ active, onChange, onAdd }: Props) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-[1000] border-t border-black/5 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2">
        {TABS.slice(0, 2).map((t) => (
          <NavButton key={t.id} tab={t} active={active === t.id} onClick={() => onChange(t.id)} />
        ))}

        <button
          onClick={onAdd}
          aria-label="Add a cat spot"
          className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#2D6A4F] text-white shadow-lg shadow-[#2D6A4F]/30 ring-4 ring-white transition active:scale-90"
        >
          <Plus className="h-7 w-7" strokeWidth={2.5} />
        </button>

        {TABS.slice(2).map((t) => (
          <NavButton key={t.id} tab={t} active={active === t.id} onClick={() => onChange(t.id)} />
        ))}
      </div>
    </nav>
  );
}

function NavButton({
  tab,
  active,
  onClick,
}: {
  tab: { id: Tab; label: string; icon: typeof Compass };
  active: boolean;
  onClick: () => void;
}) {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-1 py-2.5 transition active:scale-95"
    >
      <Icon
        className={`h-6 w-6 transition-colors ${active ? 'text-[#2D6A4F]' : 'text-gray-400'}`}
        strokeWidth={active ? 2.5 : 2}
      />
      <span
        className={`text-[11px] font-medium transition-colors ${
          active ? 'text-[#2D6A4F]' : 'text-gray-400'
        }`}
      >
        {tab.label}
      </span>
    </button>
  );
}
