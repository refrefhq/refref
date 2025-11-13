import * as React from 'react';
import { MagicLinkEmail } from './templates/MagicLinkEmail.js';
import { InvitationEmail } from './templates/InvitationEmail.js';
import { renderEmail } from './utils/render.js';

/**
 * Generates HTML for a magic link email
 * @param magicLink - The magic link URL for authentication
 * @returns HTML string ready to be sent via email
 */
export async function renderMagicLinkEmail(magicLink: string): Promise<string> {
  return await renderEmail(React.createElement(MagicLinkEmail, { magicLink }));
}

/**
 * Generates HTML for an invitation email
 * @param params - Invitation parameters
 * @returns HTML string ready to be sent via email
 */
export async function renderInvitationEmail(params: {
  role: string;
  inviterName?: string;
  inviterEmail?: string;
  inviteLink: string;
}): Promise<string> {
  return await renderEmail(React.createElement(InvitationEmail, params));
}

// Export the template components for advanced use cases
export { MagicLinkEmail } from './templates/MagicLinkEmail.js';
export { InvitationEmail } from './templates/InvitationEmail.js';
