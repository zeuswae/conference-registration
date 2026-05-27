import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed-db";

/** One-time (or reset) demo data for production. Requires SETUP_SECRET or AUTH_SECRET as ?key= */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") ?? "";
  const setupSecret = process.env.SETUP_SECRET ?? process.env.AUTH_SECRET;

  if (!setupSecret || key !== setupSecret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await seedDatabase();
    return NextResponse.json({
      ok: true,
      message: "Demo users created. Sign in with admin@conference.local / admin12345",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Seed failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
