import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-main">

        <div className="footer-brand">

          <Link href="/">
            <img
              src="/images/papeg-logo.png"
              alt="Papeg Tour & Travel"
            />
          </Link>

          <p>
            Discover the heart of Papua Highlands through
            authentic journeys, local culture, and unforgettable
            experiences.
          </p>

          <span>
            Wamena • Papua Highlands • Indonesia
          </span>

        </div>


        <div className="footer-column">

          <h4>Explore</h4>

          <Link href="/destinations">
            Destinations
          </Link>

          <Link href="/tours">
            Tour Packages
          </Link>

          <Link href="/#about">
            About Papeg
          </Link>

          <Link href="/#contact">
            Contact
          </Link>

        </div>


        <div className="footer-column">

          <h4>Experiences</h4>

          <Link href="/tours/baliem-nature-culture">
            Nature & Culture
          </Link>

          <Link href="/tours/ultimate-wamena">
            Adventure
          </Link>

          <Link href="/tours/customized-tour">
            Photography
          </Link>

          <Link href="/tours/customized-tour">
            Customized Tours
          </Link>

        </div>


        <div className="footer-column">

          <h4>Contact</h4>

          <p>Wamena, Papua Highlands</p>

          <p>Indonesia</p>

          <a href="mailto:papegtourtravel@gmail.com">
            papegtourtravel@gmail.com
          </a>

        </div>

      </div>


      <div className="footer-bottom">

        <p>
          © 2026 Papeg Tour & Travel. All rights reserved.
        </p>

        <p>
          Explore Papua. Experience the extraordinary.
        </p>

      </div>

    </footer>
  );
}