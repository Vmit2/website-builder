'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Theme {
  id: number;
  slug: string;
  name: string;
  description: string;
  demoUrl: string;
  previewImageUrl?: string;
}

interface Palette {
  id: string;
  name: string;
  colors: string[];
}

const PALETTES: Palette[] = [
  {
    id: 'pastel-pop',
    name: 'Pastel Pop',
    colors: ['#FFB3BA', '#FFCCCB', '#FFFFBA', '#BAE1FF', '#BAFFC9'],
  },
  {
    id: 'vibrant-sunset',
    name: 'Vibrant Sunset',
    colors: ['#FF6B6B', '#FFA500', '#FFD700', '#FF69B4', '#FF1493'],
  },
  {
    id: 'cool-blues',
    name: 'Cool Blues',
    colors: ['#0066CC', '#0099FF', '#00CCFF', '#00FFFF', '#0033CC'],
  },
  {
    id: 'earth-tones',
    name: 'Earth Tones',
    colors: ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#D2B48C'],
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    colors: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'],
  },
];

export default function ThemeSelector({ userId }: { userId: string }) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedPalette, setSelectedPalette] = useState<string>('pastel-pop');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const response = await fetch('/api/themes');
      const data = await response.json();

      if (data.success) {
        setThemes(data.themes);
        if (data.themes.length > 0) {
          setSelectedTheme(data.themes[0].slug);
        }
      }
    } catch (error) {
      console.error('Failed to fetch themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTheme = async () => {
    if (!selectedTheme) return;

    try {
      setSaving(true);
      const response = await fetch('/api/dashboard/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeSlug: selectedTheme,
          paletteId: selectedPalette,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Theme updated successfully!');
      } else {
        alert('Failed to update theme');
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      alert('Error saving theme');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Themes Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose a Theme</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              onClick={() => setSelectedTheme(theme.slug)}
              className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                selectedTheme === theme.slug
                  ? 'border-blue-600 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {theme.previewImageUrl && (
                <div className="relative h-40 bg-gray-100">
                  <Image
                    src={theme.previewImageUrl}
                    alt={theme.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-gray-900">{theme.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{theme.description}</p>
                <a
                  href={theme.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm hover:underline mt-2 inline-block"
                >
                  View Demo →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Palettes */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose a Color Palette</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {PALETTES.map((palette) => (
            <div
              key={palette.id}
              onClick={() => setSelectedPalette(palette.id)}
              className={`cursor-pointer rounded-lg p-4 border-2 transition-all ${
                selectedPalette === palette.id
                  ? 'border-blue-600 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-medium text-gray-900 mb-3">{palette.name}</h3>
              <div className="flex gap-2">
                {palette.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-4">
        <button
          onClick={handleSaveTheme}
          disabled={saving || !selectedTheme}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
        >
          {saving ? 'Saving...' : 'Save Theme'}
        </button>
        <button className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 font-medium transition-colors">
          Preview
        </button>
      </div>
    </div>
  );
}
