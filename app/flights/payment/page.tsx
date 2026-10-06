"use client";

import { useEffect, useState } from "react";
import "./payment.css";
import {
  useCurrency,
  type Currency,
} from "../../components/CurrencyProvider";

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

const EUR_IDR = 20453.78;
const USD_IDR = 17000;

export default function FlightPaymentPage() {
  const { currency } = useCurrency();

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

  const [verifyingPayment, setVerifyingPayment] =
    useState(false);

  const [verificationMessage, setVerificationMessage] =
    useState(
      "We are verifying your payment and preparing your ticket."
    );

  const [error, setError] =
    useState("");

  const [paymentAmount, setPaymentAmount] =
    useState<number | null>(null);

  const [exchangeRate, setExchangeRate] =
    useState<number | null>(null);

  /*
   * Restore booking information from sessionStorage.
   */
  useEffect(() => {
    try {
      const savedFlight =
        sessionStorage.getItem("selectedFlight");

      const savedPassenger =
        sessionStorage.getItem("passengerDetails");

      const savedOrder =
        sessionStorage.getItem("bookingOrder");

      const savedPayment =
        sessionStorage.getItem("midtransPayment");

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

      if (savedPayment) {
        const parsedPayment =
          JSON.parse(savedPayment);

        if (
          Number.isFinite(
            Number(parsedPayment?.amount)
          )
        ) {
          setPaymentAmount(
            Number(parsedPayment.amount)
          );
        }

        if (
          Number.isFinite(
            Number(parsedPayment?.exchangeRate)
          )
        ) {
          setExchangeRate(
            Number(parsedPayment.exchangeRate)
          );
        }

        if (parsedPayment?.paymentMethod) {
          setPaymentMethod(
            parsedPayment.paymentMethod
          );
        }
      }
    } catch {
      setError(
        "Unable to restore your booking information."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * Handle the return from Midtrans.
   *
   * Midtrans sends the browser back to:
   *
   * /flights/payment?order_id=PAPEG-ord_...&
   * status_code=200&
   * transaction_status=settlement
   *
   * We then:
   * 1. Read the Midtrans order ID.
   * 2. Convert PAPEG-ord_... to ord_...
   * 3. Check the Duffel order.
   * 4. Wait until Duffel confirms payment.
   * 5. Redirect to Confirmation.
   */
  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const midtransOrderId =
      params.get("order_id");

    const transactionStatus =
      params.get("transaction_status");

    const statusCode =
      params.get("status_code");

    if (!midtransOrderId) {
      return;
    }

    const successfulStatus =
      transactionStatus === "settlement" ||
      transactionStatus === "capture";

    if (!successfulStatus) {
      if (
        transactionStatus === "deny" ||
        transactionStatus === "cancel" ||
        transactionStatus === "expire"
      ) {
        setError(
          `Payment was not completed. Transaction status: ${transactionStatus}.`
        );
      }

      return;
    }

    const prefix = "PAPEG-";

    if (
      !midtransOrderId.startsWith(prefix)
    ) {
      setError(
        "Invalid Papeg payment order ID."
      );
      return;
    }

    const duffelOrderId =
      midtransOrderId.substring(
        prefix.length
      );

    if (!duffelOrderId) {
      setError(
        "Duffel order ID could not be determined."
      );
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const maxAttempts = 20;

    setVerifyingPayment(true);
    setError("");

    if (statusCode === "200") {
      setVerificationMessage(
        "Payment received. Verifying your ticket..."
      );
    } else {
      setVerificationMessage(
        "Payment received. Preparing your booking..."
      );
    }

    async function verifyDuffelPayment() {
      if (cancelled) {
        return;
      }

      attempts += 1;

      try {
        const response =
          await fetch(
            `/api/flights/order/${encodeURIComponent(
              duffelOrderId
            )}`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
            "Unable to verify the booking."
          );
        }

        const duffelOrder =
          data?.order;

        const awaitingPayment =
          duffelOrder
            ?.payment_status
            ?.awaiting_payment;

        const documents =
          duffelOrder?.documents || [];

        const hasElectronicTicket =
          Array.isArray(documents) &&
          documents.some(
            (document: {
              type?: string;
            }) =>
              document?.type ===
              "electronic_ticket"
          );

        /*
         * Duffel confirms that payment is complete
         * when awaiting_payment becomes false.
         *
         * An electronic ticket is an additional
         * confirmation that ticket issuance happened.
         */
        if (
          awaitingPayment === false ||
          hasElectronicTicket
        ) {
          if (cancelled) {
            return;
          }

          setVerificationMessage(
            "Payment verified. Opening your booking confirmation..."
          );

          /*
           * Small delay so the user can see the
           * successful verification message.
           */
          setTimeout(() => {
            if (!cancelled) {
              window.location.href =
                `/flights/confirmation?orderId=${encodeURIComponent(
                  duffelOrderId
                )}`;
            }
          }, 800);

          return;
        }

        /*
         * Duffel still reports awaiting payment.
         * This can happen for a few seconds while
         * the Midtrans webhook is processing.
         */
        if (attempts < maxAttempts) {
          setVerificationMessage(
            `Payment received. Waiting for ticket confirmation... (${attempts}/${maxAttempts})`
          );

          setTimeout(
            verifyDuffelPayment,
            2000
          );

          return;
        }

        throw new Error(
          "Payment was received, but ticket confirmation is taking longer than expected. Please check your booking confirmation shortly."
        );
      } catch (verificationError) {
        if (cancelled) {
          return;
        }

        /*
         * Retry temporary verification errors.
         */
        if (attempts < maxAttempts) {
          setVerificationMessage(
            `Verifying your booking... (${attempts}/${maxAttempts})`
          );

          setTimeout(
            verifyDuffelPayment,
            2000
          );

          return;
        }

        setVerifyingPayment(false);

        setError(
          verificationError instanceof Error
            ? verificationError.message
            : "Payment verification failed."
        );
      }
    }

    verifyDuffelPayment();

    return () => {
      cancelled = true;
    };
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

  function getOriginalCurrency() {
    return (
      order?.total_currency ||
      selectedFlight?.total_currency ||
      "IDR"
    ).toUpperCase();
  }

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

  function getFormattedPrice() {
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

  function getPrice() {
    return getFormattedPrice();
  }

  /*
   * Midtrans selalu menerima pembayaran
   * dalam IDR.
   */
  function getPaymentPrice() {
    if (paymentAmount === null) {
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

      if (!data.redirect_url) {
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

      setExchangeRate(
        Number(
          data?.payment?.exchangeRate
        ) || null
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

          displayCurrency:
            currency,

          exchangeRate:
            data?.payment?.exchangeRate ||
            null,

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

  /*
   * Payment verification screen.
   *
   * This is shown when the user has returned
   * from Midtrans with a successful transaction.
   */
  if (verifyingPayment) {
    return (
      <main className="payment-page">

        <section className="payment-hero">
          <div className="payment-container">

            <div className="payment-brand">
              PAPEG TOUR & TRAVEL
            </div>

            <h1>
              Payment Successful
            </h1>

            <p>
              Your payment has been received.
              We are now verifying your booking.
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
                PAYMENT VERIFIED
              </span>

              <h2>
                Preparing Your Ticket
              </h2>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "24px 0",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    border: "4px solid #dce8e2",
                    borderTopColor: "#1d5c48",
                    borderRadius: "50%",
                    animation:
                      "papeg-spin 1s linear infinite",
                  }}
                />
              </div>

              <p>
                {verificationMessage}
              </p>

              <p
                style={{
                  marginTop: "12px",
                  fontSize: "14px",
                  color: "#6b746f",
                }}
              >
                Please do not close this page.
                You will be redirected to your
                booking confirmation automatically.
              </p>

              <style jsx>{`
                @keyframes papeg-spin {
                  from {
                    transform: rotate(0deg);
                  }

                  to {
                    transform: rotate(360deg);
                  }
                }
              `}</style>

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