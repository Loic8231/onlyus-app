// supabase/functions/geocode-city/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  try {
    const { city, country = "France" } = await req.json();
    if (!city || typeof city !== "string") {
      return new Response(JSON.stringify({ error: "city required" }), { status: 400 });
    }

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", `${city}, ${country}`);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const r = await fetch(url.toString(), {
      headers: { "User-Agent": "onlyus-app/1.0 (contact: admin@onlyus.app)" },
    });
    const arr = await r.json();
    if (!Array.isArray(arr) || arr.length === 0) {
      return new Response(JSON.stringify({ error: "not_found" }), { status: 404 });
    }

    const { lat, lon, display_name } = arr[0];
    return new Response(
      JSON.stringify({ lat: parseFloat(lat), lng: parseFloat(lon), label: display_name }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});