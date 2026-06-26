import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  adjustWalletBalance,
  createCustomerWallet,
  getProfileById,
  sendTip,
} from "@/lib/db/profiles";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const {
      fromProfileId,
      fromName,
      toProfileId,
      amountCents,
      npsScore,
      workplaceId,
      topUpCents,
    } = body as {
      fromProfileId?: string | null;
      fromName?: string;
      toProfileId?: string;
      amountCents?: number;
      npsScore?: number;
      workplaceId?: string;
      topUpCents?: number;
    };

    if (!toProfileId || !amountCents || amountCents <= 0 || !fromName?.trim()) {
      return NextResponse.json({ error: "Invalid tip payload" }, { status: 400 });
    }

    let senderId = fromProfileId ?? null;

    if (!senderId) {
      const guest = await createCustomerWallet(fromName);
      senderId = guest.id;
    }

    if (topUpCents && topUpCents > 0) {
      await adjustWalletBalance(senderId, topUpCents, {
        type: "top_up",
        label: "Wallet top-up during tip (demo)",
      });
    }

    const sender = await getProfileById(senderId);
    if (!sender) {
      return NextResponse.json({ error: "Sender wallet not found" }, { status: 404 });
    }

    if (sender.walletBalanceCents < amountCents) {
      return NextResponse.json(
        {
          error: "Insufficient wallet balance",
          profile: sender,
          requiresTopUp: true,
        },
        { status: 402 }
      );
    }

    const tip = await sendTip({
      fromProfileId: senderId,
      fromName: fromName.trim(),
      toProfileId,
      amountCents,
      npsScore,
      workplaceId,
    });

    const tipRow = tip as {
      id: string;
      from_name: string;
      to_profile_id: string;
      amount_cents: number;
      nps_score: number | null;
      created_at: string;
    };

    const [updatedSender, updatedRecipient] = await Promise.all([
      getProfileById(senderId),
      getProfileById(toProfileId),
    ]);

    return NextResponse.json({
      tip: {
        id: tipRow.id,
        fromName: tipRow.from_name,
        toEmployeeId: tipRow.to_profile_id,
        amountCents: tipRow.amount_cents,
        npsScore: tipRow.nps_score ?? undefined,
        createdAt: tipRow.created_at,
      },
      sender: updatedSender,
      recipient: updatedRecipient,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send tip";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
