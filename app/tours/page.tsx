import Link from "next/link";

export const metadata = {
  title: "Tour Packages | Papeg Tour & Travel",
  description:
    "Explore curated journeys across Wamena, Baliem Valley, and the Papua Highlands with Papeg Tour & Travel.",
};

const tours = [
  {
    duration: "3 DAYS / 2 NIGHTS",
    title: "Wamena Discovery",
    description:
      "A meaningful introduction to Wamena, combining highland landscapes, local culture, and authentic community experiences.",
    image: "/images/wamena.jpg",
    href: "/tours/wamena-discovery",
    category: "INTRODUCTION",
  },
  {
    duration: "5 DAYS / 4 NIGHTS",
    title: "Baliem Nature & Culture",
    description:
      "Explore dramatic Baliem Valley landscapes while discovering traditions, communities, and the cultural character of the highlands.",
    image: "/images/baliem.webp",
    href: "/tours/baliem-nature-culture",
    category: "NATURE & CULTURE",
  },
  {
    duration: "6 DAYS / 5 NIGHTS",
    title: "12 Destinations Experience",
    description:
      "A deeper journey across a carefully selected network of remarkable destinations throughout Jayawijaya.",
    image: "/images/lokale.jpg",
    href: "/tours/12-destination-experience",
    category: "SIGNATURE JOURNEY",
  },
  {
    duration: "7 DAYS / 6 NIGHTS",
    title: "Ultimate Wamena",
    description:
      "A private and immersive journey designed for travelers seeking deeper access to nature, culture, and local experiences.",
    image: "/images/lodama.jpg",
    href: "/tours/ultimate-wamena",
    category: "PRIVATE EXPERIENCE",
  },
  {
    duration: "FLEXIBLE ITINERARY",
    title: "Customized Tour",
    description:
      "Create a journey around your own interests, from adventure and photography to culture, research, and special occasions.",
    image: "/images/wamena.jpg",
    href: "/tours/customized-tour",
    category: "TAILOR-MADE",
  },
];

export default function ToursPage() {
  return (
    <main className="tours-page">

      {/* HERO */}
      <section className="tours-hero">

        <div className="tours-hero-overlay">

          <div className="tours-hero-content">

            <span>CURATED PAPUA HIGHLANDS EXPERIENCES</span>

            <h1>
              Journeys
              <br />
              Designed Around You.
            </h1>

            <p>
              Discover thoughtfully designed journeys through Wamena,
              the Baliem Valley, and the extraordinary landscapes of
              Papua Highlands.
            </p>

          </div>

        </div>

      </section>

      {/* INTRO */}
      <section className="tours-intro">

        <div className="tours-intro-content">

          <span>OUR EXPERIENCES</span>

          <h2>
            Travel deeper.
            <br />
            Experience more.
          </h2>

          <p>
            Our journeys are designed to connect travelers with the
            landscapes, traditions, and communities of Papua Highlands.
            Choose an existing experience or let us create a journey
            specifically for you.
          </p>

        </div>

      </section>

      {/* TOUR GRID */}
      <section className="tours-catalog">

        <div className="tour-catalog-grid">

          {tours.map((tour, index) => (
            <article
              key={tour.title}
              className={`tour-catalog-card ${
                index === 2 ? "tour-featured" : ""
              }`}
            >

              <div className="tour-catalog-image">

                <img
                  src={tour.image}
                  alt={tour.title}
                />

                <span className="tour-category">
                  {tour.category}
                </span>

              </div>

              <div className="tour-catalog-content">

                <span className="tour-duration">
                  {tour.duration}
                </span>

                <h3>{tour.title}</h3>

                <p>{tour.description}</p>

                <Link href={tour.href}>
                  Explore Journey
                  <span>→</span>
                </Link>

              </div>

            </article>
          ))}

        </div>

      </section>

      {/* CUSTOM JOURNEY CTA */}
      <section className="tours-custom-cta">

        <div className="tours-custom-content">

          <span>YOUR JOURNEY, YOUR WAY</span>

          <h2>
            Looking for
            <br />
            something different?
          </h2>

          <p>
            Tell us what you want to experience and our team can
            create a personalized journey around your interests,
            schedule, and travel style.
          </p>

          <Link
            href="/request-quote?package=Customized%20Tour"
            className="booking-primary"
          >
            Design Your Journey →
          </Link>

        </div>

      </section>

    </main>
  );
}