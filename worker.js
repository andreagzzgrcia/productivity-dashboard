// Productivity Dashboard — Cloudflare Worker
// Serves the single-page dashboard and stores its state in Workers KV.
// Bindings: KV namespace as `KV`, secret text as `SECRET` (URL path prefix).
// No secrets in this file.

import INDEX_HTML from "./index.html";
import ICON_192 from "./icon-192.png";
import ICON_512 from "./icon-512.png";

const SW_JS = `self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].focus) return list[i].focus();
    }
    var url = (event.notification.data && event.notification.data.url) || './';
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
`;

const STATE_KEY = "mg_state";
const MAX_BYTES = 20 * 1024 * 1024; // KV values can be up to 25 MiB

const BASE_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
};

function respond(body, status, extra) {
  return new Response(body, { status, headers: { ...BASE_HEADERS, ...extra } });
}
function json(obj, status = 200) {
  return respond(JSON.stringify(obj), status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
}
function notFound() {
  return respond("Not found", 404, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
}
function secretBase(env) {
  const s = String(env.SECRET || "").replace(/^\/+|\/+$/g, "");
  return s ? "/" + s : "";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/robots.txt") {
      return respond("User-agent: *\nDisallow: /\n", 200, { "Content-Type": "text/plain; charset=utf-8" });
    }

    if (url.pathname === "/icons/icon-192.png" || url.pathname === "/icons/icon-512.png") {
      const body = url.pathname.endsWith("icon-512.png") ? ICON_512 : ICON_192;
      return respond(body, 200, {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      });
    }

    const base = secretBase(env);
    if (!base) return notFound();

    if (url.pathname === base) {
      return Response.redirect(url.origin + base + "/", 301);
    }
    if (!url.pathname.startsWith(base + "/")) return notFound();

    const p = url.pathname.slice(base.length);

    if (p === "/api/state") {
      if (!env.KV) return json({ error: "KV binding missing" }, 500);

      if (request.method === "GET") {
        const raw = await env.KV.get(STATE_KEY);
        if (!raw) return respond(null, 204, { "Cache-Control": "no-store" });
        return respond(raw, 200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      }

      if (request.method === "POST" || request.method === "PUT") {
        const text = await request.text();
        if (text.length > MAX_BYTES) return json({ error: "Payload too large" }, 413);
        let data;
        try { data = JSON.parse(text); } catch { return json({ error: "Invalid JSON" }, 400); }
        if (!data || !Array.isArray(data.cats) || !Array.isArray(data.tasks) || data.cats.length === 0) {
          return json({ error: "Expected {cats:[], tasks:[]}" }, 400);
        }
        data.savedAt = new Date().toISOString();
        await env.KV.put(STATE_KEY, JSON.stringify(data));
        return json({ ok: true, savedAt: data.savedAt });
      }

      return json({ error: "Method not allowed" }, 405);
    }


    if (p === "/sw.js") {
      return respond(SW_JS, 200, {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-cache",
        "Service-Worker-Allowed": base + "/",
      });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return respond("Method not allowed", 405, { "Content-Type": "text/plain; charset=utf-8" });
    }

    if (p === "/" || p === "/index.html") {
      return respond(INDEX_HTML, 200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      });
    }

    return notFound();
  },
};
