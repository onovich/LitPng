import type { APIRoute } from "astro";
import { toolPages } from "../data/toolPages";

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  if (!site) {
    return new Response("Astro site URL is required.", { status: 500 });
  }

  const urls = toolPages
    .map(({ path }) => `  <url><loc>${new URL(path, site).toString()}</loc></url>`)
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
};
