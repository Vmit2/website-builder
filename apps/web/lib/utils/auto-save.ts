import type { DraftContent } from '@/lib/types/editor';

interface AutoSaveOptions {
  onSave: (content: DraftContent) => Promise<void>;
  delay?: number;
}

/**
 * Simple debounce function
 */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Create an auto-save handler with debouncing
 */
export function createAutoSaveHandler({ onSave, delay = 3000 }: AutoSaveOptions) {
  return debounce(async (content: DraftContent) => {
    try {
      await onSave(content);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, delay);
}

/**
 * Save content to Supabase via API
 */
export async function saveContentToSupabase(
  userId: string,
  themeId: string,
  content: DraftContent
): Promise<void> {
  const response = await fetch('/api/preview/save-draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      themeId,
      content,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to save content');
  }
}
