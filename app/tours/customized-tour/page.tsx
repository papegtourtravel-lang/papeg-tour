import Link from "next/link";

export const metadata = {
  title: "Customized Tour | Papeg Tour & Travel",
  description:
    "Create a personalized journey through Wamena and Papua Highlands with Papeg Tour & Travel.",
};

const experiences = [
  {
    number: "01",
    title: "Adventure",
    text: "Build a journey around nature exploration, landscapes, trekking, and outdoor experiences.",
  },
  {
    number: "02",
    title: "Culture",
    text: "Explore local traditions, communities, stories, and cultural experiences at your preferred pace.",
  },
  {
    number: "03",
    title: "Photography",
    text: "Create a photography-focused itinerary around landscapes, culture, people, and unique locations.",
  },
  {
    number: "04",
    title: "Research",
    text: "Develop a practical itinerary for research, documentation, field visits, or special projects.",
  },
];

const process = [
  {
    number: "01",
    title: "Tell Us Your Ideas",
    text: "Share your preferred dates, group size, interests, and the type of experience you want.",
  },
  {
    number: "02",
    title: "We Design the Journey",
    text: "Our team develops an itinerary around your priorities, available time, and local conditions.",
  },
  {
    number: "03",
    title: "Refine Together",
    text: "Review the proposed journey and make adjustments before confirming the experience.",
  },
  {
    number: "04",
    title: "Experience Papua",
    text: "Travel with local coordination and discover the Papua Highlands through a journey created for you.",
  },
];

const possibleExperiences = [
  "Nature & Adventure",
  "Culture & Community",
  "Photography",
  "Trekking",
  "Research",
  "Family Travel",
];

export default function CustomizedTourPage() {
  return (
    <main className="tour-detail-page customized-tour-page">
      <section
        className="tour-detail-hero"
        style={{
          backgroundImage: "url('/images/baliem.jpg')",
        }}
      >
        <div className="tour-detail-overlay">
          <div className="tour-detail-hero-content">
            <span>CUSTOM JOURNEY • PAPUA HIGHLANDS</span>

            <h1>
              Your Journey.
              <br />
              Your Way.
            </h1>

            <p>
              A personalized Papua Highlands experience designed
              around your interests, schedule, and travel style.
            </p>
          </div>
        </div>
      </section>

      <section className="tour-detail-intro">
        <div className="tour-detail-intro-content">
          <div>
            <span>TAILOR-MADE TRAVEL</span>

            <h2>
              There is no need
              <br />
              to follow one path.
            </h2>
          </div>

          <div>
            <p>
              Every traveler comes to Papua Highlands with a
              different reason. Some come for nature, others for
              culture, photography, research, or simply the
              opportunity to experience somewhere extraordinary.
            </p>

            <p>
              With a Customized Tour, Papeg can develop an itinerary
              around your interests, preferred pace, travel dates,
              and group requirements.
            </p>

            <p>
              Start with an idea. We will work with you to turn it
              into a practical journey.
            </p>
          </div>
        </div>
      </section>

      <section className="tour-highlights">
        <div className="tour-section-heading">
          <span>TRAVEL YOUR WAY</span>

          <h2>
            What would you like
            <br />
            to experience?
          </h2>
        </div>

        <div className="tour-highlights-grid">
          {experiences.map((item) => (
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
          <span>HOW IT WORKS</span>

          <h2>
            From your idea
            <br />
            to your journey.
          </h2>
        </div>

        <div className="tour-itinerary-list">
          {process.map((item) => (
            <article key={item.number} className="tour-itinerary-item">
              <div className="tour-itinerary-day">
                <span>{item.number}</span>
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
          <span>POSSIBLE EXPERIENCES</span>

          <h2>
            Build the journey
            <br />
            around your interests.
          </h2>
        </div>

        <div className="tour-highlights-grid">
          {possibleExperiences.map((experience, index) => (
            <article
              key={experience}
              className="tour-highlight-card"
            >
              <span>
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3>{experience}</h3>

              <p>
                This interest can be incorporated into a
                personalized itinerary according to your goals
                and available time.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="tour-practical">
        <div className="tour-practical-inner">
          <div className="tour-section-heading">
            <span>FLEXIBLE BY DESIGN</span>

            <h2>
              Designed around
              <br />
              your priorities.
            </h2>
          </div>

          <div className="tour-practical-grid">
            <div>
              <span>Duration</span>
              <strong>Flexible</strong>
            </div>

            <div>
              <span>Location</span>
              <strong>Wamena & Jayawijaya</strong>
            </div>

            <div>
              <span>Travel Style</span>
              <strong>Fully Customizable</strong>
            </div>

            <div>
              <span>Group Style</span>
              <strong>Private / Small Group</strong>
            </div>
          </div>

          <p className="tour-practical-note">
            Final itinerary, activities, transportation,
            accommodation, and pricing are discussed and confirmed
            according to your travel requirements and local
            conditions.
          </p>
        </div>
      </section>

      <section className="tour-detail-cta">
        <div className="tour-detail-cta-content">
          <span>CREATE YOUR JOURNEY</span>

          <h2>
            Tell us what
            <br />
            you want to discover.
          </h2>

          <p>
            Send us your travel dates, group size, interests, and
            ideas. Our team will help shape them into a journey
            through Papua Highlands.
          </p>

          <Link
            href="/request-quote?package=Customized%20Tour"
            className="booking-primary"
          >
            Design My Journey →
          </Link>
        </div>
      </section>
    </main>
  );
}