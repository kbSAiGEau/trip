import { formatLocalTime } from '@/lib/timezone';

interface TransitCardProps {
  type: 'flight' | 'train' | 'ferry';
  carrier: string;
  reference: string;
  origin: { name: string; time: string; timezone: string };
  destination: { name: string; time: string; timezone: string };
  note?: string;
}

const typeIcons: Record<TransitCardProps['type'], string> = {
  flight: '✈',
  train: '🚂',
  ferry: '⛴',
};

const typeLabels: Record<TransitCardProps['type'], string> = {
  flight: 'Flight',
  train: 'Train',
  ferry: 'Ferry',
};

export default function TransitCard({ type, carrier, reference, origin, destination, note }: TransitCardProps) {
  const icon = typeIcons[type];
  const label = typeLabels[type];
  const depTime = formatLocalTime(origin.time, origin.timezone);
  const arrTime = formatLocalTime(destination.time, destination.timezone);

  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: 8,
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        marginBottom: 12,
      }}
    >
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 4 }}>
        {icon} {label} to {destination.name}
      </div>
      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
        {carrier} · Ref: {reference}
      </div>
      <div style={{ fontSize: '0.875rem' }}>
        {origin.name} {depTime} → {destination.name} {arrTime}
      </div>
      {note && (
        <div
          data-testid="transit-note"
          style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: 6 }}
        >
          {note}
        </div>
      )}
    </div>
  );
}
