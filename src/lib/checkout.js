/*
  Costruttori URL di checkout Lemon Squeezy.
  - buildCfaCheckoutUrl: abbonamento CFA Premium (mensile/annuale) — flusso esistente.
  - buildCourseCheckoutUrl: acquisto one-off di un corso (un variant per corso).

  Entrambi passano `checkout[custom][user_id]` così il webhook può collegare
  l'acquisto all'utente. Per i corsi passiamo anche product_type e course_id,
  che il webhook legge da meta.custom_data per creare la riga di enrollment.

  NB: garantire SEMPRE user.id prima di redirigere — se manca, il webhook
  risponde 400 e l'acquisto non viene collegato a nessun account.
*/
import { CHECKOUT } from "./supabase.js";

function withParams(baseUrl, { email, custom = {} }) {
  const params = new URLSearchParams();
  if (email) params.set("checkout[email]", email);
  for (const [k, v] of Object.entries(custom)) {
    if (v != null && v !== "") params.set(`checkout[custom][${k}]`, String(v));
  }
  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

export function buildCfaCheckoutUrl(user, billing = "monthly") {
  if (!user?.id) throw new Error("buildCfaCheckoutUrl: user.id mancante");
  const base = billing === "annual" ? CHECKOUT.annual : CHECKOUT.monthly;
  return withParams(base, {
    email: user.email,
    custom: { user_id: user.id, product_type: "cfa", billing },
  });
}

export function buildCourseCheckoutUrl(user, course) {
  if (!user?.id) throw new Error("buildCourseCheckoutUrl: user.id mancante");
  if (!course?.lemonsqueezy_variant_id) {
    throw new Error("buildCourseCheckoutUrl: lemonsqueezy_variant_id mancante sul corso");
  }
  const base = `https://cfaprep.lemonsqueezy.com/checkout/buy/${course.lemonsqueezy_variant_id}`;
  return withParams(base, {
    email: user.email,
    custom: { user_id: user.id, product_type: "course", course_id: course.id },
  });
}
