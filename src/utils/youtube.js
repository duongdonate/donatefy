const ID = /^[\w-]{11}$/;

export function parseYouTubeId(text) {
  const t = String(text ?? "").trim();
  if (ID.test(t)) return t;
  try {
    const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
    const host = u.hostname.replace(/^(www|m|music)\./, "");
    let id = null;
    if (host === "youtube.com") id = u.pathname === "/watch" ? u.searchParams.get("v") : u.pathname.match(/^\/shorts\/([^/]+)/)?.[1];
    else if (host === "youtu.be") id = u.pathname.slice(1);
    return id && ID.test(id) ? id : null;
  } catch {
    return null;
  }
}

export const frameUrls = (id) => ["hqdefault", "hq1", "hq2", "hq3"].map((n) => `https://i.ytimg.com/vi/${id}/${n}.jpg`);

export async function fetchOembed(id) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
    if (!res.ok) return null;
    const { title, author_name } = await res.json();
    if (!String(title ?? "").trim()) return null; // video chết: oEmbed vẫn 200 nhưng không có tiêu đề
    return { name: String(title ?? "").trim(), artist: String(author_name ?? "").trim() };
  } catch {
    return null;
  }
}
