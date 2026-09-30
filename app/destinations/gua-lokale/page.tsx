import Link from "next/link";

export const metadata = {
  title: "Gua Lokale | Papeg Tour & Travel",
  description:
    "Explore Gua Lokale and the pine forest landscape of Usilimo, Jayawijaya, Papua Highlands.",
};

export default function GuaLokalePage() {
  return (
    <main className="destination-detail-page">

      {/* HERO */}
      <section
        className="destination-detail-hero"
        style={{
          backgroundImage: "url('/images/lokale.jpg')",
        }}
      >
        <div className="destination-detail-overlay">
          <div className="destination-detail-hero-content">
            <span>USILIMO • JAYAWIJAYA</span>

            <h1>
              Gua
              <br />
              Lokale
            </h1>

            <p>
              Discover a mysterious natural attraction surrounded by
              the highland landscape of Usilimo.
            </p>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="destination-detail-content">
        <div className="destination-detail-text">

          <span>ABOUT GUA LOKALE</span>

          <h2>
            A Mysterious Cave
            <br />
            in the Highlands
          </h2>

          <p>
            Gua Lokale is a natural attraction located in Kampung
            Abutpuk, Distrik Usilimo, Kabupaten Jayawijaya, Papua Highlands.
          </p>

          <p>
            Surrounded by pine forest and highland scenery, the area offers
            visitors an opportunity to explore nature while experiencing
            a quieter side of Jayawijaya.
          </p>

          <p>
            The cave is known locally for its mysterious character,
            with sections that remain unexplored. The surrounding area
            can also be used for recreation, gatherings, photography,
            and community-based tourism activities.
          </p>

        </div>
      </section>

      {/* LOCATION */}
      <section className="destination-experiences">

        <div className="section-header">
          <p>VISIT GUA LOKALE</p>

          <h2>Nature, Forest & Exploration</h2>

          <span>
            Experience the natural atmosphere of Usilimo and discover
            one of Jayawijaya's unique attractions.
          </span>
        </div>

        <div className="why-grid">

          <div className="why-card">
            <div className="why-icon">01</div>

            <h3>Gua Lokale</h3>

            <p>
              Explore the cave and discover its distinctive natural
              formations and mysterious atmosphere.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">02</div>

            <h3>Pine Forest</h3>

            <p>
              Enjoy the peaceful highland environment surrounded by
              pine trees and fresh mountain air.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">03</div>

            <h3>Photography</h3>

            <p>
              Capture the cave, forest, landscapes, and unique atmosphere
              of the Usilimo highlands.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">04</div>

            <h3>Community Experience</h3>

            <p>
              Discover opportunities for community-based tourism and
              meaningful interaction with the surrounding area.
            </p>
          </div>

        </div>

      </section>

      {/* VISITOR INFORMATION */}
      <section className="destination-detail-content">

        <div className="destination-detail-text">

          <span>VISITOR INFORMATION</span>

          <h2>
            Plan Your Visit
          </h2>

          <p>
            Gua Lokale is located approximately along Jalan Wamena–Yalimo
            Km 28, Kampung Abutpuk, Distrik Usilimo, Kabupaten Jayawijaya.
          </p>

          <p>
            For current access information, local arrangements, and
            booking, travelers should coordinate with the local manager
            before visiting.
          </p>

          <div className="destination-facts">

            <div>
              <strong>Location</strong>
              <span>Usilimo, Jayawijaya</span>
            </div>

            <div>
              <strong>Region</strong>
              <span>Papua Highlands</span>
            </div>

            <div>
              <strong>Experience</strong>
              <span>Nature & Cave Exploration</span>
            </div>

            <div>
              <strong>Booking</strong>
              <span>Contact the local manager</span>
            </div>

          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="contact-cta">

        <div className="contact-content">

          <p>EXPLORE USILIMO</p>

          <h2>
            Discover
            <br />
            Gua Lokale
          </h2>

          <span>
            Add Gua Lokale to your Papua Highlands journey with
            Papeg Tour & Travel.
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