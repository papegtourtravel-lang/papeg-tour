import Link from "next/link";
import { destinations } from "../data/destinations";

export default function DestinationsPage() {
  return (
    <main className="destinations-page">
      {/* HERO */}
      <section className="destinations-hero">
        <div className="destinations-hero-overlay">
          <div className="destinations-hero-content">
            <span>EXPLORE PAPUA HIGHLANDS</span>

            <h1>
              11 Destinations.
              <br />
              One Extraordinary Journey.
            </h1>

            <p>
              Discover caves, ancestral heritage, traditional villages,
              highland coffee and breathtaking landscapes across the Baliem
              Valley.
            </p>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="destinations-intro">
        <div className="destinations-intro-inner">
          <span className="section-label">PAPEG DESTINATIONS</span>

          <h2>
            Discover the Heart
            <br />
            of the Papua Highlands
          </h2>

          <p>
            From ancient caves and ancestral heritage to living cultural
            traditions and highland landscapes, our destinations offer
            meaningful experiences beyond conventional sightseeing.
          </p>
        </div>
      </section>

      {/* DESTINATION GRID */}
      <section className="destinations-grid-section">
        <div className="destinations-grid">
          {destinations.map((destination, index) => (
            <article className="destination-card" key={destination.slug}>
              <div className="destination-image-wrapper">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="destination-image"
                />

                <span className="destination-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="destination-card-content">
                <span className="destination-category">
                  {destination.category}
                </span>

                <h3>{destination.name}</h3>

                <p className="destination-location">
                  {destination.location}
                </p>

                <p className="destination-description">
                  {destination.shortDescription}
                </p>

                <Link
                  href={`/destinations/${destination.slug}`}
                  className="destination-link"
                >
                  Explore Destination
                  <span>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="destinations-cta">
        <div className="destinations-cta-inner">
          <span className="section-label">YOUR JOURNEY, YOUR WAY</span>

          <h2>
            Ready to Explore
            <br />
            the Papua Highlands?
          </h2>

          <p>
            Tell us what kind of experience you are looking for and our team
            can create a private or small-group journey around your interests.
          </p>

          <Link href="/request-quote" className="cta-button">
            Plan Your Journey
          </Link>
        </div>
      </section>
    </main>
  );
}