export interface Env {
  ASSETS: Fetcher;
  VITE_INDEX_ACCESS_CODE?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Diagnostic endpoint: Navigate to /api/debug in your browser to verify variable detection
    if (url.pathname === "/api/debug") {
      const fromEnv = env.VITE_INDEX_ACCESS_CODE;
      const fromProcess = typeof process !== "undefined" ? process.env?.VITE_INDEX_ACCESS_CODE : undefined;
      const activeCode = fromEnv || fromProcess;

      return Response.json({
        hasEnvBinding: Boolean(fromEnv),
        envLength: fromEnv ? fromEnv.length : 0,
        hasProcessEnv: Boolean(fromProcess),
        processEnvLength: fromProcess ? fromProcess.length : 0,
        isConfigured: Boolean(activeCode),
        activeLength: activeCode ? activeCode.length : 0
      });
    }

    if (request.method === "POST" && url.pathname === "/api/verify") {
      try {
        const { code } = (await request.json()) as { code?: string };
        const expectedCode = env.VITE_INDEX_ACCESS_CODE || (typeof process !== "undefined" ? process.env?.VITE_INDEX_ACCESS_CODE : undefined);
        const isValid = Boolean(expectedCode && code === expectedCode);
        return Response.json({ success: isValid });
      } catch {
        return Response.json({ success: false }, { status: 400 });
      }
    }

    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
