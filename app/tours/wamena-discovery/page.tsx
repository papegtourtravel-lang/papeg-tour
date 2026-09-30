import Link from "next/link";

export const metadata = {
  title: "Wamena Discovery | Papeg Tour & Travel",
  description:
    "A 3-day introduction to Wamena, Papua Highlands, combining nature, culture, and authentic local experiences.",
};

const highlights = [
  {
    number: "01",
    title: "Baliem Valley",
    text: "Experience the dramatic highland landscapes surrounding Wamena and the Baliem Valley.",
  },
  {
    number: "02",
    title: "Local Culture",
    text: "Discover local traditions and everyday life through respectful community experiences.",
  },
  {
    number: "03",
    title: "Highland Nature",
    text: "Explore the natural beauty, fresh mountain air, and landscapes of Papua Highlands.",
  },
  {
    number: "04",
    title: "Local Perspective",
    text: "Travel with local knowledge and gain a deeper understanding of the destination.",
  },
];

const itinerary = [
  {
    day: "DAY 01",
    title: "Arrival in Wamena",
    text: "Arrive in Wamena and meet the Papeg Tour & Travel team. Transfer to your accommodation, followed by an introduction to the highland environment and local area.",
  },
  {
    day: "DAY 02",
    title: "Wamena & Baliem Valley Experience",
    text: "Explore selected landscapes and cultural locations around Wamena and the Baliem Valley. Enjoy opportunities for photography and interaction with local surroundings.",
  },
  {
    day: "DAY 03",
    title: "Final Experience & Departure",
    text: "Enjoy a final morning experience according to your departure schedule. Transfer to Wamena Airport for your onward journey.",
  },
];

const inclusions = [
  "Airport transfers in Wamena",
  "Accommodation according to the selected package",
  "Local transportation during the tour",
  "Local tour assistance",
  "Selected activities and visits in the itinerary",
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

export default function WamenaDiscoveryPage() {
  return (
    <main className="tour-detail-page">
      <section
        className="tour-detail-hero"
        style={{
          backgroundImage: "url('/images/wamena.jpg')",
        }}
      >
        <div className="tour-detail-overlay">
          <div className="tour-detail-hero-content">
            <span>3 DAYS / 2 NIGHTS • PAPUA HIGHLANDS</span>

            <h1>
              Wamena
              <br />
              Discovery
            </h1>

            <p>
              An introduction to the landscapes, culture, and local
              character of Wamena.
            </p>
          </div>
        </div>
      </section>

      <section className="tour-detail-intro">
        <div className="tour-detail-intro-content">
          <div>
            <span>WAMENA • JAYAWIJAYA</span>

            <h2>
              Your first
              <br />
              connection to Papua Highlands.
            </h2>
          </div>

          <div>
            <p>
              Wamena Discovery is designed for travelers who want to
              experience the heart of Papua Highlands in a meaningful
              and comfortable introduction.
            </p>

            <p>
              From mountain landscapes to local communities, this
              journey provides an opportunity to discover the character
              of Wamena while traveling with local knowledge and
              support.
            </p>
          </div>
        </div>
      </section>

      <section className="tour-highlights">
        <div className="tour-section-heading">
          <span>JOURNEY HIGHLIGHTS</span>

          <h2>
            Discover what makes
            <br />
            Wamena extraordinary.
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
          <span>ITINERARY</span>

          <h2>
            Three days in
            <br />
            the highlands.
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
              Designed for a
              <br />
              smooth journey.
            </h2>
          </div>

          <div className="tour-practical-grid">
            <div>
              <span>Duration</span>
              <strong>3 Days / 2 Nights</strong>
            </div>

            <div>
              <span>Location</span>
              <strong>Wamena, Jayawijaya</strong>
            </div>

            <div>
              <span>Travel Style</span>
              <strong>Nature & Culture</strong>
            </div>

            <div>
              <span>Group Style</span>
              <strong>Private / Small Group</strong>
            </div>
          </div>

          <p className="tour-practical-note">
            Itineraries may be adjusted according to weather,
            local conditions, flight schedules, and the interests
            of each traveler.
          </p>
        </div>
      </section>

      <section className="tour-detail-cta">
        <div className="tour-detail-cta-content">
          <span>START YOUR JOURNEY</span>

          <h2>
            Ready to discover
            <br />
            Wamena?
          </h2>

          <p>
            Tell us your preferred travel dates and number of
            travelers. Our team will prepare the details for your
            journey.
          </p>

          <Link
            href="/request-quote?package=Wamena%20Discovery"
            className="booking-primary"
          >
            Request This Journey →
          </Link>
        </div>
      </section>
    </main>
  );
}