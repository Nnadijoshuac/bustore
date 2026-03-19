import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();

  return NextResponse.json({
    iso: now.toISOString(),
    unixMs: now.getTime(),
  });
}
