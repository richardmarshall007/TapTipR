import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getEmployeesForWorkplace, getWorkplaceByCode } from "@/lib/db/profiles";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  try {
    const { code } = await params;
    const workplace = await getWorkplaceByCode(code);

    if (!workplace) {
      return NextResponse.json({ error: "Workplace not found" }, { status: 404 });
    }

    const employees = await getEmployeesForWorkplace(workplace.id);

    return NextResponse.json({
      workplace: {
        id: workplace.id,
        name: workplace.name,
        slug: workplace.slug,
        businessCode: workplace.business_code,
        logoEmoji: workplace.logo_emoji,
      },
      employees,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
