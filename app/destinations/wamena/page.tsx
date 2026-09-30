import Link from "next/link";

export const metadata = {
  title: "Wamena | Papeg Tour & Travel",
  description:
    "Discover Wamena, the gateway to the Baliem Valley and the heart of Papua Highlands.",
};

export default function WamenaPage() {
  return (
    <main className="destination-detail-page">

      {/* HERO */}
      <section
        className="destination-detail-hero"
        style={{
          backgroundImage: "url('/images/wamena.jpg')",
        }}
      >
        <div className="destination-detail-overlay">
          <div className="destination-detail-hero-content">
            <span>JAYAWIJAYA • PAPUA HIGHLANDS</span>

            <h1>
              Discover
              <br />
              Wamena
            </h1>

            <p>
              The gateway to the Baliem Valley and the heart of
              Papua Highlands.
            </p>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="destination-detail-content">
        <div className="destination-detail-text">
          <span>ABOUT WAMENA</span>

          <h2>
            Where Nature Meets
            <br />
            Living Culture
          </h2>

          <p>
            Wamena is the main gateway to the spectacular Baliem Valley,
            surrounded by mountains, rivers, traditional villages, and
            communities with rich cultural traditions.
          </p>

          <p>
            For travelers seeking authentic experiences in Papua Highlands,
            Wamena offers an opportunity to explore dramatic landscapes while
            connecting with local communities and discovering the unique
            character of the highlands.
          </p>

          <p>
            From cultural journeys and nature exploration to photography and
            adventure, Wamena is the starting point for unforgettable journeys
            across Jayawijaya.
          </p>
        </div>
      </section>

      {/* EXPERIENCES */}
      <section className="destination-experiences">
        <div className="section-header">
          <p>EXPERIENCE WAMENA</p>

          <h2>What You Can Discover</h2>

          <span>
            Explore landscapes, culture, communities, and local life
            through carefully designed journeys.
          </span>
        </div>

        <div className="why-grid">

          <div className="why-card">
            <div className="why-icon">01</div>

            <h3>Baliem Valley</h3>

            <p>
              Experience one of Papua's most remarkable highland landscapes,
              surrounded by mountains and traditional communities.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">02</div>

            <h3>Local Culture</h3>

            <p>
              Discover local traditions, community life, stories, and
              cultural heritage through meaningful encounters.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">03</div>

            <h3>Nature & Adventure</h3>

            <p>
              Explore valleys, rivers, forests, mountains, and other
              landscapes surrounding Wamena and Jayawijaya.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">04</div>

            <h3>Photography</h3>

            <p>
              Capture dramatic highland landscapes and authentic moments
              for photography and visual storytelling.
            </p>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="contact-cta">
        <div className="contact-content">

          <p>START YOUR PAPUA JOURNEY</p>

          <h2>
            Discover
            <br />
            Wamena
          </h2>

          <span>
            Let Papeg create a journey that connects you with the
            landscapes and communities of Papua Highlands.
          </span>

          <Link
            href="/request-quote?package=Wamena%20Discovery"
            className="booking-primary"
          >
            Plan Your Journey →
          </Link>

        </div>
      </section>

    </main>
  );
}