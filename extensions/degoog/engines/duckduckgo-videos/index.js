// @bun
// lib/searxng.js
var timeRanges = { day: "day", week: "week", month: "month", year: "year" };
function publicUrl(value) {
  if (typeof value !== "string" || !value)
    return;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : undefined;
  } catch {
    return;
  }
}
function mapResult(result, name) {
  const url = publicUrl(result.url);
  if (!url || typeof result.title !== "string")
    return null;
  return {
    title: result.title,
    url,
    snippet: typeof result.content === "string" ? result.content : "",
    source: name,
    ...publicUrl(result.thumbnail) ? { thumbnail: publicUrl(result.thumbnail) } : {},
    ...publicUrl(result.img_src) ? { imageUrl: publicUrl(result.img_src) } : {},
    ...result.length ? { duration: String(result.length) } : {}
  };
}
function createSearxEngine({ name, engine, timeRange = false, paging = true }, { fetcher = fetch, baseUrl = process.env.SEARXNG_URL } = {}) {
  return {
    name,
    async executeSearch(query, page = 1, time = "any", context = {}) {
      if (!Number.isSafeInteger(page) || page < 1)
        throw new Error("Invalid search page");
      if (time !== "any" && (!timeRange || !Object.hasOwn(timeRanges, time))) {
        throw new Error(`${name} does not support the selected date filter`);
      }
      if (!paging && page > 1)
        return [];
      const url = new URL("search", `${baseUrl?.replace(/\/$/, "")}/`);
      url.search = new URLSearchParams({ q: query, engines: engine, pageno: String(page), format: "json" });
      if (context.lang)
        url.searchParams.set("language", context.lang);
      if (timeRanges[time])
        url.searchParams.set("time_range", timeRanges[time]);
      const safe = context.imageFilter?.nsfw;
      if (safe)
        url.searchParams.set("safesearch", safe === "on" ? "2" : safe === "moderate" ? "1" : "0");
      const response = await fetcher(url);
      if (!response.ok)
        throw new Error(`SearXNG HTTP ${response.status}`);
      const body = await response.json();
      if (!Array.isArray(body.results) || !Array.isArray(body.unresponsive_engines))
        throw new Error("Invalid SearXNG response");
      const failure = body.unresponsive_engines.find((item) => Array.isArray(item) && item[0] === engine);
      if (failure) {
        const reason = String(failure[1]);
        const status = /captcha/i.test(reason) ? "captcha" : /too many requests?|HTTP error 429/i.test(reason) ? "rate_limited" : /access denied|HTTP error 40[23]/i.test(reason) ? "blocked" : /timeout|timed out/i.test(reason) ? "timeout" : undefined;
        throw status && context.engineError?.(status, `${name}: ${reason}`, { engine: name }) || new Error(`${name}: ${reason}`);
      }
      if (body.results.some((result) => !Array.isArray(result?.engines) || !result.engines.includes(engine))) {
        throw new Error(`SearXNG returned results outside the requested ${name} provider`);
      }
      return body.results.map((result) => mapResult(result, name)).filter(Boolean);
    }
  };
}
export {
  mapResult,
  createSearxEngine
};

export const type = "videos";
export const filters = {"nsfw":["on","moderate","off"]};
export default createSearxEngine({"id":"duckduckgo-videos","name":"DuckDuckGo Videos","engine":"duckduckgo videos","category":"videos","type":"videos","timeRange":false,"paging":true,"safeSearch":true});
