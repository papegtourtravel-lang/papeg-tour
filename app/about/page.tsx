
import "./about.css";

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-container">
          <p className="about-eyebrow">About Papeg Tour & Travel</p>

          <h1 className="about-title">
            Discover Wamena.
            <br />
            <span>Experience Papua.</span>
          </h1>

          <p className="about-lead">
            Papeg Tour & Travel is a local tourism company based in Wamena,
            Papua Highlands, Indonesia. We create meaningful journeys that
            connect travelers with nature, culture, communities, and the
            unique landscapes of Jayawijaya.
          </p>
        </div>
      </section>

      <section className="about-story">
        <div className="about-container about-story-grid">
          <div>
            <p className="about-section-label">Our Story</p>

            <h2 className="about-section-title">
              A journey into the heart of the Papua Highlands.
            </h2>
          </div>

          <div className="about-story-text">
            <p>
              Papua Highlands offers a rare combination of spectacular
              landscapes, living traditions, and welcoming communities.
            </p>

            <p>
              Through Papeg Tour & Travel, travelers can discover Wamena and
              Jayawijaya through carefully planned journeys designed around
              authentic local experiences.
            </p>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="about-container">
          <div className="about-values-heading">
            <p className="about-section-label">What We Offer</p>

            <h2 className="about-section-title">
              Travel with purpose.
            </h2>
          </div>

          <div className="about-values-grid">
            <article className="about-card">
              <div className="about-card-icon">🌿</div>

              <h3>Nature</h3>

              <p>
                Explore valleys, caves, forests, mountains, and natural
                destinations across Jayawijaya.
              </p>
            </article>

            <article className="about-card">
              <div className="about-card-icon">🪶</div>

              <h3>Culture</h3>

              <p>
                Experience local traditions, communities, stories, and
                cultural heritage in meaningful ways.
              </p>
            </article>

            <article className="about-card">
              <div className="about-card-icon">🧭</div>

              <h3>Adventure</h3>

              <p>
                Discover private journeys, photography trips, and customized
                adventures designed around your interests.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="about-destination">
        <div className="about-container about-destination-grid">
          <div>
            <p className="about-section-label">Our Destination</p>

            <h2 className="about-destination-title">
              Wamena & Jayawijaya
            </h2>
          </div>

          <p className="about-destination-text">
            From the Baliem Valley to caves, forests, villages, and cultural
            destinations, Papeg Tour & Travel helps travelers discover the
            Papua Highlands through local knowledge and carefully organized
            journeys.
          </p>
        </div>
      </section>
    </main>
  );
}
