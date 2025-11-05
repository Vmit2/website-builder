'use client';

import EditableText from '@/components/editor/EditableText';
import EditableImage from '@/components/editor/EditableImage';
import Toolbar from '@/components/editor/Toolbar';
import { useEditorStore } from '@/lib/store/editor-store';
import { cn } from '@/lib/utils';

interface EditableMinimalCreativeProps {
  content?: Record<string, any>;
  palette?: Record<string, string>;
  images?: string[];
  isPreview?: boolean;
  onContentUpdate?: (key: string, value: any) => void;
}

export default function EditableMinimalCreative({
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
  onContentUpdate,
}: EditableMinimalCreativeProps) {
  const { updateContent, isEditMode } = useEditorStore();
  const updateFn = onContentUpdate || updateContent;

  const hero = content.hero || {};
  const about = content.about || {};
  const services = content.services || {};
  const portfolio = content.portfolio || {};
  const contact = content.contact || {};
  const socialLinks = content.socialLinks || [];

  const handleContentChange = (key: string, value: any) => {
    updateFn(key, value);
  };

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
      }}
    >
      {/* Navigation */}
      <nav className="border-b border-gray-200 px-8 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-light tracking-tight">Portfolio</h1>
          {isPreview && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
              Preview Mode
            </span>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-20 relative group">
        <Toolbar
          onEditText={() => {}}
          className="top-0"
        />
        <div className="max-w-6xl mx-auto text-center">
          <EditableText
            value={hero.title || 'Welcome to My Portfolio'}
            onChange={(val) => handleContentChange('hero.title', val)}
            tag="h1"
            className="text-5xl font-light mb-6"
            placeholder="Welcome to My Portfolio"
          />
          <EditableText
            value={hero.subtitle || 'Designer. Creator. Visionary.'}
            onChange={(val) => handleContentChange('hero.subtitle', val)}
            tag="p"
            className="text-xl text-gray-600 mb-8"
            placeholder="Designer. Creator. Visionary."
          />
          <button
            className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            style={{ backgroundColor: palette.primary }}
          >
            <EditableText
              value={hero.ctaText || 'View My Work'}
              onChange={(val) => handleContentChange('hero.ctaText', val)}
              tag="span"
              className="text-white"
              rich={false}
              placeholder="View My Work"
            />
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="px-8 py-20 bg-gray-50 relative group">
        <Toolbar className="top-0" />
        <div className="max-w-4xl mx-auto">
          <EditableText
            value={about.title || 'About Me'}
            onChange={(val) => handleContentChange('about.title', val)}
            tag="h2"
            className="text-3xl font-light mb-6"
            placeholder="About Me"
          />
          <EditableText
            value={about.text || 'This is your creative space...'}
            onChange={(val) => handleContentChange('about.text', val)}
            tag="p"
            className="text-lg leading-relaxed"
            placeholder="Tell your story here..."
            rich={true}
          />
        </div>
      </section>

      {/* Services Section */}
      {services.items && services.items.length > 0 && (
        <section className="px-8 py-20 relative group">
          <Toolbar className="top-0" />
          <div className="max-w-6xl mx-auto">
            <EditableText
              value={services.title || 'Services'}
              onChange={(val) => handleContentChange('services.title', val)}
              tag="h2"
              className="text-3xl font-light mb-12 text-center"
              placeholder="Services"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.items.map((service: string, idx: number) => (
                <div key={idx} className="text-center">
                  <EditableText
                    value={service}
                    onChange={(val) => {
                      const newItems = [...services.items];
                      newItems[idx] = val;
                      handleContentChange('services.items', newItems);
                    }}
                    tag="h3"
                    className="text-xl font-medium mb-2"
                    placeholder="Service Name"
                    rich={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Portfolio Section */}
      {portfolio.projects && portfolio.projects.length > 0 && (
        <section className="px-8 py-20 relative group">
          <Toolbar className="top-0" />
          <div className="max-w-6xl mx-auto">
            <EditableText
              value={portfolio.title || 'Portfolio'}
              onChange={(val) => handleContentChange('portfolio.title', val)}
              tag="h2"
              className="text-3xl font-light mb-12 text-center"
              placeholder="Portfolio"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {portfolio.projects.map((project: any, idx: number) => (
                <div key={idx} className="relative group">
                  <EditableImage
                    src={project.image || '/free-assets/placeholder.jpg'}
                    alt={project.title || 'Project'}
                    onChange={(val) => {
                      const newProjects = [...portfolio.projects];
                      newProjects[idx] = { ...newProjects[idx], image: val };
                      handleContentChange('portfolio.projects', newProjects);
                    }}
                    className="aspect-square rounded-lg overflow-hidden mb-4"
                    placeholder="/free-assets/placeholder.svg"
                  />
                  <EditableText
                    value={project.title || 'Project Title'}
                    onChange={(val) => {
                      const newProjects = [...portfolio.projects];
                      newProjects[idx] = { ...newProjects[idx], title: val };
                      handleContentChange('portfolio.projects', newProjects);
                    }}
                    tag="h3"
                    className="text-xl font-medium mb-2"
                    placeholder="Project Title"
                  />
                  <EditableText
                    value={project.description || 'Project description'}
                    onChange={(val) => {
                      const newProjects = [...portfolio.projects];
                      newProjects[idx] = { ...newProjects[idx], description: val };
                      handleContentChange('portfolio.projects', newProjects);
                    }}
                    tag="p"
                    className="text-gray-600"
                    placeholder="Project description"
                    rich={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="px-8 py-20 bg-gray-50 relative group">
        <Toolbar className="top-0" />
        <div className="max-w-4xl mx-auto text-center">
          <EditableText
            value={contact.title || 'Get In Touch'}
            onChange={(val) => handleContentChange('contact.title', val)}
            tag="h2"
            className="text-3xl font-light mb-6"
            placeholder="Get In Touch"
          />
          <EditableText
            value={contact.message || 'I'd love to hear from you!'}
            onChange={(val) => handleContentChange('contact.message', val)}
            tag="p"
            className="text-lg mb-8"
            placeholder="Contact message"
            rich={false}
          />
          <EditableText
            value={contact.email || 'your@email.com'}
            onChange={(val) => handleContentChange('contact.email', val)}
            tag="p"
            className="text-lg"
            placeholder="your@email.com"
            rich={false}
          />
        </div>
      </section>
    </div>
  );
}
