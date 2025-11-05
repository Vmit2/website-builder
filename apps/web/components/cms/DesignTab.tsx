'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Check, Plus, X } from 'lucide-react';

const GOOGLE_FONTS = [
  { name: 'Poppins', family: 'Poppins' },
  { name: 'Inter', family: 'Inter' },
  { name: 'Lato', family: 'Lato' },
  { name: 'Playfair Display', family: 'Playfair Display' },
  { name: 'Montserrat', family: 'Montserrat' },
];

const COLOR_PALETTES = {
  solid: [
    { id: 'cool-blues', name: 'Cool Blues', colors: ['#0066CC', '#0099FF', '#00CCFF', '#00FFFF', '#0033CC'] },
    { id: 'vibrant-sunset', name: 'Vibrant Sunset', colors: ['#FF6B6B', '#FFA500', '#FFD700', '#FF69B4', '#FF1493'] },
    { id: 'earth-tones', name: 'Earth Tones', colors: ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#D2B48C'] },
    { id: 'pastel-pop', name: 'Pastel Pop', colors: ['#FFB3BA', '#FFCCCB', '#FFFFBA', '#BAE1FF', '#BAFFC9'] },
    { id: 'monochrome', name: 'Monochrome', colors: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'] },
  ],
  gradient: [
    { id: 'sunset-grad', name: 'Sunset', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'ocean-grad', name: 'Ocean', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'peach-grad', name: 'Peach', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  ],
};

interface DesignTabProps {
  userPlan: 'free' | 'starter' | 'pro';
  currentFont?: string;
  currentPalette?: string;
  currentLogo?: string;
  onFontChange?: (font: string) => void;
  onPaletteChange?: (palette: string, colors: any) => void;
  onLogoChange?: (logoUrl: string) => void;
}

interface CustomPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export default function DesignTab({
  userPlan,
  currentFont = 'Poppins',
  currentPalette = '',
  currentLogo,
  onFontChange,
  onPaletteChange,
  onLogoChange,
}: DesignTabProps) {
  const [selectedFont, setSelectedFont] = useState(currentFont);
  const [selectedPalette, setSelectedPalette] = useState(currentPalette);
  const [showCustomPalette, setShowCustomPalette] = useState(false);
  const [customPalette, setCustomPalette] = useState<CustomPalette>({
    primary: '#000000',
    secondary: '#666666',
    accent: '#0066cc',
    background: '#ffffff',
    text: '#333333',
  });

  // Sync state with props when they change
  useEffect(() => {
    setSelectedFont(currentFont);
  }, [currentFont]);

  useEffect(() => {
    setSelectedPalette(currentPalette);
  }, [currentPalette]);

  const availableFonts = userPlan === 'free' ? GOOGLE_FONTS.slice(0, 3) : GOOGLE_FONTS;
  const availableSolidPalettes = userPlan === 'free' ? COLOR_PALETTES.solid.slice(0, 3) : COLOR_PALETTES.solid;
  const availableGradientPalettes = userPlan === 'free' ? [] : userPlan === 'starter' ? COLOR_PALETTES.gradient.slice(0, 1) : COLOR_PALETTES.gradient;

  const handleFontSelect = (font: string) => {
    setSelectedFont(font);
    onFontChange?.(font);
  };

  const handlePaletteSelect = (paletteId: string, paletteData: any) => {
    setSelectedPalette(paletteId);
    onPaletteChange?.(paletteId, paletteData);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onloadend = () => onLogoChange?.(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Font Family</h3>
        <div className="space-y-2">
          {availableFonts.map((font) => (
            <button
              key={font.name}
              onClick={() => handleFontSelect(font.name)}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                selectedFont === font.name ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 dark:text-gray-100" style={{ fontFamily: font.family }}>{font.name}</p>
                {selectedFont === font.name && <Check className="w-5 h-5 text-blue-600" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Color Palettes</h3>
        <div className="space-y-2">
          {availableSolidPalettes.map((palette) => (
            <button
              key={palette.id}
              onClick={() => handlePaletteSelect(palette.id, { type: 'solid', colors: palette.colors })}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                selectedPalette === palette.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{palette.name}</p>
                {selectedPalette === palette.id && <Check className="w-4 h-4 text-blue-600" />}
              </div>
              <div className="flex gap-1">
                {palette.colors.map((color, idx) => (
                  <div key={idx} className="w-8 h-8 rounded border border-gray-200" style={{ backgroundColor: color }} />
                ))}
              </div>
            </button>
          ))}
          {availableGradientPalettes.map((palette) => (
            <button
              key={palette.id}
              onClick={() => handlePaletteSelect(palette.id, { type: 'gradient', gradient: palette.gradient })}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                selectedPalette === palette.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{palette.name}</p>
              <div className="w-full h-12 rounded" style={{ background: palette.gradient }} />
            </button>
          ))}

          {/* Custom Palette (Pro only) */}
          {userPlan === 'pro' && (
            <div className="mt-4">
              <button
                onClick={() => setShowCustomPalette(!showCustomPalette)}
                className="w-full p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Create Custom Palette
                    </span>
                  </div>
                  {showCustomPalette && <X className="w-4 h-4 text-gray-500" />}
                </div>
              </button>

              {showCustomPalette && (
                <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Primary
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={customPalette.primary}
                          onChange={(e) => setCustomPalette({ ...customPalette, primary: e.target.value })}
                          className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customPalette.primary}
                          onChange={(e) => setCustomPalette({ ...customPalette, primary: e.target.value })}
                          className="flex-1 px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Secondary
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={customPalette.secondary}
                          onChange={(e) => setCustomPalette({ ...customPalette, secondary: e.target.value })}
                          className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customPalette.secondary}
                          onChange={(e) => setCustomPalette({ ...customPalette, secondary: e.target.value })}
                          className="flex-1 px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="#666666"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Accent
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={customPalette.accent}
                          onChange={(e) => setCustomPalette({ ...customPalette, accent: e.target.value })}
                          className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customPalette.accent}
                          onChange={(e) => setCustomPalette({ ...customPalette, accent: e.target.value })}
                          className="flex-1 px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="#0066cc"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Background
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={customPalette.background}
                          onChange={(e) => setCustomPalette({ ...customPalette, background: e.target.value })}
                          className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customPalette.background}
                          onChange={(e) => setCustomPalette({ ...customPalette, background: e.target.value })}
                          className="flex-1 px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Text
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={customPalette.text}
                          onChange={(e) => setCustomPalette({ ...customPalette, text: e.target.value })}
                          className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customPalette.text}
                          onChange={(e) => setCustomPalette({ ...customPalette, text: e.target.value })}
                          className="flex-1 px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="#333333"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        const customId = 'custom-palette';
                        onPaletteChange?.(customId, { type: 'custom', colors: customPalette });
                        setSelectedPalette(customId);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply Custom Palette
                    </button>
                    <button
                      onClick={() => setShowCustomPalette(false)}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Preview your custom colors:
                    </p>
                    <div className="flex gap-1 mt-2">
                      {Object.values(customPalette).map((color, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Logo</h3>
        {currentLogo ? (
          <div>
            <img src={currentLogo} alt="Logo" className="w-24 h-24 object-contain rounded-lg border" />
            <label className="mt-2 block text-sm text-blue-600 cursor-pointer">
              Change Logo
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        ) : (
          <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer">
            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <span className="text-sm text-gray-600">Click to upload</span>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
        )}
      </div>
    </div>
  );
}
