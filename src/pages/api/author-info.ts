export const prerender = false;

import type { APIRoute } from "astro";
export const GET: APIRoute = async (_ctx) => {
  return new Response(
    JSON.stringify({
      name: "xqv",
      age: 25,
    }),
  );
};
