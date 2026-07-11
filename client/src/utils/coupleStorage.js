/* ─────────────────────────────────────────────────────────────────────────
   Per-couple localStorage scoping.

   A few pieces of state (hero photos, couple photos, special date, saved
   quotes, favourite memories) live only in the browser's localStorage.
   They used to be stored under plain global keys such as "memento_hero_images",
   which meant that on a shared browser one couple's private photos and quotes
   would show up in the NEXT couple's account after logout / login — a real
   privacy leak.

   Every couple-private key is now namespaced by the relationship id (falling
   back to the user id, then "anon"). Couple A reads/writes
   "memento_hero_images::r_<relA>" while couple B uses "…::r_<relB>", so their
   data is fully isolated yet still persists for the same couple across
   logout / login.
   ───────────────────────────────────────────────────────────────────────── */

// Old, un-scoped keys — removed on startup so their stale data can't leak.
const LEGACY_KEYS = [
  'memento_hero_images',
  'memento_couple_photos',
  'memento_special_date',
  'memento_couple_quotes',
  'memento_couple_quote',
  'memento_fav_memories',
  'memento_unread_msgs',
];

export function coupleScope() {
  const rel = localStorage.getItem('memento_relationship_id');
  if (rel && rel !== 'null' && rel !== 'undefined') return `r_${rel}`;
  try {
    const u = JSON.parse(localStorage.getItem('memento_user') || 'null');
    if (u && (u.id || u.email)) return `u_${u.id || u.email}`;
  } catch {
    /* ignore malformed user */
  }
  return 'anon';
}

export function coupleKey(base) {
  return `${base}::${coupleScope()}`;
}

export function getCoupleItem(base) {
  return localStorage.getItem(coupleKey(base));
}

export function setCoupleItem(base, value) {
  localStorage.setItem(coupleKey(base), value);
}

export function removeCoupleItem(base) {
  localStorage.removeItem(coupleKey(base));
}

// Delete the legacy global keys. Safe to call repeatedly.
export function purgeLegacyCoupleKeys() {
  LEGACY_KEYS.forEach((k) => {
    if (localStorage.getItem(k) !== null) localStorage.removeItem(k);
  });
}
