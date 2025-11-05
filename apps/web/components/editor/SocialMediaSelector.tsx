'use client';

import { useState } from 'react';
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Github, 
  Youtube, 
  Music,
  Image as ImageIcon,
  MessageCircle,
  Gamepad2,
  Heart,
  Palette,
  BookOpen,
  X
} from 'lucide-react';

export interface SocialMediaLink {
  platform: string;
  url: string;
  icon?: string;
}

interface SocialMediaSelectorProps {
  value: SocialMediaLink[];
  onChange: (links: SocialMediaLink[]) => void;
  userPlan?: 'free' | 'starter' | 'pro';
}

const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
  { id: 'twitter', name: 'Twitter', icon: X, color: '#000000' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
  { id: 'github', name: 'GitHub', icon: Github, color: '#181717' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' },
  { id: 'tiktok', name: 'TikTok', icon: Music, color: '#000000' },
  { id: 'pinterest', name: 'Pinterest', icon: ImageIcon, color: '#BD081C' },
  { id: 'snapchat', name: 'Snapchat', icon: MessageCircle, color: '#FFFC00' },
  { id: 'discord', name: 'Discord', icon: MessageCircle, color: '#5865F2' },
  { id: 'twitch', name: 'Twitch', icon: Gamepad2, color: '#9146FF' },
  { id: 'dribbble', name: 'Dribbble', icon: Heart, color: '#EA4C89' },
  { id: 'behance', name: 'Behance', icon: Palette, color: '#1769FF' },
  { id: 'medium', name: 'Medium', icon: BookOpen, color: '#000000' },
];

export default function SocialMediaSelector({
  value = [],
  onChange,
  userPlan = 'free',
}: SocialMediaSelectorProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editUrl, setEditUrl] = useState('');

  const handleAddPlatform = (platformId: string) => {
    const platform = SOCIAL_PLATFORMS.find((p) => p.id === platformId);
    if (!platform) return;

    // Check if already added
    if (value.find((link) => link.platform === platformId)) {
      // Edit existing
      const index = value.findIndex((link) => link.platform === platformId);
      setEditingIndex(index);
      setEditUrl(value[index].url);
      setShowSelector(false);
      return;
    }

    // Add new
    const newLinks = [
      ...value,
      {
        platform: platformId,
        url: '',
        icon: platformId,
      },
    ];
    onChange(newLinks);
    setEditingIndex(newLinks.length - 1);
    setEditUrl('');
    setShowSelector(false);
    // Keep dialog open for editing
  };

  const handleSaveUrl = (index: number) => {
    if (!editUrl.trim()) {
      // Remove if URL is empty
      handleRemove(index);
      return;
    }

    const newLinks = [...value];
    newLinks[index].url = editUrl.trim();
    onChange(newLinks);
    setEditingIndex(null);
    setEditUrl('');
  };

  const handleRemove = (index: number) => {
    const newLinks = value.filter((_, i) => i !== index);
    onChange(newLinks);
    setEditingIndex(null);
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = SOCIAL_PLATFORMS.find((p) => p.id === platformId);
    if (!platform) return null;
    const IconComponent = platform.icon;
    return <IconComponent className="w-5 h-5" style={{ color: platform.color }} />;
  };

  const getPlatformName = (platformId: string) => {
    return SOCIAL_PLATFORMS.find((p) => p.id === platformId)?.name || platformId;
  };

  return (
    <>
      {/* Trigger Button - Shows current links count or "+ Add" */}
      <button
        onClick={() => setShowDialog(true)}
        className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
      >
        <span>📱</span>
        <span>{value.length > 0 ? `${value.length} Social Link${value.length > 1 ? 's' : ''}` : '+ Add Social Links'}</span>
      </button>

      {/* Dialog Overlay */}
      {showDialog && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDialog(false);
              setShowSelector(false);
            }
          }}
        >
          {/* Dialog Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Social Media Links
              </h2>
              <button
                onClick={() => {
                  setShowDialog(false);
                  setShowSelector(false);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 space-y-4">
              {/* Existing Links */}
              {value.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                >
                  {getPlatformIcon(link.platform)}
                  <div className="flex-1">
                    {editingIndex === index ? (
                      <input
                        type="url"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        onBlur={() => handleSaveUrl(index)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveUrl(index);
                          if (e.key === 'Escape') {
                            setEditingIndex(null);
                            setEditUrl('');
                          }
                        }}
                        placeholder={`Enter ${getPlatformName(link.platform)} URL`}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {getPlatformName(link.platform)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {link.url || 'Click to add URL'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingIndex(index);
                              setEditUrl(link.url);
                            }}
                            className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRemove(index)}
                            className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Button */}
              <button
                onClick={() => setShowSelector(!showSelector)}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                + Add Social Media Link
              </button>

              {/* Platform Selector */}
              {showSelector && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Select Platform
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {SOCIAL_PLATFORMS.map((platform) => {
                      const IconComponent = platform.icon;
                      const isAdded = value.find((link) => link.platform === platform.id);
                      
                      return (
                        <button
                          key={platform.id}
                          onClick={() => handleAddPlatform(platform.id)}
                          className={`
                            flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all
                            ${isAdded
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }
                          `}
                          title={platform.name}
                        >
                          <IconComponent 
                            className="w-6 h-6" 
                            style={{ color: isAdded ? platform.color : undefined }}
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                            {platform.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
