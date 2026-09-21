export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { setGlobalDispatcher, ProxyAgent } = await import("undici");
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    if (proxyUrl) {
      setGlobalDispatcher(new ProxyAgent(proxyUrl));
      console.log("[proxy] Using", proxyUrl);
    }
  }
}
