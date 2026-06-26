import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getTipsForProfile } from "@/lib/db/profiles";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  try {
    const { id } = await params;
    const tips = await getTipsForProfile(id);
    return NextResponse.json({ tips });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load tips";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
