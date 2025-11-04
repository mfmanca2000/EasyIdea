import { NextResponse } from "next/server";

export async function GET() {
  // This endpoint helps debug environment variable issues
  // REMOVE THIS FILE after debugging!

  const config = {
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasGoogleId: !!process.env.AUTH_GOOGLE_ID,
    hasGoogleSecret: !!process.env.AUTH_GOOGLE_SECRET,
    hasAllowedEmails: !!process.env.ALLOWED_EMAILS,
    googleIdPrefix: process.env.AUTH_GOOGLE_ID?.substring(0, 10) + "...",
    allowedEmailsCount: process.env.ALLOWED_EMAILS?.split(',').length || 0,
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json(config);
}
