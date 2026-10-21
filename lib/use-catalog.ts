"use client";

import { useEffect, useState } from "react";
import { getCatalog, type Catalog } from "@/lib/catalog";

// One request shared by every component that needs the catalog; a failed request is retried on the next mount.
let pending: Promise<Catalog | null> | null = null;

function load(): Promise<Catalog | null> {
  if (!pending) {
    pending = getCatalog().catch(() => {
      pending = null;
      return null;
    });
  }
  return pending;
}

/**
 * GET /catalog: the price, COD fee and per-finish size availability, all from server settings.
 * `null` until it arrives (and if the API can't be reached), so callers fall back to the static
 * values in lib/content/site.ts and the page still renders.
 */
export function useCatalog(): Catalog | null {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  useEffect(() => {
    let live = true;
    load().then((c) => {
      if (live) setCatalog(c);
    });
    return () => {
      live = false;
    };
  }, []);
  return catalog;
}
