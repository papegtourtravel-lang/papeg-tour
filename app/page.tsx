import Link from "next/link";

export const metadata = {
  title: "Papeg Tour & Travel | Discover Papua Highlands",
  description:
    "Explore Wamena, Baliem Valley, and the Papua Highlands through authentic nature, culture, adventure, and tailor-made journeys.",
};

export default function Home() {
  return (
    <main>
      {/* =========================================
          HERO
          ========================================= */}
      <section className="hero">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <p className="hero-label">WAMENA • PAPUA HIGHLANDS</p>

          <h1>
            Discover the
            <br />
            <span>Heart of Papua</span>
          </h1>

          <p className="hero-description">
            Explore breathtaking landscapes, living cultures,
            and unforgettable adventures in the heart of
            Papua Highlands.
          </p>

          <div className="hero-buttons">
            <Link href="/tours" className="booking-primary">
              Explore Our Tours →
            </Link>

            <Link href="/destinations" className="booking-secondary">
              Discover Destinations
            </Link>
          </div>
        </div>

        <div className="hero-scroll">
          <span>SCROLL TO EXPLORE</span>
          <div>↓</div>
        </div>
      </section>

      {/* =========================================
          DESTINATIONS
          ========================================= */}
      <section id="destinations" className="destinations">
        <div className="section-header">
          <p>EXPLORE PAPUA HIGHLANDS</p>

          <h2>Discover Our Destinations</h2>

          <span>
            Experience the extraordinary landscapes, cultures,
            and communities of the Papua Highlands.
          </span>
        </div>

        <div className="destination-grid">
          {/* WAMENA */}
          <div className="destination-card">
            <div className="destination-image">
              <img
                src="/images/wamena.jpg"
                alt="Wamena Papua Highlands"
              />
            </div>

            <div className="destination-content">
              <span>JAYAWIJAYA</span>

              <h3>Wamena</h3>

              <p>
                Discover the heart of the Baliem Valley, surrounded
                by spectacular mountains and living highland culture.
              </p>

              <Link href="/destinations/wamena">
                Explore Destination →
              </Link>
            </div>
          </div>

          {/* BALIEM VALLEY */}
          <div className="destination-card">
            <div className="destination-image">
              <img
                src="/images/baliem.webp"
                alt="Baliem Valley Papua Highlands"
              />
            </div>

            <div className="destination-content">
              <span>BALIEM VALLEY</span>

              <h3>Baliem Valley</h3>

              <p>
                Journey through ancient traditions, dramatic
                landscapes, and authentic communities of the
                highlands.
              </p>

              <Link href="/destinations/baliem-valley">
                Explore Destination →
              </Link>
            </div>
          </div>

          {/* GUA LOKALE */}
          <div className="destination-card">
            <div className="destination-image">
              <img
                src="/images/lokale.jpg"
                alt="Gua Lokale Usilimo"
              />
            </div>

            <div className="destination-content">
              <span>USILIMO</span>

              <h3>Gua Lokale</h3>

              <p>
                Explore one of the most mysterious natural
                attractions surrounded by pine forests in Usilimo.
              </p>

              <Link href="/destinations/gua-lokale">
                Explore Destination →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          TOUR PACKAGES
          ========================================= */}
      <section id="packages" className="packages">
        <div className="section-header">
          <p>CURATED EXPERIENCES</p>

          <h2>Tour Packages</h2>

          <span>
            Carefully designed journeys to discover the nature,
            culture, and authentic experiences of Papua Highlands.
          </span>
        </div>

        <div className="package-grid">
          {/* WAMENA DISCOVERY */}
          <div className="package-card">
            <div className="package-image">
              <img
                src="/images/wamena.jpg"
                alt="Wamena Discovery"
              />
            </div>

            <div className="package-content">
              <span>3 DAYS / 2 NIGHTS</span>

              <h3>Wamena Discovery</h3>

              <p>
                A perfect introduction to the landscapes, culture,
                and local life of Wamena.
              </p>

              <Link href="/tours/wamena-discovery">
                View Package →
              </Link>
            </div>
          </div>

          {/* BALIEM NATURE & CULTURE */}
          <div className="package-card">
            <div className="package-image">
              <img
                src="/images/baliem.webp"
                alt="Baliem Nature and Culture"
              />
            </div>

            <div className="package-content">
              <span>5 DAYS / 4 NIGHTS</span>

              <h3>Baliem Nature &amp; Culture</h3>

              <p>
                Explore spectacular landscapes while experiencing
                the traditions and communities of the Baliem Valley.
              </p>

              <Link href="/tours/baliem-nature-culture">
                View Package →
              </Link>
            </div>
          </div>

          {/* 12 DESTINATIONS */}
          <div className="package-card">
            <div className="package-image">
              <img
                src="/images/lokale.jpg"
                alt="12 Destinations Experience"
              />
            </div>

            <div className="package-content">
              <span>6 DAYS / 5 NIGHTS</span>

              <h3>12 Destinations Experience</h3>

              <p>
                Discover a carefully selected network of twelve
                remarkable destinations across Jayawijaya.
              </p>

              <Link href="/tours/12-destination-experience">
                View Package →
              </Link>
            </div>
          </div>

          {/* ULTIMATE WAMENA */}
          <div className="package-card">
            <div className="package-image">
              <img
                src="/images/wamena.jpg"
                alt="Ultimate Wamena"
              />
            </div>

            <div className="package-content">
              <span>7 DAYS / 6 NIGHTS</span>

              <h3>Ultimate Wamena</h3>

              <p>
                A premium private journey designed for travelers
                seeking deeper and more exclusive experiences.
              </p>

              <Link href="/tours/ultimate-wamena">
                View Package →
              </Link>
            </div>
          </div>

          {/* CUSTOMIZED TOUR */}
          <div className="package-card">
            <div className="package-image">
              <img
                src="/images/lodama.jpg"
                alt="Customized Tour"
              />
            </div>

            <div className="package-content">
              <span>FLEXIBLE ITINERARY</span>

              <h3>Customized Tour</h3>

              <p>
                Create your own journey for adventure, culture,
                photography, research, or special interests.
              </p>

              <Link href="/tours/customized-tour">
                Design Your Journey →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          WHY CHOOSE PAPEG
          ========================================= */}
      <section id="about" className="why-papeg">
        <div className="section-header">
          <p>WHY TRAVEL WITH PAPEG</p>

          <h2>Experience Papua Differently</h2>

          <span>
            We create meaningful journeys that connect travelers
            with the landscapes, cultures, and communities of
            Papua Highlands.
          </span>
        </div>

        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon">01</div>

            <h3>Local Expertise</h3>

            <p>
              Travel with a team that understands Wamena, the
              Baliem Valley, local communities, and the unique
              character of Papua Highlands.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">02</div>

            <h3>Authentic Experiences</h3>

            <p>
              Go beyond ordinary sightseeing and experience local
              culture, traditions, nature, and community life in a
              meaningful way.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">03</div>

            <h3>Personalized Journeys</h3>

            <p>
              From private adventures to photography and cultural
              journeys, we design experiences around your interests
              and travel style.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">04</div>

            <h3>Responsible Tourism</h3>

            <p>
              We believe tourism should create value for travelers
              while supporting local communities and protecting
              Papua&apos;s natural heritage.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================
          CONTACT CTA
          ========================================= */}
      <section id="contact" className="contact-cta">
        <div className="contact-content">
          <p>YOUR PAPUA ADVENTURE STARTS HERE</p>

          <h2>
            Ready to Discover
            <br />
            Papua Highlands?
          </h2>

          <span>
            Tell us about your journey and let Papeg create an
            unforgettable experience in Wamena and the Baliem Valley.
          </span>

          <Link
            href="/request-quote?package=Customized%20Tour"
            className="booking-primary"
          >
            Plan Your Journey →
          </Link>
        </div>
      </section>
    </main>
  );
}