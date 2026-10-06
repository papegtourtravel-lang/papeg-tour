
"use client";

import { useEffect, useState } from "react";
import "./review.css";
import {
  useCurrency,
  type Currency,
} from "../../components/CurrencyProvider";

type FlightSegment = {
  departing_at?: string;
  arriving_at?: string;
  origin?: {
    iata_code?: string;
  };
  destination?: {
    iata_code?: string;
  };
  marketing_carrier?: {
    name?: string;
    iata_code?: string;
  };
  operating_carrier?: {
    name?: string;
    iata_code?: string;
  };
  flight_number?: string;
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
    duration?: string;
    segments?: FlightSegment[];
  }>;
};

type Passenger = {
  id?: string;

  title?: string;

  firstName?: string;
  lastName?: string;

  given_name?: string;
  family_name?: string;

  dateOfBirth?: string;
  born_on?: string;

  gender?: string;
  nationality?: string;

  email?: string;

  whatsapp?: string;
  phone_number?: string;

  passportNumber?: string;
  passportExpiry?: string;
};

type BookingOrder = {
  id?: string;
  booking_reference?: string;
  type?: string;
  status?: string;
  total_amount?: string;
  total_currency?: string;
  created_at?: string;
};

const EUR_IDR = 20453.78;
const USD_IDR = 17000;

