import { getPublishedBySlug, esc, fmtDate, img, toDate, SITE } from "./blog-data.js";
const el = document.getElementById("article");
const slug = decodeURIComponent(location.pathname.replace(/^\/blog\//, "").replace(/\/$/, ""));

function meta(attr, key, val) {
  let m = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!m) { m = document.createElement("meta"); m.setAttribute(attr, key); document.head.appendChild(m); }
  m.setAttribute("content", val);
}
function notFound() {
  document.title = "Post not found | Syed Mohsin Raza";
  meta("name", "robots", "noindex");
  el.innerHTML = '<h1>Post not found</h1><p class="meta">This post does not exist or is not published.</p><p><a class="back" href="/blog">&larr; Back to blog</a></p>';
}
try {
  const p = slug ? await getPublishedBySlug(slug) : null;
  if (!p) notFound();
  else {
    const url = `${SITE}/blog/${encodeURIComponent(p.slug)}`;
    const title = p.seo?.metaTitle || p.title;
    const desc = p.seo?.metaDescription || p.excerpt || "";
    const cover = p.coverImage?.url ? img(p.coverImage.url, 1200) : "";
    document.title = `${title} | Syed Mohsin Raza`;
    meta("name", "description", desc);
    meta("property", "og:title", title); meta("property", "og:description", desc);
    meta("property", "og:type", "article"); meta("property", "og:url", url);
    if (cover) meta("property", "og:image", cover);
    meta("name", "twitter:card", cover ? "summary_large_image" : "summary");
    const link = document.createElement("link"); link.rel = "canonical"; link.href = url; document.head.appendChild(link);
    const ld = document.createElement("script"); ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, description: desc,
      image: cover || undefined, datePublished: toDate(p.publishedAt)?.toISOString(),
      dateModified: toDate(p.updatedAt)?.toISOString(), mainEntityOfPage: url,
      author: { "@type": "Person", name: "Syed Mohsin Raza" }
    });
    document.head.appendChild(ld);
    const enc = encodeURIComponent(url), t = encodeURIComponent(p.title);
    el.innerHTML = `
      <a class="back" href="/blog">&larr; Blog</a>
      <h1>${esc(p.title)}</h1>
      <div class="meta">${esc(fmtDate(p.publishedAt))}${p.readingTime ? " · " + p.readingTime + " min read" : ""}${(p.tags || []).length ? " · " + p.tags.map(esc).join(", ") : ""}</div>
      ${cover ? `<img class="article-cover" src="${esc(cover)}" alt="${esc(p.coverImage.alt || "")}">` : ""}
      <div class="prose">${window.sanitizeHtml(p.contentHtml || "")}</div>
      <div class="share">
        <a target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${t}&url=${enc}">X</a>
        <a target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${enc}">LinkedIn</a>
        <a target="_blank" rel="noopener" href="https://wa.me/?text=${t}%20${enc}">WhatsApp</a>
        <button id="copy">Copy link</button>
      </div>`;
    document.getElementById("copy").onclick = async (e) => {
      await navigator.clipboard.writeText(url); e.target.textContent = "Copied!";
      setTimeout(() => (e.target.textContent = "Copy link"), 1500);
    };
  }
} catch (e) { console.error(e); el.innerHTML = '<p class="empty">Could not load this post.</p>'; }
