
import Link from "next/link";
import "./contact.css";

export default function ContactPage() {
  return (
    <main className="contact-page">

      {/* HERO */}
      <section className="contact-hero">
        <div className="contact-container">
          <p className="contact-eyebrow">
            Contact Papeg Tour & Travel
          </p>

          <h1 className="contact-title">
            Let&apos;s plan your
            <br />
            <span>Papua journey.</span>
          </h1>

          <p className="contact-lead">
            Have a question about our destinations, tour packages, flights,
            or customized journeys? Contact our team and start planning your
            trip to Wamena and the Papua Highlands.
          </p>
        </div>
      </section>

      {/* CONTACT INFORMATION */}
      <section className="contact-content">
        <div className="contact-container">

          <div className="contact-grid">

            {/* LOCATION */}
            <article className="contact-card">
              <div className="contact-icon">
                📍
              </div>

              <p className="contact-card-label">
                Location
              </p>

              <h2>
                Wamena
              </h2>

              <p>
                Jayawijaya, Papua Highlands,
                <br />
                Indonesia
              </p>
            </article>

            {/* SERVICES */}
            <article className="contact-card">
              <div className="contact-icon">
                ✈️
              </div>

              <p className="contact-card-label">
                Services
              </p>

              <h2>
                Travel Services
              </h2>

              <p>
                Tour packages, private tours, customized journeys,
                cultural experiences, nature tours, and travel assistance.
              </p>
            </article>

            {/* INQUIRY */}
            <article className="contact-card">
              <div className="contact-icon">
                💬
              </div>

              <p className="contact-card-label">
                Inquiry
              </p>

              <h2>
                Plan Your Trip
              </h2>

              <p>
                Tell us your preferred dates, group size, and the experience
                you are looking for.
              </p>
            </article>

          </div>

          {/* CTA */}
          <div className="contact-cta">

            <div>
              <p className="contact-cta-label">
                Start Your Journey
              </p>

              <h2>
                Tell us what kind of Papua experience you are looking for.
              </h2>

              <p>
                Send us your travel dates, number of travelers, preferred
                package, and interests. Our team can then help prepare the
                right journey for you.
              </p>
            </div>

            <div className="contact-button-wrapper">
              <Link
                href="/request-quote"
                className="contact-button"
              >
                Request a Quote
                <span aria-hidden="true">
                  →
                </span>
              </Link>
            </div>

          </div>

          {/* NOTE */}
          <div className="contact-note">
            Papeg Tour & Travel — Wamena, Jayawijaya, Papua Highlands,
            Indonesia.
          </div>

        </div>
      </section>

    </main>
  );
}
