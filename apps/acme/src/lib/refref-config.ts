/**
 * RefRef integration configuration for ACME
 * Service URLs are static, credentials are dynamic (set via /api/test/configure)
 */

import { getRefRefConfigSync } from './refref-runtime-config';

export const refrefConfig = {
  // RefRef service URLs (static)
  referUrl: process.env.NEXT_PUBLIC_REFREF_REFER_URL || 'http://localhost:3002',
  apiUrl: process.env.NEXT_PUBLIC_REFREF_API_URL || 'http://localhost:3001',
  assetsUrl: process.env.NEXT_PUBLIC_REFREF_ASSETS_URL || 'http://localhost:8787',

  // Product credentials (dynamic - from runtime config or fallback to env)
  get productId() {
    const config = getRefRefConfigSync();
    return config?.productId || 'acme-product';
  },
  get clientId() {
    const config = getRefRefConfigSync();
    return config?.clientId || 'test-client-id';
  },
  get clientSecret() {
    const config = getRefRefConfigSync();
    return config?.clientSecret || 'test-client-secret';
  },
  get programId() {
    const config = getRefRefConfigSync();
    return config?.programId || 'test-program-id';
  },

  // Script URLs (both served from assets server)
  get attributionScriptUrl() {
    return `${this.assetsUrl}/scripts/attribution.js`;
  },
  get widgetScriptUrl() {
    return `${this.assetsUrl}/scripts/widget.js`;
  },
};
