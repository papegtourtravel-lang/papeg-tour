import Link from "next/link";

export const metadata = {
  title: "Baliem Valley | Papeg Tour & Travel",
  description:
    "Explore the landscapes, culture, and communities of the Baliem Valley in Papua Highlands.",
};

export default function BaliemValleyPage() {
  return (
    <main className="destination-detail-page">

      {/* HERO */}
      <section
        className="destination-detail-hero"
        style={{
          backgroundImage: "url('/images/baliem.jpg')",
        }}
      >
        <div className="destination-detail-overlay">
          <div className="destination-detail-hero-content">
            <span>BALIEM VALLEY • PAPUA HIGHLANDS</span>

            <h1>
              Explore the
              <br />
              Baliem Valley
            </h1>

            <p>
              Dramatic landscapes, living traditions, and extraordinary
              highland experiences.
            </p>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="destination-detail-content">
        <div className="destination-detail-text">
          <span>ABOUT BALIEM VALLEY</span>

          <h2>
            A Valley of
            <br />
            Extraordinary Landscapes
          </h2>

          <p>
            The Baliem Valley is one of the most distinctive landscapes
            of Papua Highlands, surrounded by mountains and shaped by
            generations of local communities.
          </p>

          <p>
            The valley offers travelers an opportunity to experience
            nature and culture together, from traditional communities
            and agricultural landscapes to rivers, forests, and mountain
            scenery.
          </p>

          <p>
            Papeg creates journeys that allow visitors to explore the
            Baliem Valley respectfully while experiencing its landscapes,
            traditions, and local way of life.
          </p>
        </div>
      </section>

      {/* EXPERIENCES */}
      <section className="destination-experiences">
        <div className="section-header">
          <p>EXPLORE BALIEM VALLEY</p>

          <h2>Experiences Beyond Sightseeing</h2>

          <span>
            Discover the valley through nature, culture, community,
            and photography.
          </span>
        </div>

        <div className="why-grid">

          <div className="why-card">
            <div className="why-icon">01</div>

            <h3>Mountain Landscapes</h3>

            <p>
              Experience spectacular highland scenery surrounded by
              mountains, valleys, rivers, and agricultural landscapes.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">02</div>

            <h3>Traditional Communities</h3>

            <p>
              Encounter local communities and gain a deeper appreciation
              of the traditions and daily life of the highlands.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">03</div>

            <h3>Nature Exploration</h3>

            <p>
              Explore the natural environment through walking journeys,
              village visits, rivers, forests, and scenic viewpoints.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon">04</div>

            <h3>Photography</h3>

            <p>
              Discover unique landscapes, cultural moments, and
              visual stories throughout the Baliem Valley.
            </p>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="contact-cta">
        <div className="contact-content">

          <p>YOUR BALIEM JOURNEY STARTS HERE</p>

          <h2>
            Experience
            <br />
            Baliem Valley
          </h2>

          <span>
            Tell us about your interests and let Papeg design your
            journey through the heart of Papua Highlands.
          </span>

          <Link
            href="/request-quote?package=Baliem%20Nature%20%26%20Culture"
            className="booking-primary"
          >
            Plan Your Journey →
          </Link>

        </div>
      </section>

    </main>
  );
}