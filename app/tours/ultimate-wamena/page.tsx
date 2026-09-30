import Link from "next/link";

export const metadata = {
  title: "Ultimate Wamena | Papeg Tour & Travel",
  description:
    "A 7-day private journey through Wamena and the Papua Highlands, designed around nature, culture, and authentic local experiences.",
};

const highlights = [
  {
    number: "01",
    title: "Private Journey",
    text: "A flexible travel experience designed around your interests, pace, and preferred activities.",
  },
  {
    number: "02",
    title: "Nature & Landscapes",
    text: "Explore selected highland landscapes, valleys, forests, and natural attractions around Jayawijaya.",
  },
  {
    number: "03",
    title: "Culture & Community",
    text: "Discover local traditions and community life through respectful, locally guided experiences.",
  },
  {
    number: "04",
    title: "Photography",
    text: "Enjoy additional time to observe and photograph the landscapes, culture, and everyday life of the highlands.",
  },
];

const itinerary = [
  {
    day: "DAY 01",
    title: "Arrival in Wamena",
    text: "Meet the Papeg Tour & Travel team upon arrival. Transfer to your accommodation and receive an introduction to Wamena and the journey ahead.",
  },
  {
    day: "DAY 02",
    title: "Wamena & Baliem Valley",
    text: "Begin your exploration of Wamena and the surrounding Baliem Valley. Discover selected landscapes and experience the atmosphere of the highlands.",
  },
  {
    day: "DAY 03",
    title: "Nature Exploration",
    text: "Explore selected natural attractions and landscapes according to the agreed itinerary, weather, and local accessibility.",
  },
  {
    day: "DAY 04",
    title: "Culture & Community",
    text: "Spend time discovering local traditions and community life through experiences arranged with local knowledge and coordination.",
  },
  {
    day: "DAY 05",
    title: "Extended Highland Experience",
    text: "Continue deeper into selected destinations around Jayawijaya, with time for exploration, photography, and appreciation of the natural environment.",
  },
  {
    day: "DAY 06",
    title: "Flexible Discovery Day",
    text: "A flexible day to revisit a preferred experience, explore an additional destination, or focus on photography, culture, or nature.",
  },
  {
    day: "DAY 07",
    title: "Final Morning & Departure",
    text: "Enjoy a final morning experience according to your departure schedule before transfer to Wamena Airport.",
  },
];

const inclusions = [
  "Airport transfers in Wamena",
  "Accommodation according to the selected package",
  "Local transportation during the tour",
  "Local tour assistance",
  "Selected activities and visits in the itinerary",
  "Trip coordination and basic assistance",
];

const exclusions = [
  "International or domestic airfare to and from Wamena",
  "Personal expenses",
  "Meals not specifically included",
  "Travel insurance",
  "Personal equipment and photography gear",
  "Activities outside the agreed itinerary",
];

export default function UltimateWamenaPage() {
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
            <span>7 DAYS / 6 NIGHTS • PRIVATE EXPERIENCE</span>

            <h1>
              Ultimate
              <br />
              Wamena
            </h1>

            <p>
              A deeper and more flexible journey through the heart
              of Papua Highlands.
            </p>
          </div>
        </div>
      </section>

      <section className="tour-detail-intro">
        <div className="tour-detail-intro-content">
          <div>
            <span>PRIVATE PAPUA HIGHLANDS EXPERIENCE</span>

            <h2>
              More time.
              <br />
              More discovery.
            </h2>
          </div>

          <div>
            <p>
              Ultimate Wamena is designed for travelers who want
              additional time to explore the landscapes, culture,
              and communities of Jayawijaya.
            </p>

            <p>
              With seven days available, the journey allows greater
              flexibility than a short introduction, creating space
              for nature exploration, cultural experiences,
              photography, and personal interests.
            </p>

            <p>
              The experience can be adjusted around the traveler's
              preferred pace and the conditions encountered during
              the journey.
            </p>
          </div>
        </div>
      </section>

      <section className="tour-highlights">
        <div className="tour-section-heading">
          <span>ULTIMATE HIGHLIGHTS</span>

          <h2>
            A journey with
            <br />
            room to explore.
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
          <span>7-DAY ITINERARY</span>

          <h2>
            A slower pace.
            <br />
            A deeper experience.
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
              Designed for
              <br />
              deeper exploration.
            </h2>
          </div>

          <div className="tour-practical-grid">
            <div>
              <span>Duration</span>
              <strong>7 Days / 6 Nights</strong>
            </div>

            <div>
              <span>Location</span>
              <strong>Wamena, Jayawijaya</strong>
            </div>

            <div>
              <span>Travel Style</span>
              <strong>Private & Immersive</strong>
            </div>

            <div>
              <span>Group Style</span>
              <strong>Private / Small Group</strong>
            </div>
          </div>

          <p className="tour-practical-note">
            The itinerary is flexible and may be adjusted according
            to weather, local conditions, accessibility, flight
            schedules, community availability, and traveler interests.
          </p>
        </div>
      </section>

      <section className="tour-detail-cta">
        <div className="tour-detail-cta-content">
          <span>PRIVATE PAPUA HIGHLANDS JOURNEY</span>

          <h2>
            Make Wamena
            <br />
            your own journey.
          </h2>

          <p>
            Share your preferred dates, group size, interests, and
            travel style. Papeg can tailor the journey around your
            priorities.
          </p>

          <Link
            href="/request-quote?package=Ultimate%20Wamena"
            className="booking-primary"
          >
            Request This Journey →
          </Link>
        </div>
      </section>
    </main>
  );
}