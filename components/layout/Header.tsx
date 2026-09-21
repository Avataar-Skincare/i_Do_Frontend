"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { NAV, SITE } from "@/lib/content/site";
import { useCart } from "@/lib/cart-context";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={[
          "sticky top-0 z-[60] backdrop-blur-md transition-colors duration-300",
          scrolled ? "bg-bg/94 border-b border-line shadow-[0_6px_24px_-20px_rgb(80_60_30_/_0.5)]" : "bg-bg/86 border-b border-transparent",
        ].join(" ")}
      >
        <div className="max-w-content mx-auto px-6 flex items-center gap-5 h-[72px]">
          <Link href="/" className="flex items-center shrink-0" aria-label={`${SITE.brand} by ${SITE.parent} — home`}>
            <Logo height={38} />
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-2">
            {NAV.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-ink-2 px-3 py-2 rounded-pill hover:text-ink hover:bg-bg-3 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <Link
              href="/account"
              aria-label="Account"
              className="w-[42px] h-[42px] rounded-full inline-flex items-center justify-center text-ink hover:bg-bg-3 hover:text-gold-deep transition-colors"
            >
              <Icon name="user" size={21} />
            </Link>
            <Link
              href="/cart"
              aria-label="Bag"
              className="relative w-[42px] h-[42px] rounded-full inline-flex items-center justify-center text-ink hover:bg-bg-3 hover:text-gold-deep transition-colors"
            >
              <Icon name="cart" size={21} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-white text-[0.66rem] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              href="/shop"
              className="hidden md:inline-flex ml-1 bg-gold text-white text-sm font-semibold py-[0.62em] px-[1.05em] rounded-pill shadow-[0_10px_24px_-10px_rgb(166_132_60_/_0.75)] hover:bg-gold-deep transition-colors"
            >
              Shop {SITE.brand}
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Menu"
              className="md:hidden w-[42px] h-[42px] rounded-full inline-flex items-center justify-center text-ink hover:bg-bg-3 hover:text-gold-deep transition-colors"
            >
              <Icon name="menu" size={21} />
            </button>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      <div
        className={[
          "fixed inset-0 bg-[rgba(30,22,12,0.44)] backdrop-blur-[2px] z-[70] transition-opacity",
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible",
        ].join(" ")}
        onClick={() => setMenuOpen(false)}
      />
      <aside
        className={[
          "fixed top-0 right-0 h-full w-[min(86vw,360px)] bg-bg-2 z-[80] shadow-lg flex flex-col overflow-y-auto transition-transform duration-300",
          menuOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-5 py-4.5 border-b border-line">
          <Logo height={34} />
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close"
            className="w-[42px] h-[42px] rounded-full inline-flex items-center justify-center text-ink hover:bg-surface"
          >
            <Icon name="close" size={21} />
          </button>
        </div>
        <nav className="flex flex-col p-3 gap-0.5">
          {NAV.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="px-3.5 py-3.5 text-[1.05rem] font-medium rounded-lg text-ink hover:bg-surface hover:text-gold-deep"
            >
              {label}
            </Link>
          ))}
          <Link href="/cart" onClick={() => setMenuOpen(false)} className="px-3.5 py-3.5 text-[1.05rem] font-medium rounded-lg text-ink hover:bg-surface hover:text-gold-deep">
            Bag
          </Link>
          <Link href="/account" onClick={() => setMenuOpen(false)} className="px-3.5 py-3.5 text-[1.05rem] font-medium rounded-lg text-ink hover:bg-surface hover:text-gold-deep">
            Account
          </Link>
        </nav>
        <div className="mt-auto px-5 pt-4.5 pb-6.5 border-t border-line flex flex-col gap-3">
          <Link
            href="/shop"
            onClick={() => setMenuOpen(false)}
            className="w-full text-center bg-gold text-white font-semibold py-3.5 rounded-pill"
          >
            Shop {SITE.brand}
          </Link>
          <span className="text-sm text-muted flex items-center gap-2">
            <Icon name="phone" size={14} className="shrink-0" /> {SITE.phone}
          </span>
          <a className="text-sm text-gold-deep" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
        </div>
      </aside>
    </>
  );
}
