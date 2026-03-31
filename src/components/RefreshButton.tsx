'use client';

export function RefreshButton() {
  const handleRefresh = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
      }
    }

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }

    window.location.reload();
  };

  return (
    <button
      onClick={handleRefresh}
      aria-label="Refresh app"
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '16px',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: 'none',
        background: '#6366f1',
        color: '#fff',
        fontSize: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 50,
      }}
    >
      ↻
    </button>
  );
}
