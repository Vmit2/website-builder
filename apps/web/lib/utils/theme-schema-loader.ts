import type { EditableSection, ThemeEditableSchema } from '@/lib/types/editor';

// Re-export types
export type { EditableSection, ThemeEditableSchema };

/**
 * Load editable schema for a theme
 * Falls back to empty schema if file doesn't exist
 */
export async function loadThemeEditableSchema(themeSlug: string): Promise<ThemeEditableSchema> {
  try {
    const schema = await import(`@/themes/${themeSlug}/editable-schema.json`);
    return schema.default || schema;
  } catch (error) {
    console.warn(`Theme schema not found for ${themeSlug}, using defaults`);
    return {
      themeSlug,
      sections: [],
    };
  }
}

/**
 * Get default content for a theme based on its schema
 */
export function getDefaultContentFromSchema(schema: ThemeEditableSchema): Record<string, string> {
  const content: Record<string, string> = {};
  
  schema.sections.forEach((section) => {
    if (section.default) {
      content[section.id] = section.default;
    }
  });

  return content;
}

/**
 * Get editable sections by type
 */
export function getSectionsByType(
  schema: ThemeEditableSchema,
  type: 'text' | 'image'
): EditableSection[] {
  return schema.sections.filter((section) => section.type === type && section.editable);
}
