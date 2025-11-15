import { NextResponse } from 'next/server';
import { clearAllData } from '@/lib/state';
import { clearRefRefConfig } from '@/lib/refref-runtime-config';
import { cookies } from 'next/headers';

/**
 * Test-only endpoint to reset all in-memory data
 * Only available in development environment
 */
export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    clearAllData();
    clearRefRefConfig(); // Also clear RefRef configuration

    // Clear configuration cookies
    const cookieStore = await cookies();
    cookieStore.delete('refref-config');
    cookieStore.delete('refref-secret');

    return NextResponse.json({ success: true, message: 'All data cleared' });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset data' },
      { status: 500 }
    );
  }
}
