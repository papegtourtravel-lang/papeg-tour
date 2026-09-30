"use client";

import { FormEvent, useEffect, useState } from "react";
import "./booking.css";

type FlightSegment = {
  departing_at?: string;
  arriving_at?: string;
  origin?: {
    iata_code?: string;
    name?: string;
  };
  destination?: {
    iata_code?: string;
    name?: string;
  };
  marketing_carrier?: {
    name?: string;
    iata_code?: string;
  };
  operating_carrier?: {
    name?: string;
    iata_code?: string;
  };
};

type FlightOffer = {
  id?: string;
  total_amount?: string;
  total_currency?: string;
  cabin_class?: string;

  passengers?: Array<{
    id?: string;
    type?: string;
  }>;

  slices?: Array<{
    segments?: FlightSegment[];
  }>;
};

type PassengerForm = {
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  email: string;
  whatsapp: string;
  passportNumber: string;
  passportExpiry: string;
};

export default function BookingPage() {
  const [selectedFlight, setSelectedFlight] =
    useState<FlightOffer | null>(null);

  const [form, setForm] = useState<PassengerForm>({
    title: "mr",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "male",
    nationality: "",
    email: "",
    whatsapp: "",
    passportNumber: "",
    passportExpiry: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [creatingHold, setCreatingHold] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const savedFlight = sessionStorage.getItem("selectedFlight");

      if (savedFlight) {
        const parsedFlight = JSON.parse(savedFlight);
        setSelectedFlight(parsedFlight);
      }
    } catch (error) {
      console.error("Failed to load selected flight:", error);
      setError(
        "Flight information could not be loaded. Please search for the flight again."
      );
    }
  }, []);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function getRoute() {
    if (!selectedFlight?.slices?.length) {
      return "-";
    }

    const firstSlice = selectedFlight.slices[0];

    if (!firstSlice?.segments?.length) {
      return "-";
    }

    const firstSegment = firstSlice.segments[0];
    const lastSegment =
      firstSlice.segments[firstSlice.segments.length - 1];

    const origin =
      firstSegment?.origin?.iata_code ||
      firstSegment?.origin?.name ||
      "-";

    const destination =
      lastSegment?.destination?.iata_code ||
      lastSegment?.destination?.name ||
      "-";

    return `${origin} → ${destination}`;
  }

  function getAirline() {
    const segment = selectedFlight?.slices?.[0]?.segments?.[0];

    return (
      segment?.marketing_carrier?.name ||
      segment?.operating_carrier?.name ||
      "-"
    );
  }

  function getAirlineCode() {
    const segment = selectedFlight?.slices?.[0]?.segments?.[0];

    return (
      segment?.marketing_carrier?.iata_code ||
      segment?.operating_carrier?.iata_code ||
      ""
    );
  }

  function getCabin() {
    if (!selectedFlight?.cabin_class) {
      return "Economy";
    }

    return selectedFlight.cabin_class
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function getPrice() {
    if (!selectedFlight?.total_amount) {
      return "-";
    }

    const currency = selectedFlight.total_currency || "USD";

    const amount = Number(selectedFlight.total_amount);

    if (Number.isNaN(amount)) {
      return `${selectedFlight.total_amount} ${currency}`;
    }

    return `${amount.toFixed(2)} ${currency}`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    /*
     * ============================================================
     * 1. CHECK SELECTED FLIGHT
     * ============================================================
     */

    if (!selectedFlight?.id) {
      setError(
        "Selected flight information is missing. Please search for the flight again."
      );
      return;
    }

    /*
     * ============================================================
     * 2. GET DUFFEL PASSENGER ID
     * ============================================================
     *
     * Duffel membutuhkan passenger ID yang berasal dari Flight Offer.
     */

    const passengerId = selectedFlight.passengers?.[0]?.id;

    if (!passengerId) {
      setError(
        "Duffel passenger ID is missing. Please search for the flight again and select the flight again."
      );
      return;
    }

    /*
     * ============================================================
     * 3. BASIC FORM VALIDATION
     * ============================================================
     */

    if (!form.firstName.trim()) {
      setError("Please enter the passenger first name.");
      return;
    }

    if (!form.lastName.trim()) {
      setError("Please enter the passenger last name.");
      return;
    }

    if (!form.dateOfBirth) {
      setError("Please enter the passenger date of birth.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter the passenger email address.");
      return;
    }

    if (!form.whatsapp.trim()) {
      setError("Please enter the passenger WhatsApp / phone number.");
      return;
    }

    /*
     * ============================================================
     * 4. START CREATE BOOKING HOLD
     * ============================================================
     */

    setCreatingHold(true);

    try {
      /*
       * ============================================================
       * 5. CONVERT FORM DATA TO DUFFEL PASSENGER FORMAT
       * ============================================================
       */

      const passengerPayload = [
        {
          id: passengerId,

          title: form.title.toLowerCase(),

          given_name: form.firstName.trim(),

          family_name: form.lastName.trim(),

          born_on: form.dateOfBirth,

          gender:
            form.gender.toLowerCase() === "female"
              ? "f"
              : "m",

          email: form.email.trim(),

          phone_number: form.whatsapp.trim(),
        },
      ];

      console.log("Creating booking hold...");
      console.log("Offer ID:", selectedFlight.id);
      console.log("Passenger ID:", passengerId);
      console.log("Passenger:", passengerPayload);

      /*
       * ============================================================
       * 6. CALL NEXT.JS API
       * ============================================================
       */

      const response = await fetch("/api/flights/order", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          offerId: selectedFlight.id,

          passengers: passengerPayload,
        }),
      });

      /*
       * ============================================================
       * 7. READ API RESPONSE
       * ============================================================
       */

      const result = await response.json();

      console.log("Booking Hold Response:", result);

      /*
       * ============================================================
       * 8. CHECK API ERROR
       * ============================================================
       */

      if (
        !response.ok ||
        !result?.success ||
        !result?.order?.id
      ) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Unable to create booking hold."
        );
      }

      /*
       * ============================================================
       * 9. SAVE PASSENGER DETAILS
       * ============================================================
       */

      sessionStorage.setItem(
        "passengerDetails",
        JSON.stringify(form)
      );

      /*
       * ============================================================
       * 10. SAVE DUFFEL BOOKING ORDER
       * ============================================================
       *
       * Ini sangat penting.
       *
       * Review page dan Payment page akan membaca:
       *
       * sessionStorage.getItem("bookingOrder")
       *
       */

      sessionStorage.setItem(
        "bookingOrder",
        JSON.stringify(result.order)
      );

      /*
       * ============================================================
       * 11. SHOW SUCCESS MESSAGE
       * ============================================================
       */

      setSubmitted(true);

      /*
       * ============================================================
       * 12. REDIRECT TO REVIEW PAGE
       * ============================================================
       */

      setTimeout(() => {
        window.location.href = "/flights/review";
      }, 700);
    } catch (error) {
      console.error(
        "Create Booking Hold Error:",
        error
      );

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to create booking hold. Please try again."
        );
      }

      setCreatingHold(false);
    }
  }

  /*
   * ==============================================================
   * SUCCESS SCREEN
   * ==============================================================
   */

  if (submitted) {
    return (
      <main className="booking-page">
        <div className="booking-container">
          <div className="booking-success">
            <div className="booking-success-icon">
              ✓
            </div>

            <h1>Booking Hold Created</h1>

            <p>
              Your flight has been successfully placed
              on hold.
            </p>

            <p>
              Preparing your booking review...
            </p>

            <div className="booking-loading">
              Please wait...
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ==============================================================
   * MAIN PAGE
   * ==============================================================
   */

  return (
    <main className="booking-page">
      <div className="booking-container">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="booking-header">
          <p className="booking-eyebrow">
            PAPEG TOUR & TRAVEL
          </p>

          <h1>
            Passenger Details
          </h1>

          <p>
            Please enter the passenger information
            exactly as shown on the travel document.
          </p>
        </div>

        {/* ======================================================
            FLIGHT SUMMARY
        ====================================================== */}

        <section className="booking-flight-card">

          <div className="booking-flight-top">

            <div>
              <span className="booking-label">
                FLIGHT
              </span>

              <h2>
                {getRoute()}
              </h2>
            </div>

            <div className="booking-flight-price">
              {getPrice()}
            </div>

          </div>

          <div className="booking-flight-details">

            <div>
              <span className="booking-label">
                AIRLINE
              </span>

              <strong>
                {getAirline()}
              </strong>

              {getAirlineCode() && (
                <span>
                  {getAirlineCode()}
                </span>
              )}
            </div>

            <div>
              <span className="booking-label">
                CABIN
              </span>

              <strong>
                {getCabin()}
              </strong>
            </div>

            <div>
              <span className="booking-label">
                OFFER ID
              </span>

              <strong>
                {selectedFlight?.id || "-"}
              </strong>
            </div>

          </div>

        </section>

        {/* ======================================================
            ERROR MESSAGE
        ====================================================== */}

        {error && (
          <div
            className="booking-error"
            role="alert"
          >
            <strong>
              Booking Hold Failed
            </strong>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={() => setError("")}
            >
              Close
            </button>
          </div>
        )}

        {/* ======================================================
            PASSENGER FORM
        ====================================================== */}

        <form
          onSubmit={handleSubmit}
          className="booking-form"
        >

          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <section className="booking-section">

            <div className="booking-section-header">
              <h2>
                Personal Information
              </h2>

              <p>
                Passenger information
              </p>
            </div>

            <div className="booking-grid">

              {/* TITLE */}

              <div className="booking-field">

                <label htmlFor="title">
                  Title
                </label>

                <select
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  disabled={creatingHold}
                >
                  <option value="mr">
                    Mr
                  </option>

                  <option value="mrs">
                    Mrs
                  </option>

                  <option value="ms">
                    Ms
                  </option>
                </select>

              </div>

              {/* FIRST NAME */}

              <div className="booking-field">

                <label htmlFor="firstName">
                  First Name *
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  autoComplete="given-name"
                  required
                  disabled={creatingHold}
                />

              </div>

              {/* LAST NAME */}

              <div className="booking-field">

                <label htmlFor="lastName">
                  Last Name *
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  autoComplete="family-name"
                  required
                  disabled={creatingHold}
                />

              </div>

              {/* DATE OF BIRTH */}

              <div className="booking-field">

                <label htmlFor="dateOfBirth">
                  Date of Birth *
                </label>

                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  required
                  disabled={creatingHold}
                />

              </div>

              {/* GENDER */}

              <div className="booking-field">

                <label htmlFor="gender">
                  Gender *
                </label>

                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  disabled={creatingHold}
                >
                  <option value="male">
                    Male
                  </option>

                  <option value="female">
                    Female
                  </option>
                </select>

              </div>

              {/* NATIONALITY */}

              <div className="booking-field">

                <label htmlFor="nationality">
                  Nationality
                </label>

                <input
                  id="nationality"
                  name="nationality"
                  type="text"
                  value={form.nationality}
                  onChange={handleChange}
                  placeholder="e.g. Indonesian"
                  autoComplete="country-name"
                  disabled={creatingHold}
                />

              </div>

            </div>

          </section>

          {/* ==================================================
              CONTACT INFORMATION
          ================================================== */}

          <section className="booking-section">

            <div className="booking-section-header">
              <h2>
                Contact Information
              </h2>

              <p>
                We will use this information for
                booking communication.
              </p>
            </div>

            <div className="booking-grid">

              {/* EMAIL */}

              <div className="booking-field">

                <label htmlFor="email">
                  Email Address *
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  autoComplete="email"
                  required
                  disabled={creatingHold}
                />

              </div>

              {/* WHATSAPP */}

              <div className="booking-field">

                <label htmlFor="whatsapp">
                  WhatsApp / Phone *
                </label>

                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  value={form.whatsapp}
                  onChange={handleChange}
                  placeholder="+628xxxxxxxxxx"
                  autoComplete="tel"
                  required
                  disabled={creatingHold}
                />

              </div>

            </div>

          </section>

          {/* ==================================================
              PASSPORT INFORMATION
          ================================================== */}

          <section className="booking-section">

            <div className="booking-section-header">
              <h2>
                Passport Information
              </h2>

              <p>
                Enter the passport information used
                for this journey.
              </p>
            </div>

            <div className="booking-grid">

              {/* PASSPORT NUMBER */}

              <div className="booking-field">

                <label htmlFor="passportNumber">
                  Passport Number
                </label>

                <input
                  id="passportNumber"
                  name="passportNumber"
                  type="text"
                  value={form.passportNumber}
                  onChange={handleChange}
                  placeholder="Passport number"
                  autoComplete="off"
                  disabled={creatingHold}
                />

              </div>

              {/* PASSPORT EXPIRY */}

              <div className="booking-field">

                <label htmlFor="passportExpiry">
                  Passport Expiry
                </label>

                <input
                  id="passportExpiry"
                  name="passportExpiry"
                  type="date"
                  value={form.passportExpiry}
                  onChange={handleChange}
                  disabled={creatingHold}
                />

              </div>

            </div>

          </section>

          {/* ==================================================
              IMPORTANT INFORMATION
          ================================================== */}

          <div className="booking-security">

            <strong>
              Important
            </strong>

            <p>
              Please make sure the passenger name,
              date of birth, and contact details are
              correct before continuing.
            </p>

            <p>
              Your selected flight will be placed on
              hold before you continue to the booking
              review.
            </p>

          </div>

          {/* ==================================================
              ACTION BUTTONS
          ================================================== */}

          <div className="booking-actions">

            <button
              type="button"
              className="booking-back-button"
              disabled={creatingHold}
              onClick={() => {
                window.location.href =
                  "/flights";
              }}
            >
              ← Back to Flights
            </button>

            <button
              type="submit"
              className="booking-submit-button"
              disabled={
                creatingHold ||
                !selectedFlight?.id
              }
            >
              {creatingHold
                ? "Creating Booking Hold..."
                : "Continue to Review →"}
            </button>

          </div>

        </form>

      </div>
    </main>
  );
}