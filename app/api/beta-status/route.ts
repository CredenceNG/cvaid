/**
 * GET /api/beta-status
 *
 * Returns whether beta mode is enabled
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const betaMode = process.env.BETA_MODE === 'true';

  return NextResponse.json({
    betaMode,
  });
}
