"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="site-navbar">

      {/* LOGO */}
      <div className="logo">
        <Link href="/" onClick={closeMenu}>
          <img
            src="/images/papeg-logo.png"
            alt="Papeg Tour & Travel"
          />
        </Link>
      </div>

      {/* MENU */}
      <div className={`navbar-menu ${menuOpen ? "menu-open" : ""}`}>

        <Link href="/destinations" onClick={closeMenu}>
          Destinations
        </Link>

        <Link href="/tours" onClick={closeMenu}>
          Tour Packages
        </Link>

        <Link href="/#about" onClick={closeMenu}>
          About
        </Link>

        <Link href="/#contact" onClick={closeMenu}>
          Contact
        </Link>

      </div>

      {/* BOOKING */}
      <Link
        href="/request-quote?package=Customized%20Tour"
        className="booking-primary navbar-booking"
        onClick={closeMenu}
      >
        Book Your Journey →
      </Link>

      {/* MOBILE MENU */}
      <button
        type="button"
        className="mobile-menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

    </nav>
  );
}