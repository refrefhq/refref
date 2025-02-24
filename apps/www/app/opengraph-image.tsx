import { ImageResponse } from 'next/og';
import { Geist } from 'next/font/google';

export const runtime = 'nodejs';
export const dynamic = 'force-static';

export const alt = 'RefRef - Open Source Referral Management Platform';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

const geist = Geist({
  weight: '400',
  subsets: ['latin'],
});

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #000000, #1a1a1a)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <div
          style={{
            fontSize: 60,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '20px',
            textAlign: 'center',
            fontFamily: geist.style.fontFamily,
          }}
        >
          RefRef
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#888888',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          Open Source Referral Management Platform
        </div>
        <div
          style={{
            fontSize: 24,
            color: '#666666',
            marginTop: '20px',
            textAlign: 'center',
          }}
        >
          Launch your referral program in minutes
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}