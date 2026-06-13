import { NextResponse } from "next/server";

import { getUserOrThrow } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserOrThrow(token).catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { text?: unknown };
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "Feedback text is required" }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "Feedback too long" }, { status: 400 });

  const title = text.length > 60 ? text.slice(0, 57) + "…" : text;
  const supabase = supabaseService();
  const { error } = await supabase.from("roadmap_items").insert({
    title,
    description: text,
    feature_status: "feedback",
    is_published: false,
    sort_order: 0,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
