'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MinimalCreativeProps {
  content?: {
    headline?: string;
    bio?: string;
    services?: string[];
    socialLinks?: { platform: string; url: string }[];
  };
  palette?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  images?: string[];
  isPreview?: boolean;
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
}: MinimalCreativeProps) {
  const {
    headline = 'Your Portfolio',
    bio = 'Welcome to my creative space',
    services = ['Design', 'Development', 'Strategy'],
    socialLinks = [],
  } = content;

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
      <section className="px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="text-5xl font-light leading-tight mb-6"
                style={{ color: palette.primary }}
              >
                {headline}
              </h2>
              <p
                className="text-lg leading-relaxed mb-8"
                style={{ color: palette.secondary }}
              >
                {bio}
              </p>
              <button
                className="px-8 py-3 text-white font-medium"
                style={{ backgroundColor: palette.accent }}
              >
                Get Started
              </button>
            </div>
            {images.length > 0 && (
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={images[0]}
                  alt="Hero"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      {services.length > 0 && (
        <section className="px-8 py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h3
              className="text-3xl font-light mb-12"
              style={{ color: palette.primary }}
            >
              Services
            </h3>
            <div className="grid grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div key={index} className="p-6 bg-white rounded-lg">
                  <h4
                    className="text-lg font-medium mb-2"
                    style={{ color: palette.primary }}
                  >
                    {service}
                  </h4>
                  <p style={{ color: palette.secondary }}>
                    Professional {service.toLowerCase()} services tailored to
                    your needs.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <p style={{ color: palette.secondary }}>
              © 2025 Portfolio. All rights reserved.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-4">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                    style={{ color: palette.accent }}
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
