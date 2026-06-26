import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  adjustWalletBalance,
  getProfileById,
  getTipsForProfile,
  getTransactionsForProfile,
} from "@/lib/db/profiles";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  try {
    const { id } = await params;
    const profile = await getProfileById(id);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { deltaCents, type, label } = body as {
      deltaCents?: number;
      type?: "top_up" | "tip_sent" | "tip_received" | "withdraw";
      label?: string;
    };

    if (typeof deltaCents !== "number" || !type || !label) {
      return NextResponse.json({ error: "Invalid balance update payload" }, { status: 400 });
    }

    const profile = await adjustWalletBalance(id, deltaCents, { type, label });
    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
