'use client';

import { useState } from 'react';
import { Edit3, Image as ImageIcon, Palette, Save, X } from 'lucide-react';
import { useEditorStore } from '@/lib/store/editor-store';
import { cn } from '@/lib/utils';
import { HexColorPicker } from 'react-colorful';

interface ToolbarProps {
  onEditText?: () => void;
  onChangeImage?: () => void;
  onChangeColor?: (color: string) => void;
  onSave?: () => void;
  colorKey?: string;
  currentColor?: string;
  className?: string;
}

export default function Toolbar({
  onEditText,
  onChangeImage,
  onChangeColor,
  onSave,
  colorKey,
  currentColor,
  className = '',
}: ToolbarProps) {
  const { isEditMode, hasUnsavedChanges } = useEditorStore();
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (!isEditMode) return null;

  return (
    <div
      className={cn(
        'absolute -top-12 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {onEditText && (
        <button
          onClick={onEditText}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Edit Text"
        >
          <Edit3 className="w-4 h-4 text-gray-700" />
        </button>
      )}

      {onChangeImage && (
        <button
          onClick={onChangeImage}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Change Image"
        >
          <ImageIcon className="w-4 h-4 text-gray-700" />
        </button>
      )}

      {onChangeColor && colorKey && currentColor && (
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 hover:bg-gray-100 rounded transition-colors flex items-center gap-2"
            title="Change Color"
          >
            <Palette className="w-4 h-4 text-gray-700" />
            <div
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: currentColor }}
            />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
              <HexColorPicker
                color={currentColor}
                onChange={(color) => {
                  onChangeColor(color);
                  setShowColorPicker(false);
                }}
              />
            </div>
          )}
        </div>
      )}

      {onSave && hasUnsavedChanges && (
        <button
          onClick={onSave}
          className="p-2 hover:bg-blue-50 rounded transition-colors text-blue-600"
          title="Save Changes"
        >
          <Save className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
