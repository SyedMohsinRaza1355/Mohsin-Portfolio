import { app } from "../blog-data.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// UIDs allowed into the admin. Must match the list in the Firestore rules.
export const ADMIN_UIDS = ["e3R9jL9b1iYLDp8VvPLhHUUFLqx1"];
export const auth = getAuth(app);
export { signOut };

export function requireAdmin() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user && ADMIN_UIDS.includes(user.uid)) return resolve(user);
      if (user) await signOut(auth);
      location.replace("/admin/login");
    });
  });
}
