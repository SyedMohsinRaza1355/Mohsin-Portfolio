import { requireAdmin, auth, signOut } from "./guard.js";
import { db, collection, doc, getDocs, writeBatch, updateDoc, serverTimestamp, esc, fmtDate, img, toDate } from "../blog-data.js";
import { toast } from "./common.js";

await requireAdmin();
const $ = (id) => document.getElementById(id);
let posts = [];

async function load() {
  const snap = await getDocs(collection(db, "posts"));
  posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (toDate(b.updatedAt)?.getTime() || 0) - (toDate(a.updatedAt)?.getTime() || 0));
  render();
}
function render() {
  $("n-all").textContent = posts.length;
  $("n-pub").textContent = posts.filter((p) => p.status === "published").length;
  $("n-dr").textContent = posts.filter((p) => p.status !== "published").length;
  const q = $("q").value.toLowerCase().trim(), st = $("st").value;
  const items = posts.filter((p) => (!st || p.status === st) &&
    (!q || (p.title + " " + (p.tags || []).join(" ")).toLowerCase().includes(q)));
  $("list").innerHTML = items.length ? items.map((p) => `
    <div class="row">
      ${p.coverImage?.url ? `<img class="th" src="${esc(img(p.coverImage.url, 160))}" alt="">` : '<div class="th"></div>'}
      <div class="info"><b>${esc(p.title || "(untitled)")}<span class="badge ${p.status}">${p.status}</span></b>
        <small>${esc((p.tags || []).join(", "))} ${p.tags?.length ? "· " : ""}${esc(fmtDate(p.publishedAt || p.updatedAt))}</small></div>
      <div class="acts">
        <a class="btn" href="/admin/editor?id=${p.id}">Edit</a>
        ${p.status === "published" ? `<a class="btn" target="_blank" href="/blog/${encodeURIComponent(p.slug)}">View</a>` : ""}
        <button class="btn" data-a="toggle" data-id="${p.id}">${p.status === "published" ? "Unpublish" : "Publish"}</button>
        <button class="btn danger" data-a="del" data-id="${p.id}">Delete</button>
      </div>
    </div>`).join("") : '<p style="color:var(--text-muted)">No posts yet. Click "New post" to write your first one.</p>';
}
$("list").addEventListener("click", async (e) => {
  const b = e.target.closest("[data-a]"); if (!b) return;
  const p = posts.find((x) => x.id === b.dataset.id); if (!p) return;
  try {
    if (b.dataset.a === "toggle") {
      const pub = p.status !== "published";
      if (pub && !p.slug) return toast("Open the post and set a title first.", true);
      const upd = { status: pub ? "published" : "draft", updatedAt: serverTimestamp() };
      if (pub && !p.publishedAt) upd.publishedAt = serverTimestamp();
      await updateDoc(doc(db, "posts", p.id), upd);
      toast(pub ? "Published" : "Unpublished");
    } else if (confirm(`Delete "${p.title}"? This cannot be undone.\n(Images stay in Cloudinary.)`)) {
      const batch = writeBatch(db);
      batch.delete(doc(db, "posts", p.id));
      if (p.slug) batch.delete(doc(db, "slugs", p.slug));
      await batch.commit();
      toast("Deleted");
    } else return;
    await load();
  } catch (err) { console.error(err); toast("Action failed: " + err.message, true); }
});
$("q").addEventListener("input", render);
$("st").addEventListener("change", render);
$("out").onclick = async () => { await signOut(auth); location.replace("/admin/login"); };
try { await load(); } catch (e) { console.error(e); toast("Could not load posts: " + e.message, true); }
