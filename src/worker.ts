export interface Env {
  ASSETS: Fetcher;
  VITE_INDEX_ACCESS_CODE?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/verify") {
      try {
        const { code } = (await request.json()) as { code?: string };
        const expectedCode = env.VITE_INDEX_ACCESS_CODE;
        const isValid = Boolean(expectedCode && code === expectedCode);
        return Response.json({ success: isValid });
      } catch {
        return Response.json({ success: false }, { status: 400 });
      }
    }

    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
