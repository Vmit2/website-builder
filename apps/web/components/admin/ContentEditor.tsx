'use client';

import { useState, useEffect } from 'react';

interface Site {
  id: string;
  username: string;
  themeSlug: string;
  paletteId?: string;
  status: string;
  comingSoon: boolean;
  launchTime?: string;
  content?: {
    headline?: string;
    bio?: string;
    services?: string[];
    socialLinks?: Array<{ platform: string; url: string }>;
  };
}

interface ContentEditorProps {
  site: Site | null;
  onUpdate: () => void;
}

export default function ContentEditor({ site, onUpdate }: ContentEditorProps) {
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<Array<{ platform: string; url: string }>>([]);
  const [newService, setNewService] = useState('');
  const [newSocialPlatform, setNewSocialPlatform] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (site?.content) {
      setHeadline(site.content.headline || '');
      setBio(site.content.bio || '');
      setServices(site.content.services || []);
      setSocialLinks(site.content.socialLinks || []);
    }
  }, [site]);

  const handleAddService = () => {
    if (newService.trim()) {
      setServices([...services, newService.trim()]);
      setNewService('');
    }
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleAddSocialLink = () => {
    if (newSocialPlatform.trim() && newSocialUrl.trim()) {
      setSocialLinks([
        ...socialLinks,
        { platform: newSocialPlatform.trim(), url: newSocialUrl.trim() },
      ]);
      setNewSocialPlatform('');
      setNewSocialUrl('');
    }
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/dashboard/site', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          headline,
          bio,
          services,
          socialLinks,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Content saved successfully!' });
        onUpdate();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save content' });
      }
    } catch (error) {
      console.error('Error saving content:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Headline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Headline
        </label>
        <input
          type="text"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Your headline"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tell your story..."
        />
      </div>

      {/* Services */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Services
        </label>
        <div className="space-y-2">
          {services.map((service, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                {service}
              </span>
              <button
                onClick={() => handleRemoveService(index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddService()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a service"
            />
            <button
              onClick={handleAddService}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Social Links
        </label>
        <div className="space-y-2">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <strong>{link.platform}:</strong> {link.url}
              </span>
              <button
                onClick={() => handleRemoveSocialLink(index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={newSocialPlatform}
              onChange={(e) => setNewSocialPlatform(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Platform (e.g., Instagram)"
            />
            <input
              type="url"
              value={newSocialUrl}
              onChange={(e) => setNewSocialUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSocialLink()}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="URL"
            />
          </div>
          <button
            onClick={handleAddSocialLink}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Social Link
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
