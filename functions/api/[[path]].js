/**
 * ============================================================================
 * Mobile Gallery — Cloudflare Pages Functions API Catch-all
 * ============================================================================
 * Handles all /api/* requests on Cloudflare Pages with D1 and R2 bindings.
 * ============================================================================
 */

import { handleApiRequest, handleOptions } from './_api.js';

export async function onRequest(context) {
  const { request, env, waitUntil } = context;

  if (request.method === 'OPTIONS') {
    return handleOptions();
  }

  return handleApiRequest(request, env, { waitUntil });
}
