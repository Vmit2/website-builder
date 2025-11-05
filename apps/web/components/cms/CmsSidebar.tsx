'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Palette, Search as SearchIcon, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import DesignTab from './DesignTab';

export interface Section {
  id: string;
  type: 'text' | 'image' | 'repeatable';
  default?: string;
  editable: boolean;
  tag?: string;
  placeholder?: string;
  section?: string;
}

export interface ThemeEditableSchema {
  themeSlug: string;
  sections: Section[];
}

interface CmsSidebarProps {
  schema: ThemeEditableSchema;
  activeSectionId: string | null;
  onSectionSelect: (sectionId: string) => void;
  userPlan?: 'free' | 'starter' | 'pro';
  currentFont?: string;
  currentPalette?: string;
  currentLogo?: string;
  seoTitle?: string;
  seoDescription?: string;
  onFontChange?: (font: string) => void;
  onPaletteChange?: (palette: string, colors: any) => void;
  onLogoChange?: (logoUrl: string) => void;
  onSeoUpdate?: (title: string, description: string) => void;
}

type Tab = 'content' | 'design' | 'seo';

export default function CmsSidebar({
  schema,
  activeSectionId,
  onSectionSelect,
  userPlan = 'free',
  currentFont = 'Poppins',
  currentPalette = '',
  currentLogo,
  seoTitle = '',
  seoDescription = '',
  onFontChange,
  onPaletteChange,
  onLogoChange,
  onSeoUpdate,
}: CmsSidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('content');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const groupedSections = schema.sections.reduce((acc, section) => {
    const sectionName = section.section || 'General';
    if (!acc[sectionName]) {
      acc[sectionName] = [];
    }
    acc[sectionName].push(section);
    return acc;
  }, {} as Record<string, Section[]>);

  const filteredSections = Object.entries(groupedSections).filter(([sectionName, sections]) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      sectionName.toLowerCase().includes(query) ||
      sections.some((s) => s.id.toLowerCase().includes(query) || s.placeholder?.toLowerCase().includes(query))
    );
  });

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  useEffect(() => {
    if (activeSectionId) {
      const activeSection = schema.sections.find((s) => s.id === activeSectionId);
      if (activeSection?.section) {
        setExpandedSections((prev) => new Set([...prev, activeSection.section!]));
      }
    }
  }, [activeSectionId, schema.sections]);

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Site</h2>
        </div>

        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'content'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-1.5" />
            Content
          </button>
          <button
            onClick={() => setActiveTab('design')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'design'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Palette className="w-4 h-4 inline mr-1.5" />
            Design
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'seo'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <SearchIcon className="w-4 h-4 inline mr-1.5" />
            SEO
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'content' && (
          <ContentTab
            groupedSections={filteredSections}
            activeSectionId={activeSectionId}
            onSectionSelect={onSectionSelect}
            expandedSections={expandedSections}
            onToggleSection={toggleSection}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {activeTab === 'design' && (
          <DesignTab
            userPlan={userPlan}
            currentFont={currentFont}
            currentPalette={currentPalette}
            currentLogo={currentLogo}
            onFontChange={onFontChange}
            onPaletteChange={onPaletteChange}
            onLogoChange={onLogoChange}
          />
        )}
        {activeTab === 'seo' && (
          <SeoTab
            userPlan={userPlan}
            seoTitle={seoTitle}
            seoDescription={seoDescription}
            onSeoUpdate={onSeoUpdate}
          />
        )}
      </div>
    </div>
  );
}

function ContentTab({
  groupedSections,
  activeSectionId,
  onSectionSelect,
  expandedSections,
  onToggleSection,
  searchQuery,
  onSearchChange,
}: {
  groupedSections: [string, Section[]][];
  activeSectionId: string | null;
  onSectionSelect: (sectionId: string) => void;
  expandedSections: Set<string>;
  onToggleSection: (sectionName: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  return (
    <div className="p-4">
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sections..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-1">
        {groupedSections.map(([sectionName, sections]) => (
          <div key={sectionName} className="mb-2">
            <button
              onClick={() => onToggleSection(sectionName)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <span className="capitalize">{sectionName}</span>
              {expandedSections.has(sectionName) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {expandedSections.has(sectionName) && (
              <div className="ml-4 mt-1 space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => onSectionSelect(section.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      activeSectionId === section.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {section.type === 'text' ? '📝' : section.type === 'image' ? '🖼️' : '🔄'}
                      </span>
                      <span className="truncate">
                        {section.placeholder || section.id.replace(/-/g, ' ')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SeoTab({
  userPlan,
  seoTitle,
  seoDescription,
  onSeoUpdate,
}: {
  userPlan: 'free' | 'starter' | 'pro';
  seoTitle: string;
  seoDescription: string;
  onSeoUpdate?: (title: string, description: string) => void;
}) {
  const [title, setTitle] = useState(seoTitle);
  const [description, setDescription] = useState(seoDescription);

  useEffect(() => {
    setTitle(seoTitle);
    setDescription(seoDescription);
  }, [seoTitle, seoDescription]);

  const handleSave = () => {
    if (onSeoUpdate) {
      onSeoUpdate(title, description);
    }
  };

  if (userPlan === 'free') {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium mb-2">
            SEO Features Available in Starter+
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            Upgrade to Starter or Pro plan to customize your site's SEO settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          SEO Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          placeholder="Your site title (50-60 characters)"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={60}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{title.length}/60 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          SEO Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleSave}
          placeholder="Brief description of your site (150-160 characters)"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          maxLength={160}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description.length}/160 characters</p>
      </div>
    </div>
  );
}
