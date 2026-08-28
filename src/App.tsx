import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { CatSpot, VenueDeal, Shelter } from '@/lib/types';
import AuthScreen from '@/components/AuthScreen';
import BottomNav, { Tab } from '@/components/BottomNav';
import DiscoverFeed from '@/components/DiscoverFeed';
import ExploreGrid from '@/components/ExploreGrid';
import MapView from '@/components/MapView';
import Profile from '@/components/Profile';
import UploadModal from '@/components/UploadModal';

function Shell() {
  const { user, loading, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('discover');
  const [showUpload, setShowUpload] = useState(false);

  const [spots, setSpots] = useState<CatSpot[]>([]);
  const [deals, setDeals] = useState<VenueDeal[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [focusSpot, setFocusSpot] = useState<CatSpot | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setDataError(null);
    const [spotsRes, dealsRes, sheltersRes, likesRes] = await Promise.all([
      supabase.from('cat_spots').select('*').order('created_at', { ascending: false }),
      supabase.from('venue_deals').select('*').order('created_at', { ascending: true }),
      supabase.from('shelters').select('*').order('created_at', { ascending: true }),
      supabase.from('cat_likes').select('cat_spot_id'),
    ]);

    if (spotsRes.error || dealsRes.error || sheltersRes.error) {
      setDataError('We could not load Cat Atlas right now. Pull to try again.');
      return;
    }

    setSpots(spotsRes.data as CatSpot[]);
    setDeals(dealsRes.data as VenueDeal[]);
    setShelters(sheltersRes.data as Shelter[]);
    setLikedIds(new Set((likesRes.data ?? []).map((l) => l.cat_spot_id as string)));
  }, [user]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const toggleLike = useCallback(async (spot: CatSpot) => {
    const wasLiked = likedIds.has(spot.id);
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(spot.id);
      else next.add(spot.id);
      return next;
    });
    setSpots((prev) =>
      prev.map((s) =>
        s.id === spot.id
          ? { ...s, like_count: Math.max(0, s.like_count + (wasLiked ? -1 : 1)) }
          : s,
      ),
    );

    const { data, error } = await supabase.rpc('toggle_cat_like', { target: spot.id });
    if (error) {
      // revert on failure
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.add(spot.id);
        else next.delete(spot.id);
        return next;
      });
      setSpots((prev) =>
        prev.map((s) =>
          s.id === spot.id
            ? { ...s, like_count: Math.max(0, s.like_count + (wasLiked ? 1 : -1)) }
            : s,
        ),
      );
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (row && typeof row.like_count === 'number') {
      setSpots((prev) =>
        prev.map((s) => (s.id === spot.id ? { ...s, like_count: row.like_count } : s)),
      );
    }
  }, [likedIds]);

  const mySpots = useMemo(
    () => spots.filter((s) => s.user_id === user?.id),
    [spots, user],
  );
  const totalLikes = useMemo(
    () => mySpots.reduce((sum, s) => sum + s.like_count, 0),
    [mySpots],
  );
  const adoptable = useMemo(
    () => spots.filter((s) => s.category === 'emergency_rescue'),
    [spots],
  );

  const locateOnMap = (spot: CatSpot) => {
    setFocusSpot(spot);
    setTab('map');
  };

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#2D6A4F]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <div className="fixed inset-0 mx-auto flex max-w-lg flex-col bg-black">
      <main className="relative flex-1 overflow-hidden">
        {dataError && (
          <div className="absolute inset-x-0 top-0 z-[900] bg-red-600 px-4 py-2 text-center text-sm text-white">
            {dataError}
          </div>
        )}

        <div className={tab === 'discover' ? 'h-full' : 'hidden'}>
          <DiscoverFeed
            spots={spots}
            likedIds={likedIds}
            onToggleLike={toggleLike}
            onOpenDeals={() => setTab('explore')}
            onLocate={locateOnMap}
          />
        </div>
        <div className={tab === 'map' ? 'h-full' : 'hidden'}>
          <MapView catSpots={spots} deals={deals} shelters={shelters} focus={focusSpot} />
        </div>
        <div className={tab === 'explore' ? 'h-full' : 'hidden'}>
          <ExploreGrid deals={deals} shelters={shelters} adoptable={adoptable} />
        </div>
        <div className={tab === 'profile' ? 'h-full' : 'hidden'}>
          <Profile
            email={user.email ?? ''}
            mySpots={mySpots}
            totalLikes={totalLikes}
            onSignOut={signOut}
          />
        </div>
      </main>

      <BottomNav active={tab} onChange={setTab} onAdd={() => setShowUpload(true)} />

      {showUpload && (
        <UploadModal
          userId={user.id}
          onClose={() => setShowUpload(false)}
          onCreated={loadData}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
