import { listPublished, esc, fmtDate, img } from "./blog-data.js";
const listEl = document.getElementById("list"), tagsEl = document.getElementById("tags"),
  qEl = document.getElementById("q"), moreEl = document.getElementById("more");
const PAGE = 9; let posts = [], shown = PAGE, tag = "", term = "";

function filtered() {
  return posts.filter((p) =>
    (!tag || (p.tags || []).includes(tag)) &&
    (!term || (p.title + " " + (p.excerpt || "") + " " + (p.tags || []).join(" ")).toLowerCase().includes(term)));
}
function render() {
  const all = filtered(), items = all.slice(0, shown);
  if (!all.length) { listEl.innerHTML = '<p class="empty">No posts yet.</p>'; moreEl.hidden = true; return; }
  listEl.innerHTML = items.map((p) => `
    <a class="post-row" href="/blog/${encodeURIComponent(p.slug)}">
      ${p.coverImage?.url ? `<img class="thumb" src="${esc(img(p.coverImage.url, 300))}" alt="${esc(p.coverImage.alt || "")}" loading="lazy">` : '<div class="thumb"></div>'}
      <div><div class="meta">${esc(fmtDate(p.publishedAt))}${p.readingTime ? " · " + p.readingTime + " min read" : ""}</div>
      <h2>${esc(p.title)}</h2><p class="ex">${esc(p.excerpt || "")}</p></div>
    </a>`).join("");
  moreEl.hidden = all.length <= shown;
}
function renderTags() {
  const set = [...new Set(posts.flatMap((p) => p.tags || []))].sort();
  tagsEl.innerHTML = set.map((t) => `<button class="tag${t === tag ? " active" : ""}" data-t="${esc(t)}">${esc(t)}</button>`).join("");
}
tagsEl.addEventListener("click", (e) => {
  const b = e.target.closest("[data-t]"); if (!b) return;
  tag = tag === b.dataset.t ? "" : b.dataset.t; shown = PAGE; renderTags(); render();
});
qEl.addEventListener("input", () => { term = qEl.value.toLowerCase().trim(); shown = PAGE; render(); });
moreEl.addEventListener("click", () => { shown += PAGE; render(); });
try { posts = await listPublished(); renderTags(); render(); }
catch (e) { console.error(e); listEl.innerHTML = '<p class="empty">Could not load posts.</p>'; }