export default function FlightReviewPage() {
  const { currency } = useCurrency();

  const [selectedFlight, setSelectedFlight] =
    useState<FlightOffer | null>(null);

  const [passenger, setPassenger] =
    useState<Passenger[]>([]);

  const [order, setOrder] =
    useState<BookingOrder | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    try {
      const savedFlight =
        sessionStorage.getItem("selectedFlight");

      const savedPassengers =
        sessionStorage.getItem("bookingPassengers");

      const savedOrder =
        sessionStorage.getItem("bookingOrder");

      if (savedFlight) {
        setSelectedFlight(
          JSON.parse(savedFlight)
        );
      }

      if (savedPassengers) {
        const parsedPassengers =
          JSON.parse(savedPassengers);

        setPassenger(
          Array.isArray(parsedPassengers)
            ? parsedPassengers
            : [parsedPassengers]
        );
      }

      if (savedOrder) {
        setOrder(
          JSON.parse(savedOrder)
        );
      }
    } catch {
      // Ignore invalid session data
    } finally {
      setLoading(false);
    }
  }, []);

  const firstPassenger =
    passenger.length > 0
      ? passenger[0]
      : null;

  function getFirstName() {
    return (
      firstPassenger?.firstName ||
      firstPassenger?.given_name ||
      ""
    );
  }

  function getLastName() {
    return (
      firstPassenger?.lastName ||
      firstPassenger?.family_name ||
      ""
    );
  }

  function getDateOfBirth() {
    return (
      firstPassenger?.dateOfBirth ||
      firstPassenger?.born_on ||
      "-"
    );
  }

  function getWhatsApp() {
    return (
      firstPassenger?.whatsapp ||
      firstPassenger?.phone_number ||
      "-"
    );
  }

  function getFullName() {
    const title =
      firstPassenger?.title || "";

    const firstName =
      getFirstName();

    const lastName =
      getLastName();

    return `${title} ${firstName} ${lastName}`
      .trim()
      .replace(/\s+/g, " ") || "-";
  }

  function getRoute() {
    const slices =
      selectedFlight?.slices || [];

    if (!slices.length) {
      return "-";
    }

    const segments =
      slices[0]?.segments || [];

    if (!segments.length) {
      return "-";
    }

    const firstSegment =
      segments[0];

    const lastSegment =
      segments[segments.length - 1];

    const origin =
      firstSegment?.origin?.iata_code ||
      "-";

    const destination =
      lastSegment?.destination?.iata_code ||
      "-";

    return `${origin} → ${destination}`;
  }

  function getAirline() {
    return (
      selectedFlight
        ?.slices?.[0]
        ?.segments?.[0]
        ?.marketing_carrier?.name ||
      "-"
    );
  }

  function getAirlineCode() {
    return (
      selectedFlight
        ?.slices?.[0]
        ?.segments?.[0]
        ?.marketing_carrier?.iata_code ||
      "-"
    );
  }

  function getFlightNumber() {
    return (
      selectedFlight
        ?.slices?.[0]
        ?.segments?.[0]
        ?.flight_number ||
      "-"
    );
  }

  function getCabin() {
    if (!selectedFlight?.cabin_class) {
      return "Economy";
    }

    return selectedFlight.cabin_class
      .replace("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  /*
   * Mendapatkan harga asli dari booking.
   */
  function getOriginalAmount() {
    const amount =
      order?.total_amount ||
      selectedFlight?.total_amount;

    if (!amount) {
      return null;
    }

    const numericAmount =
      Number(amount);

    if (!Number.isFinite(numericAmount)) {
      return null;
    }

    return numericAmount;
  }

  /*
   * Mendapatkan currency asli dari booking.
   */
  function getOriginalCurrency() {
    return (
      order?.total_currency ||
      selectedFlight?.total_currency ||
      "IDR"
    ).toUpperCase();
  }

  /*
   * Mengubah harga ke currency yang
   * dipilih pelanggan di Header.
   */
  function convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: Currency
  ) {
    const from =
      fromCurrency.toUpperCase();

    if (from === toCurrency) {
      return amount;
    }

    // IDR → USD / EUR
    if (from === "IDR") {
      if (toCurrency === "USD") {
        return amount / USD_IDR;
      }

      if (toCurrency === "EUR") {
        return amount / EUR_IDR;
      }

      return amount;
    }

    // EUR → IDR / USD
    if (from === "EUR") {
      if (toCurrency === "IDR") {
        return amount * EUR_IDR;
      }

      if (toCurrency === "USD") {
        return (
          amount *
          EUR_IDR /
          USD_IDR
        );
      }

      return amount;
    }

    // USD → IDR / EUR
    if (from === "USD") {
      if (toCurrency === "IDR") {
        return amount * USD_IDR;
      }

      if (toCurrency === "EUR") {
        return (
          amount *
          USD_IDR /
          EUR_IDR
        );
      }

      return amount;
    }

    return amount;
  }

  /*
   * Harga yang ditampilkan kepada pelanggan.
   */
  function getDisplayAmount() {
    const originalAmount =
      getOriginalAmount();

    if (originalAmount === null) {
      return null;
    }

    const originalCurrency =
      getOriginalCurrency();

    return convertAmount(
      originalAmount,
      originalCurrency,
      currency
    );
  }

  /*
   * Format harga sesuai currency pilihan.
   */
  function getPrice() {
    const amount =
      getDisplayAmount();

    if (amount === null) {
      return "-";
    }

    return new Intl.NumberFormat(
      currency === "IDR"
        ? "id-ID"
        : currency === "USD"
        ? "en-US"
        : "de-DE",
      {
        style: "currency",
        currency,
        maximumFractionDigits:
          currency === "IDR" ? 0 : 2,
      }
    ).format(amount);
  }

  function formatDate(date?: string) {
    if (!date) {
      return "-";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleString(
      "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  function getBookingStatus() {
    if (order?.status === "confirmed") {
      return "Confirmed";
    }

    if (order?.status === "pending") {
      return "Pending";
    }

    return "On Hold";
  }

  function continueToPayment() {
    if (!order?.id) {
      alert(
        "Booking order information is missing."
      );
      return;
    }

    window.location.href =
      "/flights/payment";
  }

  if (loading) {
    return (
      <main className="review-page">
        <section className="review-content">
          <div className="review-container">
            <div className="review-card">
              <h2>
                Loading booking details...
              </h2>

              <p>
                Please wait while we restore
                your booking information.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!selectedFlight) {
    return (
      <main className="review-page">
        <section className="review-content">
          <div className="review-container">
            <div className="review-card">
              <span className="section-label">
                BOOKING
              </span>

              <h2>
                Flight information not found
              </h2>

              <p>
                Your selected flight could not
                be restored.
              </p>

              <button
                type="button"
                className="confirm-button"
                onClick={() => {
                  window.location.href =
                    "/flight";
                }}
              >
                Search Flight Again
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="review-page">

      {/* HERO */}
      <section className="review-hero">
        <div className="review-container">

          <div className="review-brand">
            PAPEG TOUR & TRAVEL
          </div>

          <h1>
            Review Your Booking
          </h1>

          <p>
            Your flight has been placed on
            hold. Please review the booking
            details before continuing to payment.
          </p>

          {/* PROGRESS */}
          <div className="review-progress">

            <div className="progress-item completed">
              <span className="progress-number">
                ✓
              </span>

              <span>
                Flight
              </span>
            </div>

            <div className="progress-line completed-line" />

            <div className="progress-item completed">
              <span className="progress-number">
                ✓
              </span>

              <span>
                Passenger
              </span>
            </div>

            <div className="progress-line completed-line" />

            <div className="progress-item active">
              <span className="progress-number">
                3
              </span>

              <span>
                Review
              </span>
            </div>

            <div className="progress-line" />

            <div className="progress-item">
              <span className="progress-number">
                4
              </span>

              <span>
                Payment
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* CONTENT */}
      <section className="review-content">
        <div className="review-container review-grid">

          {/* LEFT */}
          <div className="review-main">

            {/* HOLD STATUS */}
            <section className="review-card hold-card">

              <div className="hold-icon">
                ✓
              </div>

              <div>
                <span className="section-label">
                  BOOKING HOLD
                </span>

                <h2>
                  Your Flight Is On Hold
                </h2>

                <p>
                  Your selected flight has
                  successfully been placed on
                  hold with Papeg Tour & Travel.
                </p>
              </div>

            </section>

            {/* ORDER */}
            <section className="review-card">

              <div className="card-heading">
                <div>
                  <span className="section-label">
                    BOOKING REFERENCE
                  </span>

                  <h2>
                    Booking Information
                  </h2>
                </div>

                <div className="status-badge">
                  {getBookingStatus()}
                </div>
              </div>

              <div className="details-grid">

                <div className="detail-item">
                  <span>
                    Order ID
                  </span>

                  <strong>
                    {order?.id || "-"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    Booking Reference
                  </span>

                  <strong>
                    {order?.booking_reference || "-"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    Booking Type
                  </span>

                  <strong>
                    Flight Hold
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    Status
                  </span>

                  <strong>
                    {getBookingStatus()}
                  </strong>
                </div>

              </div>

            </section>

            {/* FLIGHT */}
            <section className="review-card">

              <div className="card-heading">
                <div>
                  <span className="section-label">
                    FLIGHT DETAILS
                  </span>

                  <h2>
                    Your Selected Flight
                  </h2>
                </div>

                <div className="status-badge">
                  Held
                </div>
              </div>

              <div className="flight-summary">

                <div className="flight-route">
                  <span className="route-code">
                    {getRoute()}
                  </span>

                  <span className="route-label">
                    Flight itinerary
                  </span>
                </div>

                <div className="flight-info">

                  <div>
                    <span>
                      Airline
                    </span>

                    <strong>
                      {getAirline()}
                    </strong>

                    <small>
                      {getAirlineCode()}
                    </small>
                  </div>

                  <div>
                    <span>
                      Flight
                    </span>

                    <strong>
                      {getFlightNumber()}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Cabin
                    </span>

                    <strong>
                      {getCabin()}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Departure
                    </span>

                    <strong>
                      {formatDate(
                        selectedFlight
                          ?.slices?.[0]
                          ?.segments?.[0]
                          ?.departing_at
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Arrival
                    </span>

                    <strong>
                      {formatDate(
                        selectedFlight
                          ?.slices?.[0]
                          ?.segments?.[
                            selectedFlight
                              ?.slices?.[0]
                              ?.segments?.length
                              ? selectedFlight
                                  .slices[0]
                                  .segments.length - 1
                              : 0
                          ]
                          ?.arriving_at
                      )}
                    </strong>
                  </div>

                </div>

              </div>

            </section>

            {/* PASSENGER */}
            <section className="review-card">

              <div className="card-heading">
                <div>
                  <span className="section-label">
                    PASSENGER INFORMATION
                  </span>

                  <h2>
                    Passenger Details
                  </h2>
                </div>
              </div>

              {firstPassenger ? (
                <div className="details-grid">

                  <div className="detail-item">
                    <span>
                      Full Name
                    </span>

                    <strong>
                      {getFullName()}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>
                      Date of Birth
                    </span>

                    <strong>
                      {getDateOfBirth()}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>
                      Gender
                    </span>

                    <strong className="capitalize">
                      {firstPassenger.gender || "-"}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>
                      Nationality
                    </span>

                    <strong>
                      {firstPassenger.nationality || "-"}
                    </strong>
                  </div>

                </div>
              ) : (
                <p className="empty-message">
                  Passenger information is not
                  available.
                </p>
              )}

            </section>

            {/* PASSPORT */}
            <section className="review-card">

              <div className="card-heading">
                <div>
                  <span className="section-label">
                    TRAVEL DOCUMENT
                  </span>

                  <h2>
                    Passport Information
                  </h2>
                </div>

                <div className="document-badge">
                  Passport
                </div>
              </div>

              {firstPassenger ? (
                <div className="details-grid">

                  <div className="detail-item">
                    <span>
                      Passport Number
                    </span>

                    <strong>
                      {firstPassenger.passportNumber || "-"}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>
                      Passport Expiry
                    </span>

                    <strong>
                      {firstPassenger.passportExpiry || "-"}
                    </strong>
                  </div>

                </div>
              ) : (
                <p className="empty-message">
                  Passport information is not
                  available.
                </p>
              )}

            </section>

            {/* CONTACT */}
            <section className="review-card">

              <div className="card-heading">
                <div>
                  <span className="section-label">
                    CONTACT INFORMATION
                  </span>

                  <h2>
                    Communication Details
                  </h2>
                </div>
              </div>

              {firstPassenger ? (
                <div className="details-grid">

                  <div className="detail-item">
                    <span>
                      Email
                    </span>

                    <strong>
                      {firstPassenger.email || "-"}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>
                      WhatsApp
                    </span>

                    <strong>
                      {getWhatsApp()}
                    </strong>
                  </div>

                </div>
              ) : (
                <p className="empty-message">
                  Contact information is not
                  available.
                </p>
              )}

            </section>

          </div>

          {/* RIGHT */}
          <aside className="review-sidebar">

            <div className="price-card">

              <span className="section-label">
                BOOKING SUMMARY
              </span>

              <h2>
                Total Price
              </h2>

              <div className="total-price">
                {getPrice()}
              </div>

              <div className="price-divider" />

              <div className="price-row">
                <span>
                  Flight
                </span>

                <strong>
                  {getPrice()}
                </strong>
              </div>

              <div className="price-row">
                <span>
                  Passenger
                </span>

                <strong>
                  {passenger.length}{" "}
                  {passenger.length === 1
                    ? "Adult"
                    : "Adults"}
                </strong>
              </div>

              <div className="price-divider" />

              <div className="price-total-row">
                <span>
                  Total
                </span>

                <strong>
                  {getPrice()}
                </strong>
              </div>

              <button
                type="button"
                onClick={continueToPayment}
                className="confirm-button"
                disabled={!order?.id}
              >
                Continue to Payment
              </button>

              <p className="secure-note">
                Your booking is currently on
                hold. Payment and ticketing are
                handled in the next step.
              </p>

            </div>

            {/* IMPORTANT */}
            <div className="important-card">

              <div className="important-icon">
                !
              </div>

              <div>
                <h3>
                  Important
                </h3>

                <p>
                  A booking hold is not yet a
                  ticket. Payment and ticket
                  issuance must be completed before
                  your journey.
                </p>
              </div>

            </div>

            {/* BACK */}
            <button
              type="button"
              className="back-button"
              onClick={() => {
                window.location.href =
                  "/flights/booking";
              }}
            >
              ← Edit Passenger Details
            </button>

          </aside>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="review-footer">
        Papeg Tour & Travel • Papua Highlands • Indonesia
      </footer>

    </main>
  );
}