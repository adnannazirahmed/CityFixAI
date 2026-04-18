'use client';

import { useEffect, useRef } from 'react';
import type { MapMarker } from '@/types';
import { getMarkerColor, getCategoryLabel, getStatusLabel } from '@/lib/utils';

interface IssueMapProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (id: string) => void;
}

function buildIconHtml(color: string): string {
  return `<div style="
    width: 32px; height: 32px;
    background: ${color};
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
  ">
    <div style="
      width: 10px; height: 10px;
      background: white;
      border-radius: 50%;
      transform: rotate(45deg);
    "></div>
  </div>`;
}

export function IssueMap({
  markers,
  center = [42.2626, -71.8023], // Worcester, MA
  zoom = 13,
  height = '500px',
  onMarkerClick,
}: IssueMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;
    // Leaflet stamps _leaflet_id on the container when initialized.
    // In React StrictMode effects run twice — bail out if already stamped.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((mapRef.current as any)._leaflet_id) return;

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default icon URLs for webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: false });
      mapInstanceRef.current = map;

      // Tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      map.setView(center, zoom);

      // Add markers
      markers.forEach((marker) => {
        const color = getMarkerColor(marker.priority_level);

        // Custom colored SVG pin
        const iconHtml = buildIconHtml(color);

        const icon = L.divIcon({
          html: iconHtml,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        const leafletMarker = L.marker([marker.lat, marker.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif; min-width: 200px;">
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #111;">${marker.title}</div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px;">
                <span style="background: ${color}20; color: ${color}; border: 1px solid ${color}40; border-radius: 9999px; padding: 2px 8px; font-size: 11px; font-weight: 600;">
                  ${marker.priority_level.toUpperCase()}
                </span>
                <span style="background: #f3f4f6; color: #374151; border-radius: 9999px; padding: 2px 8px; font-size: 11px;">
                  ${getCategoryLabel(marker.category)}
                </span>
              </div>
              <div style="font-size: 12px; color: #6b7280;">
                Status: <strong>${getStatusLabel(marker.status)}</strong>
              </div>
              ${marker.neighborhood ? `<div style="font-size: 12px; color: #6b7280;">Area: ${marker.neighborhood}</div>` : ''}
              ${onMarkerClick ? `<button onclick="window.__mapMarkerClick('${marker.id}')" style="
                margin-top: 8px; width: 100%;
                background: #2563EB; color: white;
                border: none; border-radius: 6px;
                padding: 6px 12px; font-size: 12px; cursor: pointer; font-weight: 600;
              ">View Details →</button>` : ''}
            </div>
          `);

        markersRef.current.push(leafletMarker);
      });

      // Expose click handler globally for popup buttons
      if (onMarkerClick) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__mapMarkerClick = onMarkerClick;
      }

      // Fit bounds if we have markers
      if (markers.length > 0) {
        const group = L.featureGroup(markersRef.current as L.Layer[]);
        map.fitBounds(group.getBounds().pad(0.2));
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).__mapMarkerClick;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when they change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      // Remove existing markers
      markersRef.current.forEach((m) => (m as L.Marker).remove());
      markersRef.current = [];

      const map = mapInstanceRef.current as L.Map;

      markers.forEach((marker) => {
        const color = getMarkerColor(marker.priority_level);
        const iconHtml = buildIconHtml(color);

        const icon = L.divIcon({
          html: iconHtml, className: '', iconSize: [32, 32],
          iconAnchor: [16, 32], popupAnchor: [0, -32],
        });

        const leafletMarker = L.marker([marker.lat, marker.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif; min-width: 180px;">
              <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">${marker.title}</div>
              <span style="background: ${color}20; color: ${color}; border-radius: 9999px; padding: 2px 8px; font-size: 11px; font-weight: 600;">
                ${marker.priority_level.toUpperCase()}
              </span>
            </div>
          `);

        if (onMarkerClick) {
          leafletMarker.on('click', () => {
            leafletMarker.openPopup();
          });
        }

        markersRef.current.push(leafletMarker);
      });
    });
  }, [markers, onMarkerClick]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div
        ref={mapRef}
        style={{ height, width: '100%', borderRadius: '0.75rem' }}
        className="z-0"
      />
    </>
  );
}
