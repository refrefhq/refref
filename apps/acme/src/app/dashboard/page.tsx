'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { refrefConfig } from '@/lib/refref-config';

interface User {
  id: string;
  email: string;
  name: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    fetch('/api/me', {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          // Not authenticated, redirect to login
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    });
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '100px auto', padding: '20px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '100px auto', padding: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
        }}
      >
        <h1>ACME Dashboard</h1>
        <button
          onClick={handleLogout}
          data-testid="acme-logout-button"
          style={{
            padding: '8px 16px',
            background: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      <div
        data-testid="acme-dashboard-content"
        style={{
          padding: '20px',
          background: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        <h2>Welcome, {user.name}!</h2>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>User ID:</strong> {user.id}
        </p>

        <div style={{ marginTop: '20px' }}>
          <a
            href="/purchase"
            data-testid="purchase-link"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              background: '#0070f3',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            View Plans & Purchase
          </a>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3>Refer & Earn</h3>
        <div
          id="refref-widget"
          data-testid="refref-widget-container"
          style={{
            marginTop: '20px',
            padding: '20px',
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #ddd',
          }}
        >
          {/* RefRef widget will be rendered here */}
        </div>
      </div>

      {/* RefRef Widget Script */}
      <Script
        src={refrefConfig.widgetScriptUrl}
        strategy="afterInteractive"
        onLoad={async () => {
          // Initialize widget when script loads
          if (typeof window !== 'undefined') {
            try {
              // Fetch JWT token and config from backend
              const response = await fetch('/api/refref/token', {
                credentials: 'include',
              });

              if (!response.ok) {
                console.error('Failed to get RefRef token:', response.statusText);
                return;
              }

              const responseData = await response.json();
              console.log('[Dashboard] Token API response:', responseData);
              const { token, productId, programId } = responseData;
              console.log('[Dashboard] Extracted values:', { token: token ? 'present' : 'missing', productId, programId });

              // Initialize window.RefRef array if it doesn't exist
              (window as any).RefRef = (window as any).RefRef || [];

              // Initialize widget using push pattern (queue-based)
              // Note: participantId is not sent to backend - the JWT 'sub' field contains the external user ID
              (window as any).RefRef.push([
                'init',
                {
                  productId,
                  programId,
                  participantId: user.email, // Stored locally in widget (not sent to backend)
                  token, // JWT token with user's external ID in 'sub' field
                },
              ]);

              console.log('RefRef widget initialized with productId:', productId, 'programId:', programId);
            } catch (error) {
              console.error('Error initializing RefRef widget:', error);
            }
          }
        }}
      />
    </div>
  );
}
