import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SectionThemeProvider from '@/components/SectionThemeProvider';

describe('SectionThemeProvider', () => {
  // FE-012-HP-01: SectionThemeProvider sets --section-accent for switzerland
  it('sets --section-accent to #DC2626 for switzerland', () => {
    const { container } = render(
      <SectionThemeProvider sectionId="switzerland">
        <span>child</span>
      </SectionThemeProvider>
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.getPropertyValue('--section-accent')).toBe('#DC2626');
  });

  // FE-012-HP-02: All four section colors map correctly
  it('sets correct accent for tomorrowland', () => {
    const { container } = render(
      <SectionThemeProvider sectionId="tomorrowland"><span /></SectionThemeProvider>
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.getPropertyValue('--section-accent')).toBe('#7C3AED');
  });

  it('sets correct accent for rhodes', () => {
    const { container } = render(
      <SectionThemeProvider sectionId="rhodes"><span /></SectionThemeProvider>
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.getPropertyValue('--section-accent')).toBe('#2563EB');
  });

  it('sets correct accent for turkey', () => {
    const { container } = render(
      <SectionThemeProvider sectionId="turkey"><span /></SectionThemeProvider>
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.getPropertyValue('--section-accent')).toBe('#0D9488');
  });

  // FE-012-EC-01: Unknown section ID falls back to neutral gray
  it('falls back to neutral gray for unknown section ID', () => {
    const { container } = render(
      <SectionThemeProvider sectionId="unknown"><span /></SectionThemeProvider>
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.getPropertyValue('--section-accent')).toBe('#6B7280');
  });

  it('sets --section-accent-10 opacity variant', () => {
    const { container } = render(
      <SectionThemeProvider sectionId="switzerland"><span /></SectionThemeProvider>
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.getPropertyValue('--section-accent-10')).toBe('#DC26261A');
  });

  it('renders children', () => {
    const { getByText } = render(
      <SectionThemeProvider sectionId="switzerland">
        <span>Hello World</span>
      </SectionThemeProvider>
    );
    expect(getByText('Hello World')).toBeInTheDocument();
  });
});
