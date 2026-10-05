
"use client";

import Link from "next/link";
import { useCurrency } from "./CurrencyProvider";

export default function Header() {
  const { currency, setCurrency } = useCurrency();

  return (
    <header className="site-header">
      <div className="header-container">

        {/* LOGO */}
        <Link href="/" className="logo">
          <img
            src="/images/papeg-logo.png"
            alt="Papeg Tour & Travel"
          />
        </Link>

        {/* NAVIGATION */}
        <nav className="main-nav">
          <Link href="/destinations" className="nav-link">
            Destinations
          </Link>

          <Link href="/tours" className="nav-link">
            Tour Packages
          </Link>

          <Link href="/about" className="nav-link">
            About
          </Link>

          <Link href="/contact" className="nav-link">
            Contact
          </Link>

          {/* CURRENCY */}
          <select
            value={currency}
            onChange={(event) =>
              setCurrency(
                event.target.value as "IDR" | "USD" | "EUR"
              )
            }
            className="currency-selector"
            aria-label="Select currency"
          >
            <option value="IDR">IDR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>

          {/* BOOK FLIGHT */}
          <Link href="/flight" className="flight-btn">
            Book Flight
          </Link>
        </nav>

      </div>
    </header>
  );
}