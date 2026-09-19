'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileNav({ items, cta }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="nav-mobile-btn"
        aria-expanded={open}
        aria-controls="nav-mobile"
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">{open ? '✕' : '☰'}</span>
        <span className="sr-only">Menu</span>
      </button>
      <nav id="nav-mobile" className={`main-nav ${open ? 'open' : ''}`} aria-label="Navigation principale">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="nav-link" onClick={() => setOpen(false)}>
            {item.label}
          </Link>
        ))}
        {cta ? (
          <div className="nav-cta">
            <Link href={cta.href} className="btn btn-primary" onClick={() => setOpen(false)}>
              {cta.label}
            </Link>
          </div>
        ) : null}
      </nav>
    </>
  );
}