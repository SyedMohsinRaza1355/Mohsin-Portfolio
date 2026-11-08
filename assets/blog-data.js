import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, query, where,
  writeBatch, serverTimestamp, Timestamp, deleteDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
import { CLOUDINARY_CLOUD } from "./cloudinary-config.js";

export const SITE = "https://mohsin-portfolio1.vercel.app";
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { collection, doc, getDoc, getDocs, query, where, writeBatch, serverTimestamp, Timestamp, deleteDoc, updateDoc };

export function slugify(s) {
  return (s || "").toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}
export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
export function toDate(ts) {
  if (!ts) return null;
  return ts.toDate ? ts.toDate() : new Date(ts);
}
export function fmtDate(ts) {
  const d = toDate(ts);
  return d ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
}
// Cloudinary delivery URL with auto format/quality and width limit
export function img(url, w = 1200) {
  if (!url) return "";
  const m = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/);
  if (!m) return url;
  return `${m[1]}f_auto,q_auto,w_${w},c_limit/${m[2].replace(/^(?:[a-z]_[^/]*\/)+/, "")}`;
}
export async function listPublished() {
  const snap = await getDocs(query(collection(db, "posts"), where("status", "==", "published")));
  const now = Date.now();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => !toDate(p.publishedAt) || toDate(p.publishedAt).getTime() <= now)
    .sort((a, b) => (toDate(b.publishedAt)?.getTime() || 0) - (toDate(a.publishedAt)?.getTime() || 0));
}
export async function getPublishedBySlug(slug) {
  const snap = await getDocs(query(collection(db, "posts"), where("status", "==", "published"), where("slug", "==", slug)));
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}
export { CLOUDINARY_CLOUD };
