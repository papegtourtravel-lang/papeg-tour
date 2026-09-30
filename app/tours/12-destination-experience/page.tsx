import Link from "next/link";

export const metadata = {
  title: "12 Destinations Experience | Papeg Tour & Travel",
  description:
    "A 6-day signature journey exploring selected natural and cultural destinations across Jayawijaya, Papua Highlands.",
};

const highlights = [
  {
    number: "01",
    title: "Twelve Destinations",
    text: "Discover a carefully selected network of natural, cultural, and community-based destinations across Jayawijaya.",
  },
  {
    number: "02",
    title: "Baliem Highlands",
    text: "Experience the landscapes and atmosphere of one of Papua Highlands' most remarkable regions.",
  },
  {
    number: "03",
    title: "Local Communities",
    text: "Encounter local traditions and community life through respectful and locally guided experiences.",
  },
  {
    number: "04",
    title: "Photography",
    text: "Create memorable visual stories through landscapes, cultural moments, architecture, and everyday life.",
  },
];

const destinations = [
  "Wamena",
  "Baliem Valley",
  "Gua Lokale",
  "Selected Highland Landscapes",
  "Traditional Communities",
  "Local Cultural Sites",
];

const itinerary = [
  {
    day: "DAY 01",
    title: "Arrival & Wamena Introduction",
    text: "Arrive in Wamena, meet the Papeg team, transfer to your accommodation, and begin your introduction to the highland environment.",
  },
  {
    day: "DAY 02",
    title: "Baliem Valley Discovery",
    text: "Explore selected landscapes around Baliem Valley and experience the dramatic mountain environment surrounding Wamena.",
  },
  {
    day: "DAY 03",
    title: "Nature & Cave Experience",
    text: "Visit selected natural attractions and explore the character of Jayawijaya's highland environment, subject to local conditions.",
  },
  {
    day: "DAY 04",
    title: "Culture & Community",
    text: "Discover local traditions, community life, and cultural locations through locally guided experiences.",
  },
  {
    day: "DAY 05",
    title: "Destination Network Exploration",
    text: "Continue exploring selected destinations from Papeg's network, with opportunities for photography, nature observation, and cultural discovery.",
  },
  {
    day: "DAY 06",
    title: "Final Experience & Departure",
    text: "Enjoy a final morning experience according to your flight schedule before transferring to Wamena Airport.",
  },
];

const inclusions = [
  "Airport transfers in Wamena",
  "Accommodation according to the selected package",
  "Local transportation during the tour",
  "Local tour assistance",
  "Selected destinations and activities in the itinerary",
  "Basic coordination and trip assistance",
];

const exclusions = [
  "International or domestic airfare to and from Wamena",
  "Personal expenses",
  "Meals not specifically included",
  "Travel insurance",
  "Personal equipment and photography gear",
  "Additional activities outside the agreed itinerary",
];

export default function TwelveDestinationsPage() {
  return (
    <main className="tour-detail-page">
      <section
        className="tour-detail-hero"
        style={{
          backgroundImage: "url('/images/lokale.jpg')",
        }}
      >
        <div className="tour-detail-overlay">
          <div className="tour-detail-hero-content">
            <span>6 DAYS / 5 NIGHTS • JAYAWIJAYA</span>

            <h1>
              Twelve Destinations.
              <br />
              One Journey.
            </h1>

            <p>
              A signature journey through the landscapes, culture,
              and communities of Papua Highlands.
            </p>
          </div>
        </div>
      </section>

      <section className="tour-detail-intro">
        <div className="tour-detail-intro-content">
          <div>
            <span>PAPEG SIGNATURE JOURNEY</span>

            <h2>
              Explore more.
              <br />
              Discover deeper.
            </h2>
          </div>

          <div>
            <p>
              The 12 Destinations Experience is designed for travelers
              who want to go beyond the familiar and discover a wider
              perspective of Jayawijaya.
            </p>

            <p>
              Over six days, the journey combines nature, culture,
              local communities, photography, and selected destinations
              within Papeg's tourism network.
            </p>

            <p>
              The exact sequence of destinations can be adapted
              according to weather, accessibility, local conditions,
              and traveler interests.
            </p>
          </div>
        </div>
      </section>

      <section className="tour-highlights">
        <div className="tour-section-heading">
          <span>SIGNATURE HIGHLIGHTS</span>

          <h2>
            Twelve destinations.
            <br />
            One extraordinary experience.
          </h2>
        </div>

        <div className="tour-highlights-grid">
          {highlights.map((item) => (
            <article key={item.number} className="tour-highlight-card">
              <span>{item.number}</span>

              <h3>{item.title}</h3>

              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tour-itinerary">
        <div className="tour-section-heading">
          <span>6-DAY JOURNEY</span>

          <h2>
            A wider journey
            <br />
            across Jayawijaya.
          </h2>
        </div>

        <div className="tour-itinerary-list">
          {itinerary.map((item) => (
            <article key={item.day} className="tour-itinerary-item">
              <div className="tour-itinerary-day">
                <span>{item.day}</span>
              </div>

              <div className="tour-itinerary-content">
                <h3>{item.title}</h3>

                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="tour-info-section">
        <div className="tour-section-heading">
          <span>DESTINATION NETWORK</span>

          <h2>
            A collection of
            <br />
            meaningful places.
          </h2>
        </div>

        <div className="tour-highlights-grid">
          {destinations.map((destination, index) => (
            <article
              key={destination}
              className="tour-highlight-card"
            >
              <span>
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3>{destination}</h3>

              <p>
                Selected as part of the broader Papeg experience
                across the highlands.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="tour-info-section">
        <div className="tour-info-grid">
          <div className="tour-info-column">
            <span>INCLUDED</span>

            <h2>What&apos;s included</h2>

            <ul>
              {inclusions.map((item) => (
                <li key={item}>
                  <span>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="tour-info-column">
            <span>NOT INCLUDED</span>

            <h2>What&apos;s not included</h2>

            <ul>
              {exclusions.map((item) => (
                <li key={item}>
                  <span>—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="tour-practical">
        <div className="tour-practical-inner">
          <div className="tour-section-heading">
            <span>TRAVEL INFORMATION</span>

            <h2>
              Built around
              <br />
              authentic discovery.
            </h2>
          </div>

          <div className="tour-practical-grid">
            <div>
              <span>Duration</span>
              <strong>6 Days / 5 Nights</strong>
            </div>

            <div>
              <span>Region</span>
              <strong>Jayawijaya, Papua Highlands</strong>
            </div>

            <div>
              <span>Travel Style</span>
              <strong>Nature, Culture & Discovery</strong>
            </div>

            <div>
              <span>Group Style</span>
              <strong>Private / Small Group</strong>
            </div>
          </div>

          <p className="tour-practical-note">
            The twelve destinations represent a curated tourism
            network. The final itinerary and destination sequence
            may change according to weather, road conditions,
            accessibility, local activities, and community
            availability.
          </p>
        </div>
      </section>

      <section className="tour-detail-cta">
        <div className="tour-detail-cta-content">
          <span>PAPEG SIGNATURE JOURNEY</span>

          <h2>
            Ready to explore
            <br />
            Jayawijaya?
          </h2>

          <p>
            Tell us your preferred dates, group size, and interests.
            We can prepare the journey around your travel goals.
          </p>

          <Link
            href="/request-quote?package=12%20Destinations%20Experience"
            className="booking-primary"
          >
            Request This Journey →
          </Link>
        </div>
      </section>
    </main>
  );
}