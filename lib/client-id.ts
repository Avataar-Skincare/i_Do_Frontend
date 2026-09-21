const KEY = "ido_client_id";

/**
 * A stable anonymous id, generated once per browser and persisted in localStorage.
 * Stands in for a real user id until auth exists — see the consults entity's own
 * comment on the backend for why this matters (it's what "one active booking per
 * type" is scoped to). Swap for a real userId once accounts exist; don't add one
 * alongside this without migrating existing rows.
 */
export function getClientId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}
