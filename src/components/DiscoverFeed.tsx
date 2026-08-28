import { Heart, MessageCircle, Share2, MapPin, Coffee, Cat as CatIcon } from 'lucide-react';
import { CatSpot, CATEGORY_META } from '@/lib/types';

interface Props {
  spots: CatSpot[];
  likedIds: Set<string>;
  onToggleLike: (spot: CatSpot) => void;
  onOpenDeals: () => void;
  onLocate: (spot: CatSpot) => void;
}

export default function DiscoverFeed({
  spots,
  likedIds,
  onToggleLike,
  onOpenDeals,
  onLocate,
}: Props) {
  if (spots.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center text-white">
        <CatIcon className="h-14 w-14 text-[#FEFAE0]" />
        <h2 className="text-xl font-bold">No cats yet</h2>
        <p className="text-white/70">
          Tap the green button below to share the first cat spotting.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full snap-y snap-mandatory overflow-y-scroll scroll-smooth">
      {spots.map((spot) => (
        <FeedCard
          key={spot.id}
          spot={spot}
          liked={likedIds.has(spot.id)}
          onToggleLike={() => onToggleLike(spot)}
          onOpenDeals={onOpenDeals}
          onLocate={() => onLocate(spot)}
        />
      ))}
    </div>
  );
}

function FeedCard({
  spot,
  liked,
  onToggleLike,
  onOpenDeals,
  onLocate,
}: {
  spot: CatSpot;
  liked: boolean;
  onToggleLike: () => void;
  onOpenDeals: () => void;
  onLocate: () => void;
}) {
  const meta = CATEGORY_META[spot.category];

  const handleShare = async () => {
    const shareData = {
      title: `${spot.title} on Cat Atlas`,
      text: spot.notes || 'Check out this cat on Cat Atlas!',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
      }
    } catch {
      /* user dismissed the share sheet */
    }
  };

  return (
    <section className="relative h-full w-full snap-start snap-always overflow-hidden bg-black">
      {spot.image_url ? (
        <img
          src={spot.image_url}
          alt={spot.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#2D6A4F]">
          <CatIcon className="h-24 w-24 text-white/40" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40" />

      <div className="absolute left-4 right-20 top-[calc(env(safe-area-inset-top)+1rem)]">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white shadow"
          style={{ backgroundColor: meta.color }}
        >
          <CatIcon className="h-3.5 w-3.5" />
          {meta.label}
        </span>
      </div>

      <div className="absolute bottom-6 left-4 right-24 text-white">
        <h3 className="text-2xl font-extrabold leading-tight drop-shadow">{spot.title}</h3>
        {spot.notes && (
          <p className="mt-1.5 line-clamp-3 text-sm text-white/90 drop-shadow">{spot.notes}</p>
        )}
        <button
          onClick={onOpenDeals}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FEFAE0] px-4 py-2.5 text-sm font-bold text-[#2D6A4F] shadow-lg transition active:scale-95"
        >
          <Coffee className="h-4 w-4" />
          Partner Cafe Deal
        </button>
      </div>

      <div className="absolute bottom-6 right-3 flex flex-col items-center gap-5">
        <ActionButton
          onClick={onToggleLike}
          active={liked}
          activeColor="#B91C1C"
          count={spot.like_count}
          label="Like"
        >
          <Heart className="h-7 w-7" fill={liked ? '#B91C1C' : 'none'} />
        </ActionButton>

        <ActionButton onClick={handleShare} label="Share">
          <MessageCircle className="h-7 w-7" />
        </ActionButton>

        <ActionButton onClick={handleShare} label="Share">
          <Share2 className="h-7 w-7" />
        </ActionButton>

        <ActionButton onClick={onLocate} label="Pin">
          <MapPin className="h-7 w-7" />
        </ActionButton>
      </div>
    </section>
  );
}

function ActionButton({
  children,
  onClick,
  active,
  activeColor,
  count,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  activeColor?: string;
  count?: number;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex flex-col items-center gap-1 text-white transition active:scale-90"
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm"
        style={active && activeColor ? { color: activeColor } : undefined}
      >
        {children}
      </span>
      {typeof count === 'number' && (
        <span className="text-xs font-semibold drop-shadow">{count}</span>
      )}
    </button>
  );
}
