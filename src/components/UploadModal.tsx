import { useRef, useState } from 'react';
import { X, Upload, Loader2, MapPin, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CatCategory, CATEGORY_META } from '@/lib/types';

interface Props {
  userId: string;
  onClose: () => void;
  onCreated: () => void;
}

const CATEGORIES: CatCategory[] = ['stray_spotting', 'emergency_rescue', 'partner_venue'];

export default function UploadModal({ userId, onClose, onCreated }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<CatCategory>('stray_spotting');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const useMyLocation = () => {
    setLocating(true);
    setError(null);
    if (!navigator.geolocation) {
      setCoords({ lat: 37.7749, lng: -122.4194 });
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setCoords({ lat: 37.7749, lng: -122.4194 });
        setLocating(false);
      },
      { timeout: 8000 },
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Give your cat a name or title.');
      return;
    }
    setBusy(true);
    setError(null);

    let imageUrl = '';
    try {
      if (file) {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('cat-photos')
          .upload(path, file, { contentType: file.type });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('cat-photos').getPublicUrl(path);
        imageUrl = data.publicUrl;
      }

      const loc = coords ?? {
        lat: 37.7749 + (Math.random() - 0.5) * 0.02,
        lng: -122.4194 + (Math.random() - 0.5) * 0.02,
      };

      const { error: insErr } = await supabase.from('cat_spots').insert({
        user_id: userId,
        image_url: imageUrl,
        title: title.trim(),
        notes: notes.trim(),
        category,
        lat: loc.lat,
        lng: loc.lng,
      });
      if (insErr) throw insErr;

      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
      <div className="animate-[slideUp_.25s_ease-out] max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">Add a Cat Spot</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-[#FEFAE0]/50 transition hover:border-[#2D6A4F]"
          >
            {preview ? (
              <img src={preview} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#2D6A4F]">
                <Upload className="h-8 w-8" />
                <span className="text-sm font-semibold">Tap to add a photo</span>
              </div>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => {
                const meta = CATEGORY_META[c];
                const active = category === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className="rounded-xl border-2 px-2 py-2.5 text-xs font-semibold transition"
                    style={{
                      borderColor: active ? meta.color : '#e5e7eb',
                      backgroundColor: active ? meta.color : '#fff',
                      color: active ? '#fff' : '#374151',
                    }}
                  >
                    {meta.short}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Name / Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={60}
              placeholder="e.g. Ginger by the bakery"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={280}
              placeholder="Friendly? Needs food? Anything worth noting…"
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20"
            />
          </div>

          <button
            onClick={useMyLocation}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition active:scale-[0.98]"
          >
            {locating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : coords ? (
              <Check className="h-4 w-4 text-[#2D6A4F]" />
            ) : (
              <MapPin className="h-4 w-4 text-[#2D6A4F]" />
            )}
            {coords ? 'Location captured' : 'Use my current location'}
          </button>
          {(category === 'stray_spotting' || category === 'emergency_rescue') && (
            <p className="-mt-2 text-xs text-gray-400">
              For safety, stray and rescue pins only ever show a 200m area, never the exact spot.
            </p>
          )}

          {error && (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] py-3.5 font-semibold text-white shadow-lg shadow-[#2D6A4F]/20 transition active:scale-[0.98] disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Share Cat Spot
          </button>
        </div>
      </div>
    </div>
  );
}
