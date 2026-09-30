"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function RequestQuoteForm() {
  const searchParams = useSearchParams();

  const packageFromUrl = searchParams.get("package") || "Customized Tour";

  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    country: "",
    email: "",
    whatsapp: "",
    travelDate: "",
    travelers: "1",
    package: packageFromUrl,
    interests: "",
    message: "",
  });

  const packageLabel = useMemo(() => {
    return formData.package || "Customized Tour";
  }, [formData.package]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const whatsappNumber = "6281315695205";

    const message = `
Hello Papeg Tour & Travel,

I would like to request a tour quotation.

PACKAGE
${formData.package}

TRAVELER DETAILS
Name: ${formData.name}
Country: ${formData.country}
Email: ${formData.email}
WhatsApp: ${formData.whatsapp}

TRIP DETAILS
Travel Date: ${formData.travelDate}
Travelers: ${formData.travelers}

INTERESTS
${formData.interests || "Not specified"}

MESSAGE
${formData.message || "No additional message."}

Thank you.
`;

    const whatsappUrl =
      `https://wa.me/${whatsappNumber}?text=` +
      encodeURIComponent(message);

    setSubmitted(true);

    window.open(whatsappUrl, "_blank");
  };

  if (submitted) {
    return (
      <main className="quote-page">
        <section className="quote-success">
          <div className="quote-success-inner">

            <span>INQUIRY READY</span>

            <h1>
              Your Journey
              <br />
              Starts Here.
            </h1>

            <p>
              Your inquiry has been prepared and WhatsApp should now open
              with your travel details ready to send to Papeg Tour & Travel.
            </p>

            <a
              href="/"
              className="booking-primary"
            >
              Back to Homepage →
            </a>

          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="quote-page">

      {/* HERO */}
      <section className="quote-hero">

        <div className="quote-hero-overlay">

          <div className="quote-hero-content">

            <span>PLAN YOUR PAPUA JOURNEY</span>

            <h1>
              Tell Us About
              <br />
              Your Journey.
            </h1>

            <p>
              Share your travel plans with us and our team will create
              a personalized experience in the Papua Highlands.
            </p>

          </div>

        </div>

      </section>

      {/* FORM */}
      <section className="quote-section">

        <div className="quote-form-wrapper">

          <div className="quote-intro">

            <span>REQUEST A QUOTE</span>

            <h2>
              Let's design your
              <br />
              Papua experience.
            </h2>

            <p>
              Complete the form below. Your inquiry will be prepared
              and sent through WhatsApp to our Papeg Tour & Travel team.
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            {/* SELECTED PACKAGE */}
            <div className="quote-package">

              <div>
                <span>SELECTED EXPERIENCE</span>

                <strong>{packageLabel}</strong>
              </div>

              <a href="/tours">
                Change package →
              </a>

            </div>

            {/* YOUR DETAILS */}
            <div className="form-section">

              <div className="form-section-heading">
                <span>01</span>

                <div>
                  <h3>Your Details</h3>

                  <p>
                    Tell us how we can contact you.
                  </p>
                </div>
              </div>

              <div className="form-grid">

                <div className="form-group">
                  <label htmlFor="name">
                    Full Name *
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="country">
                    Country *
                  </label>

                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="e.g. Germany"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email *
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="whatsapp">
                    WhatsApp *
                  </label>

                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="+49 123 456789"
                    required
                  />
                </div>

              </div>

            </div>

            {/* TRIP DETAILS */}
            <div className="form-section">

              <div className="form-section-heading">
                <span>02</span>

                <div>
                  <h3>Trip Details</h3>

                  <p>
                    Help us understand your travel plans.
                  </p>
                </div>
              </div>

              <div className="form-grid">

                <div className="form-group">
                  <label htmlFor="travelDate">
                    Preferred Travel Date *
                  </label>

                  <input
                    id="travelDate"
                    name="travelDate"
                    type="date"
                    value={formData.travelDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="travelers">
                    Number of Travelers *
                  </label>

                  <select
                    id="travelers"
                    name="travelers"
                    value={formData.travelers}
                    onChange={handleChange}
                    required
                  >
                    <option value="1">1 traveler</option>
                    <option value="2">2 travelers</option>
                    <option value="3">3 travelers</option>
                    <option value="4">4 travelers</option>
                    <option value="5">5 travelers</option>
                    <option value="6">6 travelers</option>
                    <option value="7">7 travelers</option>
                    <option value="8">8 travelers</option>
                    <option value="9">9 travelers</option>
                    <option value="10">10 travelers</option>
                    <option value="11-15">11–15 travelers</option>
                    <option value="16-20">16–20 travelers</option>
                    <option value="20+">More than 20 travelers</option>
                  </select>
                </div>

              </div>

            </div>

            {/* INTERESTS */}
            <div className="form-section">

              <div className="form-section-heading">
                <span>03</span>

                <div>
                  <h3>Your Interests</h3>

                  <p>
                    Tell us what kind of experience you are looking for.
                  </p>
                </div>
              </div>

              <div className="interest-options">

                {[
                  "Nature & Adventure",
                  "Culture & Community",
                  "Photography",
                  "Trekking",
                  "Research",
                  "Family Travel",
                ].map((interest) => (
                  <label key={interest} className="interest-option">

                    <input
                      type="checkbox"
                      value={interest}
                      checked={formData.interests
                        .split(", ")
                        .includes(interest)}
                      onChange={(event) => {
                        const selected =
                          formData.interests
                            ? formData.interests
                                .split(", ")
                                .filter(Boolean)
                            : [];

                        if (event.target.checked) {
                          selected.push(interest);
                        } else {
                          const index = selected.indexOf(interest);

                          if (index !== -1) {
                            selected.splice(index, 1);
                          }
                        }

                        setFormData((current) => ({
                          ...current,
                          interests: selected.join(", "),
                        }));
                      }}
                    />

                    <span>{interest}</span>

                  </label>
                ))}

              </div>

            </div>

            {/* MESSAGE */}
            <div className="form-section">

              <div className="form-section-heading">
                <span>04</span>

                <div>
                  <h3>Additional Information</h3>

                  <p>
                    Anything else we should know?
                  </p>
                </div>
              </div>

              <div className="form-group">

                <label htmlFor="message">
                  Your Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your interests, special requests, accommodation preferences, or anything else..."
                  rows={7}
                />

              </div>

            </div>

            {/* SUBMIT */}
            <div className="quote-submit">

              <div>
                <strong>Ready to begin?</strong>

                <span>
                  Your inquiry will open in WhatsApp.
                </span>
              </div>

              <button
                type="submit"
                className="booking-primary"
              >
                Send Inquiry
                <span>→</span>
              </button>

            </div>

          </form>

        </div>

      </section>

    </main>
  );
}

export default function RequestQuotePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RequestQuoteForm />
    </Suspense>
  );
}