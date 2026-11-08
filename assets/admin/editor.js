import { requireAdmin } from "./guard.js";
import { db, collection, doc, getDoc, writeBatch, serverTimestamp, Timestamp, slugify, esc, img, toDate } from "../blog-data.js";
import { uploadImage, parseYouTube, toast } from "./common.js";

await requireAdmin();
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
let postId = params.get("id");
let existing = null;            // loaded post
let cover = null;               // { url, alt }
let dirty = false;
let saving = false;
let slugTouched = false;

// ---------- editor ----------
const editor = window.createBlogEditor($("editor"), {
  onUpdate: () => { dirty = true; counts(); },
});
function counts() {
  const words = editor.storage.characterCount.words();
  $("counts").textContent = `${words} words · ${readingTime()} min read`;
}
function readingTime() { return Math.max(1, Math.round(editor.storage.characterCount.words() / 200)); }

const cmds = {
  bold: () => editor.chain().focus().toggleBold().run(),
  italic: () => editor.chain().focus().toggleItalic().run(),
  underline: () => editor.chain().focus().toggleUnderline().run(),
  strike: () => editor.chain().focus().toggleStrike().run(),
  code: () => editor.chain().focus().toggleCode().run(),
  highlight: () => editor.chain().focus().toggleHighlight().run(),
  link: () => {
    const prev = editor.getAttributes("link").href || "https://";
    const url = prompt("Link URL (https://...)", prev);
    if (url === null) return;
    if (url === "") return editor.chain().focus().unsetLink().run();
    if (!/^https?:\/\//i.test(url)) return toast("Links must start with http:// or https://", true);
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  },
  bullet: () => editor.chain().focus().toggleBulletList().run(),
  ordered: () => editor.chain().focus().toggleOrderedList().run(),
  task: () => editor.chain().focus().toggleTaskList().run(),
  quote: () => editor.chain().focus().toggleBlockquote().run(),
  codeblock: () => editor.chain().focus().toggleCodeBlock().run(),
  hr: () => editor.chain().focus().setHorizontalRule().run(),
  left: () => editor.chain().focus().setTextAlign("left").run(),
  center: () => editor.chain().focus().setTextAlign("center").run(),
  right: () => editor.chain().focus().setTextAlign("right").run(),
  table: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  addrow: () => editor.chain().focus().addRowAfter().run(),
  delrow: () => editor.chain().focus().deleteRow().run(),
  addcol: () => editor.chain().focus().addColumnAfter().run(),
  delcol: () => editor.chain().focus().deleteColumn().run(),
  deltable: () => editor.chain().focus().deleteTable().run(),
  image: () => $("img-file").click(),
  youtube: () => {
    const url = prompt("Paste a YouTube link");
    if (!url) return;
    const id = parseYouTube(url);
    if (!id) return toast("That is not a valid YouTube link.", true);
    editor.chain().focus().setYoutubeVideo({ src: `https://www.youtube.com/watch?v=${id}` }).run();
  },
  undo: () => editor.chain().focus().undo().run(),
  redo: () => editor.chain().focus().redo().run(),
};
$("tb").addEventListener("click", (e) => {
  const b = e.target.closest("[data-c]"); if (b && cmds[b.dataset.c]) cmds[b.dataset.c]();
});
$("blk").addEventListener("change", (e) => {
  const v = e.target.value, c = editor.chain().focus();
  v === "p" ? c.setParagraph().run() : c.toggleHeading({ level: +v }).run();
});
$("color").addEventListener("input", (e) => editor.chain().focus().setColor(e.target.value).run());

async function insertImage(file) {
  if (!file) return;
  try {
    toast("Uploading image...");
    const url = await uploadImage(file);
    const alt = prompt("Alt text for this image (describe it):", "") || "";
    editor.chain().focus().setImage({ src: url, alt }).run();
    toast("Image added");
  } catch (e) { toast(e.message, true); }
}
$("img-file").addEventListener("change", (e) => { insertImage(e.target.files[0]); e.target.value = ""; });
$("editor").addEventListener("paste", (e) => {
  const f = [...(e.clipboardData?.files || [])].find((x) => x.type.startsWith("image/"));
  if (f) { e.preventDefault(); insertImage(f); }
});
$("editor").addEventListener("drop", (e) => {
  const f = [...(e.dataTransfer?.files || [])].find((x) => x.type.startsWith("image/"));
  if (f) { e.preventDefault(); insertImage(f); }
});

// ---------- cover ----------
function renderCover() {
  const box = $("cover");
  const keep = $("cprog");
  box.innerHTML = cover?.url
    ? `<img src="${esc(img(cover.url, 800))}" alt=""><div class="hint">Click or drop to replace</div>`
    : '<span>Click or drop a cover photo (max 8 MB)</span>';
  box.appendChild(keep);
  $("cover-alt").hidden = !cover?.url;
  $("cover-alt").value = cover?.alt || "";
}
async function setCover(file) {
  if (!file) return;
  const prog = $("cprog"); prog.style.display = "block";
  try {
    const url = await uploadImage(file, (p) => (prog.firstElementChild.style.width = p + "%"));
    cover = { url, alt: cover?.alt || "" }; dirty = true; renderCover();
  } catch (e) { toast(e.message, true); }
  prog.style.display = "none"; prog.firstElementChild.style.width = "0";
}
$("cover").addEventListener("click", () => $("cover-file").click());
$("cover-file").addEventListener("change", (e) => { setCover(e.target.files[0]); e.target.value = ""; });
["dragover", "dragenter"].forEach((n) => $("cover").addEventListener(n, (e) => { e.preventDefault(); $("cover").classList.add("drag"); }));
["dragleave", "drop"].forEach((n) => $("cover").addEventListener(n, (e) => { e.preventDefault(); $("cover").classList.remove("drag"); }));
$("cover").addEventListener("drop", (e) => setCover(e.dataTransfer.files[0]));
$("cover-alt").addEventListener("input", (e) => { if (cover) cover.alt = e.target.value; dirty = true; });

// ---------- fields ----------
$("title").addEventListener("input", () => {
  dirty = true;
  if (!slugTouched) $("slug").value = slugify($("title").value);
});
$("slug").addEventListener("input", () => { slugTouched = true; dirty = true; });
["excerpt", "tags", "pdate", "mt", "md"].forEach((id) => $(id).addEventListener("input", () => (dirty = true)));

function tsToLocalInput(ts) {
  const d = toDate(ts); if (!d) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ---------- load ----------
async function load() {
  if (!postId) { renderCover(); counts(); return; }
  const s = await getDoc(doc(db, "posts", postId));
  if (!s.exists()) { toast("Post not found", true); postId = null; return; }
  existing = s.data();
  $("title").value = existing.title || "";
  $("slug").value = existing.slug || ""; slugTouched = true;
  $("excerpt").value = existing.excerpt || "";
  $("tags").value = (existing.tags || []).join(", ");
  $("pdate").value = tsToLocalInput(existing.publishedAt);
  $("mt").value = existing.seo?.metaTitle || "";
  $("md").value = existing.seo?.metaDescription || "";
  cover = existing.coverImage || null;
  if (existing.contentJson) editor.commands.setContent(existing.contentJson);
  else if (existing.contentHtml) editor.commands.setContent(existing.contentHtml);
  renderCover(); counts(); dirty = false; updateState();
}
function updateState() {
  const pub = existing?.status === "published";
  $("state").textContent = !postId ? "New post" : pub ? "Published" : "Draft";
  $("pub").textContent = pub ? "Update" : "Publish";
  $("unpub").hidden = !pub;
}

// ---------- save ----------
function collect() {
  const title = $("title").value.trim();
  const slug = slugify($("slug").value) || slugify(title);
  const tags = $("tags").value.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  return {
    title, slug,
    excerpt: $("excerpt").value.trim(),
    tags: [...new Set(tags)],
    coverImage: cover?.url ? { url: cover.url, alt: cover.alt || "" } : null,
    contentJson: JSON.parse(JSON.stringify(editor.getJSON())),
    contentHtml: window.sanitizeHtml(editor.getHTML()),
    readingTime: readingTime(),
    seo: { metaTitle: $("mt").value.trim(), metaDescription: $("md").value.trim() },
  };
}

async function save(status, { silent = false } = {}) {
  if (saving) return false;
  const data = collect();
  if (!data.title) { if (!silent) toast("Add a title first.", true); return false; }
  if (!data.slug) { if (!silent) toast("Add a URL slug.", true); return false; }
  if (status === "published" && data.coverImage && !data.coverImage.alt) {
    toast("Add alt text for the cover photo before publishing.", true); return false;
  }
  saving = true;
  try {
    const oldSlug = existing?.slug;
    if (data.slug !== oldSlug) {
      const taken = await getDoc(doc(db, "slugs", data.slug));
      if (taken.exists() && taken.data().postId !== postId) {
        if (!silent) toast(`The slug "${data.slug}" is already used by another post.`, true);
        return false;
      }
    }
    const ref = postId ? doc(db, "posts", postId) : doc(collection(db, "posts"));
    const id = ref.id;
    const batch = writeBatch(db);
    const out = { ...data, status, updatedAt: serverTimestamp() };
    const pdate = $("pdate").value ? Timestamp.fromDate(new Date($("pdate").value)) : null;
    if (pdate) out.publishedAt = pdate;
    else if (status === "published" && !existing?.publishedAt) out.publishedAt = serverTimestamp();
    if (!existing) out.createdAt = serverTimestamp();
    batch.set(ref, out, { merge: true });
    batch.set(doc(db, "slugs", data.slug), { postId: id });
    if (oldSlug && oldSlug !== data.slug) batch.delete(doc(db, "slugs", oldSlug));
    await batch.commit();
    postId = id;
    const fresh = await getDoc(ref); existing = fresh.data();
    $("pdate").value = tsToLocalInput(existing.publishedAt);
    history.replaceState(null, "", `/admin/editor?id=${id}`);
    dirty = false; updateState();
    if (!silent) toast(status === "published" ? "Published" : "Draft saved");
    return true;
  } catch (e) { console.error(e); if (!silent) toast("Save failed: " + e.message, true); return false; }
  finally { saving = false; }
}

$("draft").onclick = () => save(existing?.status === "published" ? "published" : "draft");
$("pub").onclick = () => save("published");
$("unpub").onclick = () => save("draft");
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); $("draft").click(); }
});
// autosave drafts only; published posts never change silently
setInterval(() => {
  if (dirty && !saving && existing?.status !== "published" && $("title").value.trim()) save("draft", { silent: true });
}, 20000);
window.addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

// ---------- preview ----------
$("preview").onclick = () => {
  const d = collect();
  $("pv").innerHTML = `<h1>${esc(d.title)}</h1>
    ${d.coverImage ? `<img class="article-cover" src="${esc(img(d.coverImage.url, 1200))}" alt="${esc(d.coverImage.alt)}">` : ""}
    <div class="prose">${d.contentHtml}</div>`;
  $("modal").classList.add("open");
};
$("close").onclick = () => $("modal").classList.remove("open");

try { await load(); } catch (e) { console.error(e); toast("Could not load post: " + e.message, true); }
