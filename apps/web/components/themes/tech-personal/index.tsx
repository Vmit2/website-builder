'use client';

import React from 'react';

interface TechPersonalProps {
  content?: {
    headline?: string;
    bio?: string;
    services?: string[];
    projects?: { title: string; description: string }[];
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

export default function TechPersonal({
  content = {},
  palette = {
    primary: '#0f172a',
    secondary: '#64748b',
    accent: '#3b82f6',
    background: '#f8fafc',
    text: '#1e293b',
  },
  images = [],
  isPreview = false,
}: TechPersonalProps) {
  const {
    headline = 'Full Stack Developer',
    bio = 'Building elegant solutions to complex problems',
    services = ['Web Development', 'API Design', 'DevOps'],
    projects = [
      { title: 'Project 1', description: 'A brief description' },
      { title: 'Project 2', description: 'Another great project' },
    ],
    socialLinks = [],
  } = content;

  return (
    <div style={{ backgroundColor: palette.background, color: palette.text }}>
      {/* Header */}
      <header
        className="border-b"
        style={{ borderColor: palette.accent, backgroundColor: palette.primary }}
      >
        <div className="max-w-6xl mx-auto px-8 py-6">
          <h1 className="text-2xl font-bold text-white">&lt;{headline} /&gt;</h1>
        </div>
      </header>

      {/* Hero */}
      <section className="px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="text-5xl font-bold mb-6 leading-tight"
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
              <div className="flex gap-4">
                <button
                  className="px-6 py-2 text-white font-medium rounded"
                  style={{ backgroundColor: palette.accent }}
                >
                  View My Work
                </button>
                <button
                  className="px-6 py-2 border-2 font-medium rounded"
                  style={{
                    borderColor: palette.accent,
                    color: palette.accent,
                  }}
                >
                  Contact Me
                </button>
              </div>
            </div>
            {images.length > 0 && (
              <div className="aspect-square rounded-lg overflow-hidden border-2" style={{ borderColor: palette.accent }}>
                <img
                  src={images[0]}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Skills */}
      {services.length > 0 && (
        <section className="px-8 py-20" style={{ backgroundColor: palette.primary }}>
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-12">Skills & Expertise</h3>
            <div className="grid grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg"
                  style={{ backgroundColor: palette.accent }}
                >
                  <h4 className="text-lg font-bold text-white mb-2">
                    {service}
                  </h4>
                  <p className="text-blue-100">
                    Expert level proficiency and experience
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="px-8 py-20">
          <div className="max-w-6xl mx-auto">
            <h3
              className="text-3xl font-bold mb-12"
              style={{ color: palette.primary }}
            >
              Featured Projects
            </h3>
            <div className="grid grid-cols-2 gap-8">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="p-8 rounded-lg border-2"
                  style={{ borderColor: palette.accent }}
                >
                  <h4
                    className="text-xl font-bold mb-3"
                    style={{ color: palette.primary }}
                  >
                    {project.title}
                  </h4>
                  <p style={{ color: palette.secondary }}>
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer
        className="px-8 py-12"
        style={{ backgroundColor: palette.primary }}
      >
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
                    style={{ color: palette.accent }}
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
