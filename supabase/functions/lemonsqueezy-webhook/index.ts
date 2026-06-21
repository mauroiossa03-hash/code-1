// ============================================================
// Edge Function: lemonsqueezy-webhook
// Gestisce sia gli abbonamenti CFA Premium sia gli acquisti
// one-off dei corsi, distinti via meta.custom_data.product_type.
//
// JWT verification OFF (convenzione del progetto). Configurare:
//   supabase functions deploy lemonsqueezy-webhook --no-verify-jwt
//
// Env richieste:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, LEMONSQUEEZY_WEBHOOK_SECRET
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("LEMONSQUEEZY_WEBHOOK_SECRET") ?? "";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

// Verifica firma HMAC-SHA256 (header X-Signature).
async function verifySignature(rawBody: string, signature: string | null): Promise<boolean> {
  if (!WEBHOOK_SECRET) return true; // se non configurato, salta (solo test)
  if (!signature) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const digest = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
  // confronto a tempo costante
  if (digest.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < digest.length; i++) diff |= digest.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const rawBody = await req.text();
  const signature = req.headers.get("X-Signature");
  if (!(await verifySignature(rawBody, signature))) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventName: string = payload?.meta?.event_name ?? "";
  const custom = payload?.meta?.custom_data ?? {};
  const productType: string = custom.product_type ?? "cfa"; // default: flusso storico
  const attrs = payload?.data?.attributes ?? {};

  const userId: string | undefined = custom.user_id;
  if (!userId) {
    // senza user_id non possiamo collegare l'acquisto a un account
    return new Response("Missing custom_data.user_id", { status: 400 });
  }

  try {
    // ---------- CORSI (one-off) ----------
    if (productType === "course") {
      const courseId: string | undefined = custom.course_id;
      if (!courseId) return new Response("Missing custom_data.course_id", { status: 400 });

      // creiamo l'enrollment solo su ordine andato a buon fine
      if (eventName === "order_created") {
        const status = attrs?.status; // 'paid'
        if (status && status !== "paid") {
          return new Response("Order not paid yet", { status: 200 });
        }
        const orderId = String(payload?.data?.id ?? attrs?.order_number ?? "");
        const { error } = await admin
          .from("course_enrollments")
          .upsert(
            {
              user_id: userId,
              course_id: courseId,
              source: "purchase",
              lemonsqueezy_order_id: orderId,
            },
            { onConflict: "user_id,course_id" },
          );
        if (error) throw error;
        return new Response("Course enrollment created", { status: 200 });
      }
      // altri eventi corso non gestiti
      return new Response("Ignored course event", { status: 200 });
    }

    // ---------- CFA Premium (subscription) — flusso esistente ----------
    // Manteniamo la logica storica: upsert nella tabella subscriptions.
    if (
      eventName === "subscription_created" ||
      eventName === "subscription_updated" ||
      eventName === "subscription_resumed" ||
      eventName === "subscription_unpaused"
    ) {
      const { error } = await admin
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            status: "active",
            current_period_end: attrs?.renews_at ?? attrs?.ends_at ?? null,
          },
          { onConflict: "user_id" },
        );
      if (error) throw error;
      return new Response("Subscription active", { status: 200 });
    }

    if (
      eventName === "subscription_cancelled" ||
      eventName === "subscription_expired" ||
      eventName === "subscription_paused"
    ) {
      const status = eventName === "subscription_paused" ? "paused" : "cancelled";
      const { error } = await admin
        .from("subscriptions")
        .upsert(
          { user_id: userId, status, current_period_end: attrs?.ends_at ?? null },
          { onConflict: "user_id" },
        );
      if (error) throw error;
      return new Response("Subscription updated", { status: 200 });
    }

    return new Response("Ignored event", { status: 200 });
  } catch (e) {
    console.error("webhook error:", e);
    return new Response("Server error", { status: 500 });
  }
});
