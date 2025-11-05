export interface EditableSection {
  id: string;
  type: 'text' | 'image';
  default: string;
  editable: boolean;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  placeholder?: string;
}

export interface DraftContent {
  [sectionId: string]: string;
}

export interface ThemeEditableSchema {
  themeSlug: string;
  sections: EditableSection[];
}

// Re-export for convenience
export type { EditableSection as default };
