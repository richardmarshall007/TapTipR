import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getProfileByCode } from "@/lib/db/profiles";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  try {
    const { code } = await params;
    const profile = await getProfileByCode(code);

    if (!profile) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    return NextResponse.json({
      employee: {
        id: profile.id,
        name: profile.name,
        employeeCode: profile.employee_code,
        verified: profile.verified,
        workplace: profile.workplaces
          ? {
              id: profile.workplaces.id,
              name: profile.workplaces.name,
              slug: profile.workplaces.slug,
              businessCode: profile.workplaces.business_code,
              logoEmoji: profile.workplaces.logo_emoji,
            }
          : {
              id: "wp-custom",
              name: "TapTipR Partner",
              slug: "partner",
              businessCode: "PARTNER",
              logoEmoji: "✨",
            },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
