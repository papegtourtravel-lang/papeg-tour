import Link from "next/link";

export const metadata = {
  title: "Baliem Nature & Culture | Papeg Tour & Travel",
  description:
    "A 5-day journey through the landscapes, culture, and communities of Baliem Valley in Papua Highlands.",
};

const highlights = [
  {
    number: "01",
    title: "Baliem Valley",
    text: "Discover spectacular highland landscapes surrounded by mountains, valleys, and traditional settlements.",
  },
  {
    number: "02",
    title: "Living Culture",
    text: "Experience the cultural character of the highlands through respectful encounters and local perspectives.",
  },
  {
    number: "03",
    title: "Nature Exploration",
    text: "Travel through selected natural locations and experience the atmosphere of Papua Highlands.",
  },
  {
    number: "04",
    title: "Photography",
    text: "Enjoy opportunities to capture landscapes, architecture, people, and everyday life.",
  },
];

const itinerary = [
  {
    day: "DAY 01",
    title: "Arrival in Wamena",
    text: "Meet the Papeg Tour & Travel team upon arrival in Wamena. Transfer to your accommodation and receive a briefing about the journey and local environment.",
  },
  {
    day: "DAY 02",
    title: "Baliem Valley Exploration",
    text: "Begin exploring the landscapes around Baliem Valley. Discover viewpoints, natural surroundings, and selected locations that reveal the character of the highlands.",
  },
  {
    day: "DAY 03",
    title: "Culture & Community",
    text: "Spend the day discovering local traditions and community life. Activities are arranged according to local conditions and the agreed itinerary.",
  },
  {
    day: "DAY 04",
    title: "Nature & Photography",
    text: "Continue the journey through selected natural and cultural locations. Enjoy time for photography, exploration, and experiencing the highland atmosphere.",
  },
  {
    day: "DAY 05",
    title: "Final Experience & Departure",
    text: "Enjoy a final morning experience according to your departure schedule before transferring to Wamena Airport for your onward journey.",
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

export default function BaliemNatureCulturePage() {
  return (
    <main className="tour-detail-page">
      <section
        className="tour-detail-hero"
        style={{
          backgroundImage: "url('/images/baliem.jpg')",
        }}
      >
        <div className="tour-detail-overlay">
          <div className="tour-detail-hero-content">
            <span>5 DAYS / 4 NIGHTS • PAPUA HIGHLANDS</span>

            <h1>
              Baliem Nature
              <br />
              & Culture
            </h1>

            <p>
              A deeper journey into the landscapes, traditions, and
              communities of Baliem Valley.
            </p>
          </div>
        </div>
      </section>

      <section className="tour-detail-intro">
        <div className="tour-detail-intro-content">
          <div>
            <span>BALIEM VALLEY • JAYAWIJAYA</span>

            <h2>
              Where nature
              <br />
              meets living culture.
            </h2>
          </div>

          <div>
            <p>
              Baliem Nature & Culture is designed for travelers who
              want more than a brief introduction to Wamena.
            </p>

            <p>
              Over five days, discover the dramatic landscapes of
              Baliem Valley while experiencing the cultural character
              and local communities of Papua Highlands.
            </p>

            <p>
              The journey balances exploration, cultural discovery,
              photography, and time to appreciate the highland
              environment.
            </p>
          </div>
        </div>
      </section>

      <section className="tour-highlights">
        <div className="tour-section-heading">
          <span>JOURNEY HIGHLIGHTS</span>

          <h2>
            Five days of
            <br />
            meaningful discovery.
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
            Five days across
            <br />
            the Baliem Highlands.
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
              A journey shaped
              <br />
              around the highlands.
            </h2>
          </div>

          <div className="tour-practical-grid">
            <div>
              <span>Duration</span>
              <strong>5 Days / 4 Nights</strong>
            </div>

            <div>
              <span>Location</span>
              <strong>Baliem Valley, Jayawijaya</strong>
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
            local conditions, flight schedules, community
            availability, and the interests of each traveler.
          </p>
        </div>
      </section>

      <section className="tour-detail-cta">
        <div className="tour-detail-cta-content">
          <span>START YOUR JOURNEY</span>

          <h2>
            Experience the
            <br />
            Baliem Valley.
          </h2>

          <p>
            Share your preferred travel dates and number of
            travelers with us. Our team will prepare the details
            of your journey.
          </p>

          <Link
            href="/request-quote?package=Baliem%20Nature%20%26%20Culture"
            className="booking-primary"
          >
            Request This Journey →
          </Link>
        </div>
      </section>
    </main>
  );
}