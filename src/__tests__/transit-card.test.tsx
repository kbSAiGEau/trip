import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransitCard from '@/components/TransitCard';

// FE-007-HP-01: Train transit card renders all fields
describe('TransitCard', () => {
  it('renders train transit card with all fields', () => {
    render(
      <TransitCard
        type="train"
        carrier="SBB"
        reference="ABC123"
        origin={{ name: 'Zürich', time: '2026-07-14T09:30', timezone: 'Europe/Zurich' }}
        destination={{ name: 'Interlaken', time: '2026-07-14T11:45', timezone: 'Europe/Zurich' }}
      />
    );

    expect(screen.getByText(/🚂/)).toBeInTheDocument();
    expect(screen.getByText(/Train to Interlaken/)).toBeInTheDocument();
    expect(screen.getByText(/SBB/)).toBeInTheDocument();
    expect(screen.getByText(/ABC123/)).toBeInTheDocument();
    expect(screen.getByText(/09:30/)).toBeInTheDocument();
    expect(screen.getByText(/11:45/)).toBeInTheDocument();
  });

  // FE-007-HP-02: Flight transit card renders correctly
  it('renders flight transit card with all fields', () => {
    render(
      <TransitCard
        type="flight"
        carrier="Swiss Air"
        reference="LX1234"
        origin={{ name: 'Zürich ZRH', time: '2026-07-18T14:00', timezone: 'Europe/Zurich' }}
        destination={{ name: 'Brussels BRU', time: '2026-07-18T15:30', timezone: 'Europe/Brussels' }}
      />
    );

    expect(screen.getByText(/✈/)).toBeInTheDocument();
    expect(screen.getByText(/Flight to Brussels BRU/)).toBeInTheDocument();
    expect(screen.getByText(/Swiss Air/)).toBeInTheDocument();
    expect(screen.getByText(/LX1234/)).toBeInTheDocument();
    expect(screen.getByText(/14:00/)).toBeInTheDocument();
    expect(screen.getByText(/15:30/)).toBeInTheDocument();
  });

  // FE-007-HP-03: Ferry transit card renders correctly
  it('renders ferry transit card with all fields', () => {
    render(
      <TransitCard
        type="ferry"
        carrier="Dodekanisos"
        reference="DS4421"
        origin={{ name: 'Rhodes', time: '2026-07-25T08:30', timezone: 'Europe/Athens' }}
        destination={{ name: 'Symi', time: '2026-07-25T09:20', timezone: 'Europe/Athens' }}
      />
    );

    expect(screen.getByText(/⛴/)).toBeInTheDocument();
    expect(screen.getByText(/Ferry to Symi/)).toBeInTheDocument();
    expect(screen.getByText(/Dodekanisos/)).toBeInTheDocument();
    expect(screen.getByText(/DS4421/)).toBeInTheDocument();
    expect(screen.getByText(/08:30/)).toBeInTheDocument();
    expect(screen.getByText(/09:20/)).toBeInTheDocument();
  });

  // FE-009-HP-01: Transit card displays app note when present
  it('renders app note in italic muted text when present', () => {
    render(
      <TransitCard
        type="train"
        carrier="SBB"
        reference="JFJ001"
        origin={{ name: 'Interlaken Ost', time: '2026-07-14T09:30', timezone: 'Europe/Zurich' }}
        destination={{ name: 'Jungfraujoch', time: '2026-07-14T11:45', timezone: 'Europe/Zurich' }}
        note="Use SBB Mobile app"
      />
    );

    const noteEl = screen.getByText('Use SBB Mobile app');
    expect(noteEl).toBeInTheDocument();
    expect(noteEl).toHaveStyle({ fontStyle: 'italic' });
  });

  // FE-009-EC-01: Transit card with no app note — no note row rendered
  it('does not render note row when note is absent', () => {
    render(
      <TransitCard
        type="flight"
        carrier="Swiss Air"
        reference="LX9999"
        origin={{ name: 'Sydney SYD', time: '2026-07-12T06:00', timezone: 'Australia/Sydney' }}
        destination={{ name: 'Zürich ZRH', time: '2026-07-12T18:00', timezone: 'Europe/Zurich' }}
      />
    );

    expect(screen.queryByTestId('transit-note')).not.toBeInTheDocument();
  });

  // FE-008-HP-01 + INT-006: Departure/arrival times use formatLocalTime
  it('displays origin and destination names with formatted times', () => {
    render(
      <TransitCard
        type="flight"
        carrier="Turkish Airlines"
        reference="TK890"
        origin={{ name: 'Rhodes RHO', time: '2026-07-28T14:00', timezone: 'Europe/Athens' }}
        destination={{ name: 'Istanbul IST', time: '2026-07-28T15:30', timezone: 'Europe/Istanbul' }}
      />
    );

    expect(screen.getByText(/Rhodes RHO/)).toBeInTheDocument();
    expect(screen.getByText(/14:00/)).toBeInTheDocument();
    expect(screen.getByText(/Istanbul IST/)).toBeInTheDocument();
    expect(screen.getByText(/15:30/)).toBeInTheDocument();
  });
});
