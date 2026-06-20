import { createClient } from "@supabase/supabase-js";

/* Values come from Vite env (.env). Fallbacks keep the app working
   out-of-the-box in this demo project. The anon key is a public
   publishable key and is safe to ship in client code. */
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://otijqofdmqarnerumopm.supabase.co";

const SUPABASE_ANON =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aWpxb2ZkbXFhcm5lcnVtb3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDk5MTcsImV4cCI6MjA5NTQ4NTkxN30.jjb71cgo5QTg2synIwqniCX1epgYVLFZyq0iFO4FOAw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

export const CHECKOUT = {
  monthly:
    import.meta.env.VITE_CHECKOUT_MONTHLY ||
    "https://cfaprep.lemonsqueezy.com/checkout/buy/544c4577-6dd6-45db-ad74-2160893257c6",
  annual:
    import.meta.env.VITE_CHECKOUT_ANNUAL ||
    "https://cfaprep.lemonsqueezy.com/checkout/buy/327777c9-c76d-4018-9cec-103b8c7d32b2",
};
