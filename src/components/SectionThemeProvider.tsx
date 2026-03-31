import type { ReactNode } from 'react';

const SECTION_COLORS: Record<string, string> = {
  switzerland: '#DC2626',
  tomorrowland: '#7C3AED',
  rhodes: '#2563EB',
  turkey: '#0D9488',
};

const FALLBACK_COLOR = '#6B7280';

interface SectionThemeProviderProps {
  sectionId: string;
  children: ReactNode;
}

export default function SectionThemeProvider({ sectionId, children }: SectionThemeProviderProps) {
  const accent = SECTION_COLORS[sectionId] ?? FALLBACK_COLOR;
  const accent10 = `${accent}1A`;

  return (
    <div
      style={{
        '--section-accent': accent,
        '--section-accent-10': accent10,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
