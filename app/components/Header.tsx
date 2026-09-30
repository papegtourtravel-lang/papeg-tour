import Link from "next/link";

export default function Header() {
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

          {/* BOOK FLIGHT */}
          <Link href="/flight" className="flight-btn">
            ✈ Book Flight
          </Link>
        </nav>

      </div>
    </header>
  );
}