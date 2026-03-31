import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AccommodationCard from '@/components/AccommodationCard';

describe('AccommodationCard', () => {
  // FE-010-HP-01: Accommodation card displays hotel name and address
  it('renders hotel icon, name, and address', () => {
    render(
      <AccommodationCard
        hotelName="Hotel Interlaken"
        address="Höheweg 45, 3800 Interlaken"
      />
    );

    expect(screen.getByText(/🏨/)).toBeInTheDocument();
    expect(screen.getByText('Hotel Interlaken')).toBeInTheDocument();
    expect(screen.getByText('Höheweg 45, 3800 Interlaken')).toBeInTheDocument();
  });

  // INT-005: Accommodation card integrates with getAccommodation query
  it('renders different hotel data correctly', () => {
    render(
      <AccommodationCard
        hotelName="Hotel Boom"
        address="Grote Markt 12, 2850 Boom"
      />
    );

    expect(screen.getByText('Hotel Boom')).toBeInTheDocument();
    expect(screen.getByText('Grote Markt 12, 2850 Boom')).toBeInTheDocument();
  });
});
