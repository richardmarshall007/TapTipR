import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getTransactionsForProfile } from "@/lib/db/profiles";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  try {
    const { id } = await params;
    const transactions = await getTransactionsForProfile(id);
    return NextResponse.json({ transactions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load transactions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
