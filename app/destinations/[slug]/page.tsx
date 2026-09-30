import Link from "next/link";
import { notFound } from "next/navigation";
import { destinations } from "../../data/destinations";
import DestinationGallery from "../../components/DestinationGallery";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return destinations.map((destination) => ({
    slug: destination.slug,
  }));
}

export default async function DestinationDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const destination = destinations.find(
    (item) => item.slug === slug
  );

  if (!destination) {
    notFound();
  }

  return (
    <main className="destination-detail-page">

      {/* =========================================
          HERO
      ========================================= */}

      <section
        className="destination-detail-hero"
        style={{
          backgroundImage: `url(${destination.image})`,
        }}
      >
        <div className="destination-detail-overlay">

          <div className="destination-detail-hero-content">

            <Link
              href="/destinations"
              className="back-to-destinations"
            >
              ← Explore All Destinations
            </Link>

            <div className="destination-hero-label">
              {destination.category}
            </div>

            <h1>{destination.name}</h1>

            <div className="destination-hero-location">
              <span>●</span>
              {destination.location}
            </div>

          </div>

        </div>
      </section>


      {/* =========================================
          INTRODUCTION
      ========================================= */}

      <section className="destination-story">

        <div className="destination-story-inner">

          <div className="destination-story-label">

            <span className="section-label">
              DISCOVER THE DESTINATION
            </span>

          </div>

          <div className="destination-story-content">

            <h2>
              An authentic experience
              <br />
              in the Papua Highlands.
            </h2>

            <p className="destination-lead">
              {destination.shortDescription}
            </p>

            <p>
              {destination.description}
            </p>

            <p>
              Papeg Tour & Travel can arrange this experience as
              part of a private journey, small-group tour or a
              customized itinerary based on your interests.
            </p>

          </div>

        </div>

      </section>


      {/* =========================================
          HIGHLIGHTS
      ========================================= */}

      <section className="destination-experiences">

        <div className="destination-experiences-inner">

          <div className="destination-section-heading">

            <span className="section-label">
              EXPERIENCE
            </span>

            <h2>
              What you can
              <br />
              experience here
            </h2>

          </div>

          <div className="destination-highlight-grid">

            {destination.highlights.map(
              (highlight, index) => (

                <div
                  className="destination-highlight"
                  key={highlight}
                >

                  <span className="highlight-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <h3>
                    {highlight}
                  </h3>

                  <p>
                    Discover this aspect of the destination
                    through an authentic Papua Highlands
                    experience.
                  </p>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* =========================================
          PHOTO GALLERY
      ========================================= */}

      <section className="destination-gallery">

        <div className="destination-gallery-inner">

          <div className="destination-section-heading">

            <span className="section-label">
              VISUAL JOURNEY
            </span>

            <h2>
              Discover the
              <br />
              landscape
            </h2>

            <p className="destination-gallery-intro">
              Explore the landscapes, culture and atmosphere
              of this destination through the Papeg visual
              journey.
            </p>

          </div>

          <DestinationGallery
            name={destination.name}
            images={destination.gallery}
          />

        </div>

      </section>


      {/* =========================================
          PRACTICAL INFORMATION
      ========================================= */}

      <section className="destination-practical">

        <div className="destination-practical-inner">

          <div className="destination-section-heading">

            <span className="section-label">
              PLAN YOUR VISIT
            </span>

            <h2>
              Practical
              <br />
              Information
            </h2>

          </div>

          <div className="destination-practical-grid">


            {/* DURATION */}

            <div className="practical-card">

              <span className="practical-icon">
                01
              </span>

              <span className="practical-label">
                RECOMMENDED DURATION
              </span>

              <h3>
                {destination.duration}
              </h3>

            </div>


            {/* LOCATION */}

            <div className="practical-card">

              <span className="practical-icon">
                02
              </span>

              <span className="practical-label">
                LOCATION
              </span>

              <h3>
                {destination.location}
              </h3>

            </div>


            {/* ACCESS */}

            <div className="practical-card">

              <span className="practical-icon">
                03
              </span>

              <span className="practical-label">
                ACCESS
              </span>

              <h3>
                Road & Local Access
              </h3>

              <p>
                {destination.access}
              </p>

            </div>


            {/* BEST FOR */}

            <div className="practical-card practical-best-for">

              <span className="practical-icon">
                04
              </span>

              <span className="practical-label">
                BEST FOR
              </span>

              <div className="best-for-list">

                {destination.bestFor.map(
                  (item) => (

                    <span key={item}>
                      {item}
                    </span>

                  )
                )}

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          JOURNEY SECTION
      ========================================= */}

      <section className="destination-journey">

        <div className="destination-journey-inner">

          <div className="destination-journey-image">

            <img
              src={destination.image}
              alt={destination.name}
            />

          </div>

          <div className="destination-journey-content">

            <span className="section-label">
              PAPEG JOURNEY
            </span>

            <h2>
              More than a
              <br />
              destination.
            </h2>

            <p>
              The Papua Highlands is best experienced through
              connection — with the landscape, local traditions
              and the people who call this region home.
            </p>

            <p>
              Let us design your journey around the experiences
              that matter to you.
            </p>

            <Link
              href={`/request-quote?package=${encodeURIComponent(
                destination.name
              )}`}
              className="destination-primary-button"
            >
              Plan This Experience

              <span>
                →
              </span>

            </Link>

          </div>

        </div>

      </section>


      {/* =========================================
          LOCATION
      ========================================= */}

      <section className="destination-location-section">

        <div className="destination-location-inner">

          <div>

            <span className="section-label">
              LOCATION
            </span>

            <h2>
              {destination.name}
            </h2>

            <p>
              {destination.location}
            </p>

          </div>

          <Link
            href="/request-quote"
            className="destination-outline-button"
          >
            Ask About This Destination
          </Link>

        </div>

      </section>


      {/* =========================================
          FINAL CTA
      ========================================= */}

      <section className="destination-detail-cta">

        <div className="destination-detail-cta-inner">

          <span className="section-label">
            YOUR PAPUA HIGHLANDS JOURNEY
          </span>

          <h2>
            Ready to experience
            <br />
            {destination.name}?
          </h2>

          <p>
            Tell us your travel plans and we will help create
            a journey around your interests.
          </p>

          <Link
            href={`/request-quote?package=${encodeURIComponent(
              destination.name
            )}`}
            className="cta-button"
          >
            Request a Quote
          </Link>

        </div>

      </section>

    </main>
  );
}