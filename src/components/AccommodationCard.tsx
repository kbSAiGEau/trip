interface AccommodationCardProps {
  hotelName: string;
  address: string;
}

export default function AccommodationCard({ hotelName, address }: AccommodationCardProps) {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: 8,
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
      }}
    >
      <div style={{ marginBottom: 4 }}>🏨</div>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 2 }}>
        {hotelName}
      </div>
      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        {address}
      </div>
    </div>
  );
}
