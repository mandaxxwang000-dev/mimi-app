import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CatSpot, VenueDeal, Shelter, CATEGORY_META } from '@/lib/types';

interface Props {
  catSpots: CatSpot[];
  deals: VenueDeal[];
  shelters: Shelter[];
  focus: CatSpot | null;
}

function pawIcon(color: string) {
  const svg = `
    <svg width="30" height="30" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6" cy="9" r="2"/><circle cx="10" cy="6" r="2"/>
      <circle cx="14" cy="6" r="2"/><circle cx="18" cy="9" r="2"/>
      <path d="M12 10c-2.5 0-4.5 2-4.5 4.2 0 1.7 1.4 2.8 3 2.8.6 0 1-.3 1.5-.3s.9.3 1.5.3c1.6 0 3-1.1 3-2.8C16.5 12 14.5 10 12 10z"/>
    </svg>`;
  return L.divIcon({
    className: 'cat-atlas-marker',
    html: `<div style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))">${svg}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
  });
}

// Deterministic small offset so exact stray locations stay private.
function jitter(spot: CatSpot): [number, number] {
  let h = 0;
  for (let i = 0; i < spot.id.length; i++) h = (h * 31 + spot.id.charCodeAt(i)) >>> 0;
  const angle = (h % 360) * (Math.PI / 180);
  const dist = 0.0011 + ((h >> 9) % 100) / 100000; // ~120-230m
  return [spot.lat + Math.sin(angle) * dist, spot.lng + Math.cos(angle) * dist];
}

const PAW = {
  green: pawIcon('#2D6A4F'),
  red: pawIcon('#B91C1C'),
  amber: pawIcon('#B45309'),
};

export default function MapView({ catSpots, deals, shelters, focus }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: false }).setView(
      [37.7749, -122.4194],
      14,
    );
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    catSpots.forEach((spot) => {
      const meta = CATEGORY_META[spot.category];
      if (spot.category === 'stray_spotting' || spot.category === 'emergency_rescue') {
        const [jlat, jlng] = jitter(spot);
        L.circle([jlat, jlng], {
          radius: 200,
          color: meta.color,
          weight: 1.5,
          fillColor: meta.color,
          fillOpacity: 0.15,
        })
          .addTo(layer)
          .bindPopup(
            `<strong>${escapeHtml(spot.title)}</strong><br/><span style="color:${meta.color}">${meta.label}</span><br/><em>Approximate area — exact spot hidden for safety.</em>`,
          );
        const icon = spot.category === 'emergency_rescue' ? PAW.red : PAW.green;
        L.marker([jlat, jlng], { icon }).addTo(layer);
      } else {
        L.marker([spot.lat, spot.lng], { icon: PAW.amber })
          .addTo(layer)
          .bindPopup(`<strong>${escapeHtml(spot.title)}</strong><br/>${meta.label}`);
      }
    });

    deals.forEach((d) => {
      L.marker([d.lat, d.lng], { icon: PAW.green })
        .addTo(layer)
        .bindPopup(
          `<strong>${escapeHtml(d.name)}</strong><br/>${escapeHtml(d.price)} · ${escapeHtml(
            d.address,
          )}`,
        );
    });

    shelters.forEach((s) => {
      L.marker([s.lat, s.lng], { icon: PAW.green })
        .addTo(layer)
        .bindPopup(`<strong>${escapeHtml(s.name)}</strong><br/>Verified shelter · ${escapeHtml(s.address)}`);
    });
  }, [catSpots, deals, shelters]);

  useEffect(() => {
    if (focus && mapRef.current) {
      const [jlat, jlng] =
        focus.category === 'partner_venue' ? [focus.lat, focus.lng] : jitter(focus);
      mapRef.current.flyTo([jlat, jlng], 16, { duration: 0.8 });
    }
  }, [focus]);

  return (
    <div className="relative h-full">
      <div ref={containerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute left-4 right-4 top-[calc(env(safe-area-inset-top)+1rem)] z-[500]">
        <div className="pointer-events-auto rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
          <h1 className="text-lg font-extrabold text-[#2D6A4F]">Cat Map</h1>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-600">
            <Legend color="#2D6A4F" label="Strays & venues" />
            <Legend color="#B91C1C" label="Rescues" />
            <span className="text-gray-400">Circles show a 200m safety area</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );
}
