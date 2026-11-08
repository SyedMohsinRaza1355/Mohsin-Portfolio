import { CLOUDINARY_CLOUD } from "../blog-data.js";
import { CLOUDINARY_PRESET } from "../cloudinary-config.js";

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export function uploadImage(file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!TYPES.includes(file.type)) return reject(new Error("Use a JPG, PNG, WebP, GIF or AVIF image."));
    if (file.size > MAX_BYTES) return reject(new Error("Image is larger than 8 MB."));
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_PRESET);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      try {
        const r = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && r.secure_url) resolve(r.secure_url);
        else reject(new Error(r.error?.message || "Upload failed."));
      } catch { reject(new Error("Upload failed.")); }
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(fd);
  });
}

// Accepts watch, youtu.be, shorts, embed and live links. Returns the video id or null.
export function parseYouTube(input) {
  try {
    const u = new URL(input.trim());
    const host = u.hostname.replace(/^www\.|^m\./, "");
    let id = null;
    if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0];
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else {
        const m = u.pathname.match(/^\/(shorts|embed|live)\/([\w-]+)/);
        if (m) id = m[2];
      }
    }
    return id && /^[\w-]{6,20}$/.test(id) ? id : null;
  } catch { return null; }
}

export function toast(msg, isError) {
  let t = document.getElementById("toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
  t.textContent = msg; t.className = "show" + (isError ? " err" : "");
  clearTimeout(toast._t); toast._t = setTimeout(() => (t.className = ""), 3200);
}
