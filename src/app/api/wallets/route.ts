import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createEmployeeWallet } from "@/lib/db/profiles";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { name, phone, workplaceId } = body as {
      name?: string;
      phone?: string;
      workplaceId?: string;
    };

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    const profile = await createEmployeeWallet({
      name: name.trim(),
      phone: phone.trim(),
      workplaceId,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create wallet";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
