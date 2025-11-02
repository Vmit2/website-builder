'use client';

import React from 'react';

interface BoldPortfolioProps {
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

export default function BoldPortfolio({
  content = {},
  palette = {
    primary: '#1a1a1a',
    secondary: '#666666',
    accent: '#ff6b35',
    background: '#ffffff',
    text: '#1a1a1a',
  },
  images = [],
  isPreview = false,
}: BoldPortfolioProps) {
  const {
    headline = 'Bold Creator',
    bio = 'Making waves in the digital world',
    services = ['Content Creation', 'Branding', 'Strategy'],
    socialLinks = [],
  } = content;

  return (
    <div style={{ backgroundColor: palette.background, color: palette.text }}>
      {/* Hero - Full Width Image */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {images.length > 0 && (
          <div className="absolute inset-0 z-0">
            <img
              src={images[0]}
              alt="Hero"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 opacity-40"
              style={{ backgroundColor: palette.primary }}
            />
          </div>
        )}

        <div className="relative z-10 text-center text-white px-8">
          <h1 className="text-7xl font-bold mb-4 leading-tight">
            {headline}
          </h1>
          <p className="text-2xl font-light mb-8">{bio}</p>
          <button
            className="px-10 py-4 text-lg font-bold text-white"
            style={{ backgroundColor: palette.accent }}
          >
            Explore Work
          </button>
        </div>
      </section>

      {/* Services Section */}
      {services.length > 0 && (
        <section className="px-8 py-24">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-5xl font-bold mb-16"
              style={{ color: palette.primary }}
            >
              What I Do
            </h2>
            <div className="grid grid-cols-3 gap-12">
              {services.map((service, index) => (
                <div key={index}>
                  <div
                    className="w-16 h-16 rounded-full mb-6 flex items-center justify-center text-white font-bold text-2xl"
                    style={{ backgroundColor: palette.accent }}
                  >
                    {index + 1}
                  </div>
                  <h3
                    className="text-2xl font-bold mb-3"
                    style={{ color: palette.primary }}
                  >
                    {service}
                  </h3>
                  <p style={{ color: palette.secondary }}>
                    Delivering exceptional results in {service.toLowerCase()}.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section
        className="px-8 py-24"
        style={{ backgroundColor: palette.accent }}
      >
        <div className="max-w-6xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Collaborate?</h2>
          <p className="text-lg mb-8">Let's create something amazing together.</p>
          <button className="px-10 py-4 bg-white text-lg font-bold" style={{ color: palette.accent }}>
            Get in Touch
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12" style={{ backgroundColor: palette.primary }}>
        <div className="max-w-6xl mx-auto text-white">
          <div className="flex justify-between items-center">
            <p>© 2025 {headline}</p>
            {socialLinks.length > 0 && (
              <div className="flex gap-6">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-70"
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
