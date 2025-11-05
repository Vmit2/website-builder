'use client';

import { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/lib/store/editor-store';
import { usePlanRestrictions } from '@/lib/hooks/usePlanRestrictions';

interface EditableImageProps {
  id: string;
  src?: string;
  alt?: string;
  defaultSrc?: string;
  onChange: (src: string) => void;
  className?: string;
  placeholder?: string;
  userPlan?: 'free' | 'starter' | 'pro';
}

export default function EditableImage({
  id,
  src,
  alt = 'Portfolio image',
  defaultSrc,
  onChange,
  className = '',
  placeholder = '/placeholder-image.jpg',
  userPlan = 'free',
}: EditableImageProps) {
  const { isEditMode } = useEditorStore();
  const [isHovered, setIsHovered] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const restrictions = usePlanRestrictions(userPlan);
  const imageRef = useRef<HTMLDivElement>(null);

  const imageSrc = src || defaultSrc || placeholder;
  const canEditImage = isEditMode && restrictions.canEditImages;

  // Predefined images for Starter/Free users
  const predefinedImages = [
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
    'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800',
    'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800',
    'https://images.unsplash.com/photo-1553484771-371a605b060b?w=800',
  ];

  const handleImageSelect = (newSrc: string) => {
    onChange(newSrc);
    setShowImagePicker(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!restrictions.canUploadImages) {
      alert('Image upload is only available for Pro plans. Please upgrade to upload your own images.');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: Implement actual image upload to Supabase Storage
    // For now, create a local URL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onChange(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (imageRef.current && !imageRef.current.contains(event.target as Node)) {
        setShowImagePicker(false);
      }
    };

    if (showImagePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showImagePicker]);

  return (
    <div
      ref={imageRef}
      className={`relative ${className}`}
      data-section-id={id}
      onMouseEnter={() => canEditImage && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={imageSrc}
        alt={alt}
        className={`
          w-full h-full object-cover
          ${isEditMode && canEditImage ? 'cursor-pointer' : ''}
          ${isEditMode && canEditImage && isHovered ? 'opacity-90' : ''}
          ${isEditMode && canEditImage ? 'transition-opacity' : ''}
        `}
      />

      {/* Hover overlay for editing */}
      {isEditMode && canEditImage && isHovered && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <button
            onClick={() => setShowImagePicker(true)}
            className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Change Image
          </button>
        </div>
      )}

      {/* Plan restriction overlay */}
      {isEditMode && !canEditImage && isHovered && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-white font-medium mb-2">Upgrade to edit images</p>
            <p className="text-white/80 text-sm">
              {userPlan === 'free' && 'Starter plan required'}
              {userPlan === 'starter' && 'Pro plan for custom uploads'}
            </p>
          </div>
        </div>
      )}

      {/* Image picker modal */}
      {showImagePicker && (
        <div className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-lg shadow-xl z-50 p-4 max-h-[400px] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Choose Image</h3>
            <button
              onClick={() => setShowImagePicker(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {/* Upload button for Pro users */}
          {restrictions.canUploadImages && (
            <div className="mb-4">
              <label className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-center cursor-pointer hover:bg-blue-700 transition-colors">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Predefined images grid */}
          <div className="grid grid-cols-2 gap-2">
            {predefinedImages.map((imgSrc, index) => (
              <button
                key={index}
                onClick={() => handleImageSelect(imgSrc)}
                className="relative aspect-video rounded overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors"
              >
                <img
                  src={imgSrc}
                  alt={`Option ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Edit mode indicator */}
      {isEditMode && canEditImage && !isHovered && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-75">
          Click to edit
        </div>
      )}
    </div>
  );
}
