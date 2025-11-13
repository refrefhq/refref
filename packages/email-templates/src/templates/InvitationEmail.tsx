import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface InvitationEmailProps {
  role?: string;
  inviterName?: string;
  inviterEmail?: string;
  inviteLink?: string;
}

export function InvitationEmail({
  role = 'member',
  inviterName,
  inviterEmail,
  inviteLink = 'https://app.refref.com/accept-invitation/example',
}: InvitationEmailProps) {
  const inviterDisplay = inviterName || inviterEmail || 'Someone';

  return (
    <Html>
      <Head>
        <style>
          {`
            @media (prefers-color-scheme: dark) {
              .dark-bg {
                background-color: #18181b !important;
              }
              .dark-container-bg {
                background-color: #27272a !important;
              }
              .dark-text {
                color: #fafafa !important;
              }
              .dark-text-muted {
                color: #a1a1aa !important;
              }
              .dark-border {
                border-color: #3f3f46 !important;
              }
            }
          `}
        </style>
      </Head>
      <Preview>You've been invited to join RefRef</Preview>
      <Body
        style={{
          backgroundColor: '#fafafa',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          padding: '40px 20px',
        }}
        className="dark-bg"
      >
        <Container
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '600px',
            margin: '0 auto',
            padding: '0',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
          className="dark-container-bg dark-border"
        >
          {/* Header with Logo */}
          <Section
            style={{
              padding: '40px 40px 32px',
              textAlign: 'center',
            }}
          >
            <Img
              src="https://app.refref.com/icon-192x192.png"
              alt="RefRef"
              width="48"
              height="48"
              style={{
                margin: '0 auto',
                display: 'block',
              }}
            />
          </Section>

          {/* Main Content */}
          <Section style={{ padding: '0 40px 40px' }}>
            <Heading
              style={{
                color: '#252525',
                fontSize: '24px',
                fontWeight: '600',
                lineHeight: '32px',
                margin: '0 0 16px',
                textAlign: 'center',
              }}
              className="dark-text"
            >
              You've been invited to RefRef
            </Heading>

            <Text
              style={{
                color: '#1f2937',
                fontSize: '16px',
                lineHeight: '24px',
                margin: '0 0 8px',
                textAlign: 'center',
              }}
              className="dark-text-muted"
            >
              Hi there,
            </Text>

            <Text
              style={{
                color: '#1f2937',
                fontSize: '16px',
                lineHeight: '24px',
                margin: '0 0 32px',
                textAlign: 'center',
              }}
              className="dark-text-muted"
            >
              <strong style={{ color: '#252525' }} className="dark-text">
                {inviterDisplay}
              </strong>{' '}
              has invited you to join their project as a <em>{role}</em>.
            </Text>

            {/* CTA Button */}
            <Section style={{ textAlign: 'center', margin: '0 0 32px' }}>
              <Button
                href={inviteLink}
                style={{
                  backgroundColor: '#3b82f6',
                  borderRadius: '8px',
                  color: '#ffffff',
                  display: 'inline-block',
                  fontSize: '16px',
                  fontWeight: '600',
                  lineHeight: '24px',
                  padding: '14px 32px',
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
              >
                Accept Invitation
              </Button>
            </Section>

            {/* Alternative Link */}
            <Text
              style={{
                color: '#8E8E8E',
                fontSize: '14px',
                lineHeight: '20px',
                margin: '0 0 8px',
                textAlign: 'center',
              }}
              className="dark-text-muted"
            >
              Or copy and paste this link into your browser:
            </Text>
            <Text
              style={{
                color: '#1f2937',
                fontSize: '13px',
                lineHeight: '20px',
                margin: '0',
                textAlign: 'center',
                wordBreak: 'break-all',
              }}
              className="dark-text-muted"
            >
              <Link
                href={inviteLink}
                style={{
                  color: '#1f2937',
                  textDecoration: 'underline',
                }}
                className="dark-text-muted"
              >
                {inviteLink}
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section
            style={{
              borderTop: '1px solid #EBEBEB',
              padding: '32px 40px',
              backgroundColor: '#F8F8F8',
            }}
            className="dark-border dark-bg"
          >
            <Text
              style={{
                color: '#8E8E8E',
                fontSize: '13px',
                lineHeight: '20px',
                margin: '0 0 8px',
                textAlign: 'center',
              }}
              className="dark-text-muted"
            >
              This invitation expires in 7 days.
            </Text>
            <Text
              style={{
                color: '#8E8E8E',
                fontSize: '13px',
                lineHeight: '20px',
                margin: '0 0 8px',
                textAlign: 'center',
              }}
              className="dark-text-muted"
            >
              If you didn't expect this invitation, you can safely ignore it.
            </Text>
            <Text
              style={{
                color: '#8E8E8E',
                fontSize: '12px',
                lineHeight: '16px',
                margin: '0',
                textAlign: 'center',
              }}
              className="dark-text-muted"
            >
              © {new Date().getFullYear()} RefRef. All rights reserved.
            </Text>
          </Section>
        </Container>

        {/* Security Notice */}
        <Section style={{ padding: '24px 0 0' }}>
          <Text
            style={{
              color: '#8E8E8E',
              fontSize: '12px',
              lineHeight: '16px',
              margin: '0',
              textAlign: 'center',
            }}
            className="dark-text-muted"
          >
            This is an automated email from RefRef. For security reasons, please do not share this
            link with anyone.
          </Text>
        </Section>
      </Body>
    </Html>
  );
}

export default InvitationEmail;
