'use client';

import React from 'react';
import EditableText from '@/components/editor/EditableText';
import EditableImage from '@/components/editor/EditableImage';
import SocialMediaSelector, { SocialMediaLink } from '@/components/editor/SocialMediaSelector';
import { useEditorStore } from '@/lib/store/editor-store';

interface MinimalCreativeProps {
  content?: Record<string, string | SocialMediaLink[]>;
  palette?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  images?: string[];
  isPreview?: boolean;
  userPlan?: 'free' | 'starter' | 'pro';
  fontFamily?: string;
  logo?: string | null;
  onContentUpdate?: (key: string, value: any) => void;
}

export default function MinimalCreative({
  content = {},
  palette = {
    primary: '#000000',
    secondary: '#666666',
    accent: '#0066cc',
    background: '#ffffff',
    text: '#333333',
  },
  images = [],
  isPreview = false,
  userPlan = 'free',
  fontFamily = 'Poppins',
  logo = null,
  onContentUpdate,
}: MinimalCreativeProps) {
  const { updateContent, isEditMode, content: storeContent } = useEditorStore();
  
  // Use content from props or store, with schema-based IDs
  const getContent = (key: string, defaultValue: string = ''): string => {
    const contentValue = content[key] || storeContent[key];
    return typeof contentValue === 'string' ? contentValue : defaultValue;
  };

  const getSocialLinks = (): SocialMediaLink[] => {
    const links = content['social-links'] || storeContent['social-links'];
    if (Array.isArray(links)) return links;
    // Support old format
    if (content.socialLinks && Array.isArray(content.socialLinks)) {
      return content.socialLinks as SocialMediaLink[];
    }
    return [];
  };

  const handleContentChange = (key: string, value: any) => {
    const updateFn = onContentUpdate || updateContent;
    updateFn(key, value);
  };

  const socialLinks = getSocialLinks();

  const style = {
    '--primary': palette.primary,
    '--secondary': palette.secondary,
    '--accent': palette.accent,
    '--background': palette.background,
    '--text': palette.text,
  } as React.CSSProperties;

  return (
    <div
      className="min-h-screen"
      style={{
        ...style,
        backgroundColor: palette.background,
        color: palette.text,
        fontFamily: fontFamily,
      }}
    >
      {/* Navigation */}
      <nav className="px-8 py-6" style={{ borderBottom: `1px solid ${palette.secondary}20` }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          {logo ? (
            <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
          ) : (
            <h1 className="text-2xl font-light tracking-tight" style={{ color: palette.text }}>
              Portfolio
            </h1>
          )}
          {isPreview && (
            <span className="text-xs px-3 py-1 rounded" style={{ backgroundColor: `${palette.accent}20`, color: palette.accent }}>
              Preview Mode
            </span>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-20" style={{ backgroundColor: palette.background }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <EditableText
                id="hero-title"
                value={getContent('hero-title', "I'm a Creative Designer")}
                defaultValue="I'm a Creative Designer"
                onChange={(val) => handleContentChange('hero-title', val)}
                tag="h1"
                className="text-5xl font-light leading-tight mb-6"
                style={{ color: palette.text }}
                placeholder="Your awesome headline here"
              />
              <EditableText
                id="hero-subtitle"
                value={getContent('hero-subtitle', 'Building beautiful digital experiences that inspire and engage')}
                defaultValue="Building beautiful digital experiences that inspire and engage"
                onChange={(val) => handleContentChange('hero-subtitle', val)}
                tag="p"
                className="text-lg leading-relaxed mb-8"
                style={{ color: palette.secondary }}
                placeholder="Your tagline or subtitle"
              />
              <EditableText
                id="hero-cta"
                value={getContent('hero-cta', 'Get Started')}
                defaultValue="Get Started"
                onChange={(val) => handleContentChange('hero-cta', val)}
                tag="button"
                className="px-8 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-opacity inline-block border-none outline-none cursor-pointer"
                style={{ backgroundColor: palette.accent }}
                placeholder="Button text"
              />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden" style={{ backgroundColor: `${palette.secondary}15` }}>
              <EditableImage
                id="hero-image"
                src={getContent('hero-image') || images[0]}
                defaultSrc="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800"
                onChange={(val) => handleContentChange('hero-image', val)}
                userPlan={userPlan}
                className="w-full h-full object-cover"
                alt="Hero"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section 
        className="px-8 py-20 relative" 
        style={{ 
          backgroundColor: palette.secondary ? `${palette.secondary}08` : `${palette.background}dd`,
          borderTop: `3px solid ${palette.secondary || palette.primary || '#000000'}40`,
          borderBottom: `3px solid ${palette.secondary || palette.primary || '#000000'}40`,
        }}
      >
        <div className="max-w-6xl mx-auto">
          <EditableText
            id="about-title"
            value={getContent('about-title', 'About Me')}
            defaultValue="About Me"
            onChange={(val) => handleContentChange('about-title', val)}
            tag="h2"
            className="text-3xl font-light mb-6"
            style={{ color: palette.text }}
            placeholder="Section title"
          />
          <EditableText
            id="about-bio"
            value={getContent('about-bio', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.')}
            defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
            onChange={(val) => handleContentChange('about-bio', val)}
            tag="p"
            className="text-lg leading-relaxed max-w-3xl"
            style={{ color: palette.secondary }}
            placeholder="Write something about yourself..."
          />
        </div>
      </section>

      {/* Services Section */}
      <section 
        className="px-8 py-20 relative" 
        style={{ 
          backgroundColor: palette.background,
          borderTop: `3px solid ${palette.secondary || palette.primary || '#000000'}40`,
          borderBottom: `3px solid ${palette.secondary || palette.primary || '#000000'}40`,
        }}
      >
        <div className="max-w-6xl mx-auto">
          <EditableText
            id="services-title"
            value={getContent('services-title', 'What I Do')}
            defaultValue="What I Do"
            onChange={(val) => handleContentChange('services-title', val)}
            tag="h2"
            className="text-3xl font-light mb-12"
            style={{ color: palette.text }}
            placeholder="Section title"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="p-6 rounded-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.secondary}30` }}>
              <EditableText
                id="service-1"
                value={getContent('service-1', 'Web Design')}
                defaultValue="Web Design"
                onChange={(val) => handleContentChange('service-1', val)}
                tag="h3"
                className="text-lg font-medium mb-2"
                style={{ color: palette.text }}
                placeholder="Service name"
              />
              <EditableText
                id="service-1-desc"
                value={getContent('service-1-desc', 'Creating stunning and responsive web designs that captivate your audience')}
                defaultValue="Creating stunning and responsive web designs that captivate your audience"
                onChange={(val) => handleContentChange('service-1-desc', val)}
                tag="p"
                style={{ color: palette.secondary }}
                placeholder="Service description"
              />
            </div>

            {/* Service 2 */}
            <div className="p-6 rounded-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.secondary}30` }}>
              <EditableText
                id="service-2"
                value={getContent('service-2', 'Branding')}
                defaultValue="Branding"
                onChange={(val) => handleContentChange('service-2', val)}
                tag="h3"
                className="text-lg font-medium mb-2"
                style={{ color: palette.text }}
                placeholder="Service name"
              />
              <EditableText
                id="service-2-desc"
                value={getContent('service-2-desc', 'Building memorable brand identities that stand out in the marketplace')}
                defaultValue="Building memorable brand identities that stand out in the marketplace"
                onChange={(val) => handleContentChange('service-2-desc', val)}
                tag="p"
                style={{ color: palette.secondary }}
                placeholder="Service description"
              />
            </div>

            {/* Service 3 */}
            <div className="p-6 rounded-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.secondary}30` }}>
              <EditableText
                id="service-3"
                value={getContent('service-3', 'UI/UX')}
                defaultValue="UI/UX"
                onChange={(val) => handleContentChange('service-3', val)}
                tag="h3"
                className="text-lg font-medium mb-2"
                style={{ color: palette.text }}
                placeholder="Service name"
              />
              <EditableText
                id="service-3-desc"
                value={getContent('service-3-desc', 'Designing intuitive user experiences that users love to interact with')}
                defaultValue="Designing intuitive user experiences that users love to interact with"
                onChange={(val) => handleContentChange('service-3-desc', val)}
                tag="p"
                style={{ color: palette.secondary }}
                placeholder="Service description"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section 
        className="px-8 py-20 relative" 
        style={{ 
          backgroundColor: palette.accent ? `${palette.accent}08` : `${palette.background}dd`,
          borderTop: `3px solid ${palette.secondary || palette.primary || '#000000'}40`,
          borderBottom: `3px solid ${palette.secondary || palette.primary || '#000000'}40`,
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <EditableText
            id="contact-title"
            value={getContent('contact-title', 'Get In Touch')}
            defaultValue="Get In Touch"
            onChange={(val) => handleContentChange('contact-title', val)}
            tag="h2"
            className="text-3xl font-light mb-6"
            style={{ color: palette.text }}
            placeholder="Section title"
          />
          <EditableText
            id="contact-email"
            value={getContent('contact-email', 'hello@example.com')}
            defaultValue="hello@example.com"
            onChange={(val) => handleContentChange('contact-email', val)}
            tag="p"
            className="text-lg"
            style={{ color: palette.secondary }}
            placeholder="Your email address"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12" style={{ borderTop: `1px solid ${palette.secondary}20` }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p style={{ color: palette.secondary }}>
              © 2025 Portfolio. All rights reserved.
            </p>
            {isEditMode ? (
              <div className="w-full md:w-auto">
                <SocialMediaSelector
                  value={socialLinks}
                  onChange={(links) => handleContentChange('social-links', links)}
                  userPlan={userPlan}
                />
              </div>
            ) : (
              socialLinks.length > 0 && (
                <div className="flex gap-4 flex-wrap justify-center">
                  {socialLinks.map((link, index) => {
                    const platform = link.platform.toLowerCase();
                    return (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline flex items-center gap-2 transition-opacity"
                        style={{ color: palette.accent }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        {link.platform}
                      </a>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
