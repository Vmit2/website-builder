/**
 * Load default boilerplate content for a theme
 */
export async function loadDefaultContent(themeName: string): Promise<Record<string, any>> {
  try {
    // Try to load from /themes/<theme-name>/default-content.json
    const response = await fetch(`/themes/${themeName}/default-content.json`);
    if (response.ok) {
      const content = await response.json();
      return content;
    }
  } catch (error) {
    console.warn(`Failed to load default content for ${themeName}:`, error);
  }

  // Fallback to generic boilerplate
  return {
    hero: {
      title: 'Welcome to My Portfolio',
      subtitle: 'Your creative space',
      ctaText: 'Get Started',
      ctaLink: '#contact',
    },
    about: {
      title: 'About Me',
      text: 'This is your creative space. Add your story here.',
    },
    services: {
      title: 'Services',
      items: ['Service 1', 'Service 2', 'Service 3'],
    },
    portfolio: {
      title: 'Portfolio',
      projects: [],
    },
    contact: {
      title: 'Get In Touch',
      email: 'your@email.com',
      message: 'I\'d love to hear from you!',
    },
    socialLinks: [],
  };
}

/**
 * Merge user content with default content
 * User content takes precedence over defaults
 */
export function mergeContent(
  defaultContent: Record<string, any>,
  userContent: Record<string, any>
): Record<string, any> {
  const merged = { ...defaultContent };

  // Deep merge user content
  for (const key in userContent) {
    if (typeof userContent[key] === 'object' && !Array.isArray(userContent[key])) {
      merged[key] = mergeContent(merged[key] || {}, userContent[key]);
    } else {
      merged[key] = userContent[key];
    }
  }

  return merged;
}
