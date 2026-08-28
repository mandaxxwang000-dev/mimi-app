import { BadgeCheck, Zap, Store, Coffee, Heart, PawPrint } from 'lucide-react';
import { VenueDeal, Shelter, CatSpot } from '@/lib/types';

interface Props {
  deals: VenueDeal[];
  shelters: Shelter[];
  adoptable: CatSpot[];
}

type Card =
  | { kind: 'deal'; data: VenueDeal }
  | { kind: 'shelter'; data: Shelter }
  | { kind: 'adopt'; data: CatSpot };

export default function ExploreGrid({ deals, shelters, adoptable }: Props) {
  const cards: Card[] = [];
  const maxLen = Math.max(deals.length, shelters.length, adoptable.length);
  for (let i = 0; i < maxLen; i++) {
    if (deals[i]) cards.push({ kind: 'deal', data: deals[i] });
    if (adoptable[i]) cards.push({ kind: 'adopt', data: adoptable[i] });
    if (shelters[i]) cards.push({ kind: 'shelter', data: shelters[i] });
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F6F6F1] pb-28">
      <header className="sticky top-0 z-10 bg-[#2D6A4F] px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] text-white">
        <h1 className="text-2xl font-extrabold">Explore Deals</h1>
        <p className="text-sm text-[#FEFAE0]/90">Cafe passes, pet shop offers & cats to adopt</p>
      </header>

      <div className="columns-2 gap-3 p-3 [&>*]:mb-3">
        {cards.map((card) => (
          <ExploreCard key={`${card.kind}-${card.data.id}`} card={card} />
        ))}
      </div>
    </div>
  );
}

function Badge({
  icon: Icon,
  label,
  bg,
  fg,
}: {
  icon: typeof Zap;
  label: string;
  bg: string;
  fg: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{ backgroundColor: bg, color: fg }}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function ExploreCard({ card }: { card: Card }) {
  if (card.kind === 'deal') {
    const d = card.data;
    const isCafe = d.deal_type === 'cat_cafe';
    return (
      <article className="break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="relative">
          <img src={d.image_url} alt={d.name} className="w-full object-cover" loading="lazy" />
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {d.badge === 'Flash Deal' && (
              <Badge icon={Zap} label="Flash Deal" bg="#B45309" fg="#fff" />
            )}
            {d.badge === 'Shelter Verified' && (
              <Badge icon={BadgeCheck} label="Verified" bg="#2D6A4F" fg="#fff" />
            )}
            {d.badge === 'Partner Venue' && (
              <Badge icon={isCafe ? Coffee : Store} label="Partner" bg="#FEFAE0" fg="#2D6A4F" />
            )}
          </div>
        </div>
        <div className="p-3">
          <div className="mb-1 flex items-center gap-1 text-[11px] font-medium text-[#2D6A4F]">
            {isCafe ? <Coffee className="h-3.5 w-3.5" /> : <Store className="h-3.5 w-3.5" />}
            {isCafe ? 'Cat Cafe' : 'Pet Shop'}
          </div>
          <h3 className="text-sm font-bold leading-tight text-gray-900">{d.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-gray-500">{d.description}</p>
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-sm font-extrabold text-[#B45309]">{d.price}</span>
            <span className="rounded-full bg-[#2D6A4F] px-3 py-1 text-[11px] font-semibold text-white">
              View
            </span>
          </div>
        </div>
      </article>
    );
  }

  if (card.kind === 'shelter') {
    const s = card.data;
    return (
      <article className="break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="relative">
          <img src={s.image_url} alt={s.name} className="w-full object-cover" loading="lazy" />
          <div className="absolute left-2 top-2">
            {s.verified && <Badge icon={BadgeCheck} label="Shelter Verified" bg="#2D6A4F" fg="#fff" />}
          </div>
        </div>
        <div className="p-3">
          <div className="mb-1 flex items-center gap-1 text-[11px] font-medium text-[#2D6A4F]">
            <PawPrint className="h-3.5 w-3.5" />
            Adoption Shelter
          </div>
          <h3 className="text-sm font-bold leading-tight text-gray-900">{s.name}</h3>
          <p className="mt-1 text-xs text-gray-500">{s.address}</p>
          <button className="mt-2.5 w-full rounded-full bg-[#FEFAE0] py-1.5 text-[11px] font-bold text-[#2D6A4F]">
            Meet the cats
          </button>
        </div>
      </article>
    );
  }

  const c = card.data;
  return (
    <article className="break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="relative">
        {c.image_url ? (
          <img src={c.image_url} alt={c.title} className="w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex aspect-square items-center justify-center bg-[#2D6A4F]">
            <PawPrint className="h-10 w-10 text-white/40" />
          </div>
        )}
        <div className="absolute left-2 top-2">
          <Badge icon={Heart} label="Needs a home" bg="#B91C1C" fg="#fff" />
        </div>
      </div>
      <div className="p-3">
        <div className="mb-1 flex items-center gap-1 text-[11px] font-medium text-[#B91C1C]">
          <Heart className="h-3.5 w-3.5" />
          Adoptable
        </div>
        <h3 className="text-sm font-bold leading-tight text-gray-900">{c.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-gray-500">{c.notes || 'Looking for a loving home.'}</p>
        <button className="mt-2.5 w-full rounded-full bg-[#2D6A4F] py-1.5 text-[11px] font-bold text-white">
          Enquire
        </button>
      </div>
    </article>
  );
}
