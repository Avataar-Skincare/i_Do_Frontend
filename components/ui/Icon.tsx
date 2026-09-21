/**
 * Icon paths ported verbatim from reference/i_do_website.html's `I` object.
 * Static, developer-authored SVG fragments — safe to inject directly.
 */
const PATHS: Record<string, string> = {
  cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="19" cy="20" r="1.4"/><path d="M1 2h3l2.4 12.2a2 2 0 0 0 2 1.6h9a2 2 0 0 0 2-1.6L22 6H6"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
  close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  star: '<path fill="currentColor" stroke="none" d="M12 2l2.9 6.26 6.86.72-5.14 4.6 1.48 6.72L12 17.77 5.9 20.3l1.48-6.72L2.24 8.98l6.86-.72z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  battery: '<rect x="2" y="8" width="16" height="8" rx="2"/><rect x="4" y="10" width="8" height="4" rx="1" fill="currentColor" stroke="none"/><line x1="21" y1="11" x2="21" y2="13"/>',
  drop: '<path d="M12 2.8S5.6 9.4 5.6 14a6.4 6.4 0 0 0 12.8 0C18.4 9.4 12 2.8 12 2.8z"/>',
  spark: '<path d="M12 2l1.7 5.5L19 9l-5.3 1.5L12 16l-1.7-5.5L5 9l5.3-1.5z"/><path d="M18.5 14.5l.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8z"/>',
  gem: '<path d="M6 3h12l3 5.5-9 12.5L3 8.5z"/><path d="M3 8.5h18M9 3l3 18M15 3l-3 18"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8"/>',
  strand: '<path d="M7 21c0-7 0-11 5-15M12 21c0-7 0-11 5-15M17 21c0-4 .2-8 2-11"/>',
  glass: '<path d="M6.5 2h11M6.5 22h11M7 2c0 5 5 6 5 10 0-4 5-5 5-10M7 22c0-5 5-6 5-10 0 4 5 5 5 10"/>',
  moon: '<path d="M21 12.7A9 9 0 1 1 11.3 3a7 7 0 0 0 9.7 9.7z"/>',
  chat: '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-3.6A8.4 8.4 0 1 1 21 11.5z"/>',
  list: '<line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><path d="M3.5 5.6l1 1 1.6-2M3.5 11.6l1 1 1.6-2M3.5 17.6l1 1 1.6-2"/>',
  plate: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.6"/>',
  people: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="3.4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M15.5 3.2a4 4 0 0 1 0 7.6"/>',
  truck: '<rect x="1" y="5" width="13" height="11" rx="1.5"/><path d="M14 8h4.5L22 11.5V16h-8z"/><circle cx="6" cy="19" r="1.6"/><circle cx="18" cy="19" r="1.6"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  mail: '<rect x="2" y="4.5" width="20" height="15" rx="2"/><path d="M2.5 6.5l9.5 6.5 9.5-6.5"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.13 1 .35 1.98.67 2.9a2 2 0 0 1-.45 2.1L8 10a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.45c.92.32 1.9.54 2.9.67A2 2 0 0 1 22 16.9z"/>',
  wa: '<path fill="currentColor" stroke="none" d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.02zm-7 15.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23a8.2 8.2 0 0 1 8.23 8.24c0 4.54-3.69 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.48-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42-.14-.01-.31-.01-.48-.01-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/>',
  chevron: '<polyline points="9 6 15 12 9 18"/>',
  arrow: '<line x1="4" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/>',
  info: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="7.8" r="0.7" fill="currentColor" stroke="none"/>',
  heart: '<path d="M20.8 5.7a5 5 0 0 0-7.1 0L12 7.4l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21l8.8-8.2a5 5 0 0 0 0-7.1z"/>',
  cal: '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><line x1="3" y1="9.5" x2="21" y2="9.5"/><line x1="8" y1="2.5" x2="8" y2="6.5"/><line x1="16" y1="2.5" x2="16" y2="6.5"/>',
  pin: '<path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  ig: '<rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none"/>',
  box: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><line x1="12" y1="13" x2="12" y2="21"/>',
  clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 13.5"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 21.5 12 18.5 17 21.5 15.5 14"/>',
  doc: '<path d="M14 2.5H7a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5z"/><path d="M14 2.5v5h5"/>',
  face: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14a4 4 0 0 0 7 0"/><circle cx="9" cy="10" r="0.7" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="0.7" fill="currentColor" stroke="none"/>',
  search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 3 21 9 15 9"/>',
  home: '<path d="M3 11.2 12 4l9 7.2"/><path d="M5.5 9.7V20h13V9.7"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 4v2.2M12 17.8V20M20 12h-2.2M6.2 12H4M17.5 6.5l-1.4 1.4M7.9 16.1l-1.4 1.4M17.5 17.5l-1.4-1.4M7.9 7.9 6.5 6.5"/>',
};

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 20,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: d }}
    />
  );
}
