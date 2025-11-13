import { render } from '@react-email/render';
import * as React from 'react';

/**
 * Renders a React Email component to an HTML string
 * @param component - The React Email component to render
 * @returns The rendered HTML string
 */
export async function renderEmail(component: React.ReactElement): Promise<string> {
  return await render(component, {
    pretty: false,
  });
}
