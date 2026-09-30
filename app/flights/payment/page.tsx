"use client";

import { useEffect, useState } from "react";
import "./payment.css";

type FlightOffer = {
  id?: string;
  total_amount?: string;
  total_currency?: string;
  cabin_class?: string;

  slices?: Array<{
    segments?: Array<{
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

      flight_number?: string;
    }>;
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

export default function FlightPaymentPage() {
  const [selectedFlight, setSelectedFlight] =
    useState<FlightOffer | null>(null);

  const [passenger, setPassenger] =
    useState<Passenger | null>(null);

  const [order, setOrder] =
    useState<BookingOrder | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [paymentSubmitted, setPaymentSubmitted] =
    useState(false);

  const [error, setError] =
    useState("");

  const [paymentAmount, setPaymentAmount] =
    useState<number | null>(null);

  useEffect(() => {
    try {
      const savedFlight =
        sessionStorage.getItem("selectedFlight");

      const savedPassenger =
        sessionStorage.getItem("passengerDetails");

      const savedOrder =
        sessionStorage.getItem("bookingOrder");

      if (savedFlight) {
        setSelectedFlight(
          JSON.parse(savedFlight)
        );
      }

      if (savedPassenger) {
        const parsedPassenger =
          JSON.parse(savedPassenger);

        if (Array.isArray(parsedPassenger)) {
          setPassenger(
            parsedPassenger[0] || null
          );
        } else {
          setPassenger(parsedPassenger);
        }
      }

      if (savedOrder) {
        setOrder(
          JSON.parse(savedOrder)
        );
      }
    } catch {
      setError(
        "Unable to restore your booking information."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  function getFirstName() {
    return (
      passenger?.firstName ||
      passenger?.given_name ||
      ""
    );
  }

  function getLastName() {
    return (
      passenger?.lastName ||
      passenger?.family_name ||
      ""
    );
  }

  function getFullName() {
    const title =
      passenger?.title || "";

    return `${title} ${getFirstName()} ${getLastName()}`
      .trim()
      .replace(/\s+/g, " ") || "-";
  }

  function getEmail() {
    return passenger?.email || "-";
  }

  function getWhatsApp() {
    return (
      passenger?.whatsapp ||
      passenger?.phone_number ||
      "-"
    );
  }

  function getPassport() {
    return (
      passenger?.passportNumber ||
      "-"
    );
  }

  function getRoute() {
    const segments =
      selectedFlight?.slices?.[0]?.segments ||
      [];

    if (!segments.length) {
      return "-";
    }

    const first =
      segments[0];

    const last =
      segments[segments.length - 1];

    const origin =
      first?.origin?.iata_code ||
      "-";

    const destination =
      last?.destination?.iata_code ||
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

  function getFlightNumber() {
    return (
      selectedFlight
        ?.slices?.[0]
        ?.segments?.[0]
        ?.flight_number ||
      "-"
    );
  }

  function getPrice() {
    const amount =
      order?.total_amount ||
      selectedFlight?.total_amount;

    const currency =
      order?.total_currency ||
      selectedFlight?.total_currency ||
      "";

    if (!amount) {
      return "-";
    }

    return `${amount} ${currency}`;
  }

  function getPaymentPrice() {
    if (
      paymentAmount === null
    ) {
      return "Calculating...";
    }

    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }
    ).format(paymentAmount);
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

  async function handlePayment() {
    setError("");

    if (!order?.id) {
      setError(
        "Booking order information is missing."
      );
      return;
    }

    if (!paymentMethod) {
      setError(
        "Please select a payment method."
      );
      return;
    }

    setProcessing(true);

    try {
      const firstName =
        getFirstName();

      const lastName =
        getLastName();

      const email =
        passenger?.email || "";

      const phone =
        passenger?.whatsapp ||
        passenger?.phone_number ||
        "";

      const response =
        await fetch(
          "/api/payment/create",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              orderId:
                order.id,

              customer: {
                firstName,
                lastName,
                email,
                phone,
              },
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
          "Failed to create Midtrans payment."
        );
      }

      if (
        !data.redirect_url
      ) {
        throw new Error(
          "Midtrans did not return a checkout URL."
        );
      }

      const finalAmount =
        Number(
          data?.payment?.amount
        );

      if (
        !Number.isFinite(
          finalAmount
        ) ||
        finalAmount <= 0
      ) {
        throw new Error(
          "Invalid payment amount received from server."
        );
      }

      setPaymentAmount(
        finalAmount
      );

      sessionStorage.setItem(
        "midtransPayment",
        JSON.stringify({
          orderId:
            order.id,

          midtransOrderId:
            `PAPEG-${order.id}`,

          amount:
            finalAmount,

          currency:
            "IDR",

          duffelAmount:
            data?.duffel?.amount ||
            0,

          duffelCurrency:
            data?.duffel?.currency ||
            "",

          paymentMethod,
        })
      );

      window.location.href =
        data.redirect_url;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Payment request could not be created."
      );

      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <main className="payment-page">
        <section className="payment-content">
          <div className="payment-container">
            <div className="payment-card">
              <h2>
                Loading payment details...
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

  if (!selectedFlight || !order) {
    return (
      <main className="payment-page">
        <section className="payment-content">
          <div className="payment-container">
            <div className="payment-card">

              <span className="section-label">
                PAYMENT
              </span>

              <h2>
                Booking information not found
              </h2>

              <p>
                We could not restore your
                booking information.
              </p>

              <button
                type="button"
                className="primary-button"
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

  if (paymentSubmitted) {
    return (
      <main className="payment-page">

        <section className="payment-hero">
          <div className="payment-container">

            <div className="payment-brand">
              PAPEG TOUR & TRAVEL
            </div>

            <h1>
              Payment Request Created
            </h1>

            <p>
              Your payment request has been
              recorded and is waiting for
              payment verification.
            </p>

          </div>
        </section>

        <section className="payment-content">
          <div className="payment-container">

            <div className="success-card">

              <div className="success-icon">
                ✓
              </div>

              <span className="section-label">
                PAYMENT STATUS
              </span>

              <h2>
                Payment Pending
              </h2>

              <p>
                Your booking remains on hold.
                Payment must be completed and
                verified before ticket issuance.
              </p>

              <div className="success-details">

                <div>
                  <span>
                    Booking Reference
                  </span>

                  <strong>
                    {order.booking_reference ||
                      order.id ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>
                    Payment Method
                  </span>

                  <strong>
                    {paymentMethod}
                  </strong>
                </div>

                <div>
                  <span>
                    Amount
                  </span>

                  <strong>
                    {paymentAmount !== null
                      ? getPaymentPrice()
                      : getPrice()}
                  </strong>
                </div>

                <div>
                  <span>
                    Passenger
                  </span>

                  <strong>
                    {getFullName()}
                  </strong>
                </div>

              </div>

              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  window.location.href =
                    "/";
                }}
              >
                Back to Papeg Tour & Travel
              </button>

            </div>

          </div>
        </section>

        <footer className="payment-footer">
          <p>
            Papeg Tour & Travel • Papua Highlands • Indonesia
          </p>
        </footer>

      </main>
    );
  }

  return (
    <main className="payment-page">

      <section className="payment-hero">

        <div className="payment-container">

          <div className="payment-brand">
            PAPEG TOUR & TRAVEL
          </div>

          <h1>
            Complete Your Payment
          </h1>

          <p>
            Review your booking and select
            your preferred payment method.
          </p>

          <div className="payment-progress">

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

            <div className="progress-item completed">
              <span className="progress-number">
                ✓
              </span>

              <span>
                Review
              </span>
            </div>

            <div className="progress-line completed-line" />

            <div className="progress-item active">
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

      <section className="payment-content">

        <div className="payment-container payment-grid">

          <div className="payment-main">

            <section className="payment-card">

              <div className="card-heading">

                <div>
                  <span className="section-label">
                    BOOKING
                  </span>

                  <h2>
                    Booking Information
                  </h2>
                </div>

                <div className="status-badge">
                  On Hold
                </div>

              </div>

              <div className="details-grid">

                <div className="detail-item">
                  <span>
                    Booking Reference
                  </span>

                  <strong>
                    {order.booking_reference ||
                      order.id ||
                      "-"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    Order ID
                  </span>

                  <strong>
                    {order.id || "-"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    Route
                  </span>

                  <strong>
                    {getRoute()}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    Airline
                  </span>

                  <strong>
                    {getAirline()}
                  </strong>
                </div>

              </div>

            </section>

            <section className="payment-card">

              <span className="section-label">
                PASSENGER
              </span>

              <h2>
                Passenger Information
              </h2>

              {passenger ? (
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
                      {passenger.dateOfBirth ||
                        passenger.born_on ||
                        "-"}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>
                      Email
                    </span>

                    <strong>
                      {getEmail()}
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

                  <div className="detail-item">
                    <span>
                      Passport
                    </span>

                    <strong>
                      {getPassport()}
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

            <section className="payment-card">

              <span className="section-label">
                FLIGHT
              </span>

              <h2>
                Selected Flight
              </h2>

              <div className="flight-box">

                <div>
                  <span>
                    Route
                  </span>

                  <strong>
                    {getRoute()}
                  </strong>
                </div>

                <div>
                  <span>
                    Airline
                  </span>

                  <strong>
                    {getAirline()}
                  </strong>
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

              </div>

            </section>

            <section className="payment-card">

              <span className="section-label">
                PAYMENT METHOD
              </span>

              <h2>
                Select Payment Method
              </h2>

              <p className="payment-description">
                Choose how you would like to
                complete your payment.
              </p>

              <div className="payment-methods">

                <label
                  className={`payment-option ${
                    paymentMethod ===
                    "Bank Transfer"
                      ? "selected"
                      : ""
                  }`}
                >

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Bank Transfer"
                    checked={
                      paymentMethod ===
                      "Bank Transfer"
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                  />

                  <div>
                    <strong>
                      Bank Transfer
                    </strong>

                    <span>
                      Pay via bank transfer.
                    </span>
                  </div>

                </label>

                <label
                  className={`payment-option ${
                    paymentMethod ===
                    "Virtual Account"
                      ? "selected"
                      : ""
                  }`}
                >

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Virtual Account"
                    checked={
                      paymentMethod ===
                      "Virtual Account"
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                  />

                  <div>
                    <strong>
                      Virtual Account
                    </strong>

                    <span>
                      Pay using a virtual account.
                    </span>
                  </div>

                </label>

                <label
                  className={`payment-option ${
                    paymentMethod ===
                    "Credit / Debit Card"
                      ? "selected"
                      : ""
                  }`}
                >

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Credit / Debit Card"
                    checked={
                      paymentMethod ===
                      "Credit / Debit Card"
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                  />

                  <div>
                    <strong>
                      Credit / Debit Card
                    </strong>

                    <span>
                      Pay using a payment card.
                    </span>
                  </div>

                </label>

              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <button
                type="button"
                className="primary-button"
                onClick={handlePayment}
                disabled={processing}
              >
                {processing
                  ? "Processing..."
                  : "Continue to Payment"}
              </button>

              <p className="secure-note">
                Your booking is on hold. Payment
                will be processed through the
                selected payment gateway.
              </p>

            </section>

          </div>

          <aside className="payment-sidebar">

            <div className="price-card">

              <span className="section-label">
                PAYMENT SUMMARY
              </span>

              <h2>
                Total Amount
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
                  1 Adult
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

              <div className="payment-security">

                <strong>
                  Secure Booking
                </strong>

                <span>
                  Your booking information is
                  handled securely by Papeg Tour &
                  Travel.
                </span>

              </div>

            </div>

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

            <button
              type="button"
              className="back-button"
              onClick={() => {
                window.location.href =
                  "/flights/review";
              }}
            >
              ← Back to Review
            </button>

          </aside>

        </div>

      </section>

      <footer className="payment-footer">
        <p>
          Papeg Tour & Travel • Papua Highlands • Indonesia
        </p>
      </footer>

    </main>
  );
}