"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Passenger = {
  id?: string;
  type?: string;
  given_name?: string;
  family_name?: string;
  gender?: string;
  born_on?: string;
  email?: string;
  phone_number?: string;
};

type TicketDocument = {
  passenger_ids?: string[];
  unique_identifier?: string;
  type?: string;
};

type BookingOrder = {
  id?: string;
  booking_reference?: string;
  type?: string;
  status?: string;
  created_at?: string;
  total_amount?: string | number | null;
  total_currency?: string | null;
  passengers?: Passenger[];
  documents?: TicketDocument[];
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function formatMoney(
  amount?: string | number | null,
  currency?: string | null
) {
  if (amount === null || amount === undefined || amount === "") {
    return "-";
  }

  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount)) {
    return `${amount} ${currency || ""}`.trim();
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(numericAmount);
  } catch {
    return `${numericAmount.toFixed(2)} ${currency || "USD"}`;
  }
}

function getPassengerName(passenger: Passenger) {
  return (
    `${passenger.given_name || ""} ${
      passenger.family_name || ""
    }`.trim() || "Passenger"
  );
}

export default function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<BookingOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [paymentCurrency, setPaymentCurrency] = useState("IDR");

  useEffect(() => {
    if (!orderId) {
      setError("Booking Order ID is missing.");
      setLoading(false);
      return;
    }

    const bookingId = orderId;

    try {
      const savedPayment = sessionStorage.getItem("midtransPayment");

      if (savedPayment) {
        const payment = JSON.parse(savedPayment);

        if (
          payment.orderId === bookingId ||
          payment.midtransOrderId === `PAPEG-${bookingId}`
        ) {
          const amount = Number(payment.amount);

          if (!Number.isNaN(amount) && amount > 0) {
            setPaymentAmount(amount);
            setPaymentCurrency(payment.currency || "IDR");
          }
        }
      }
    } catch (error) {
      console.error("Unable to read payment information:", error);
    }

    async function loadOrder() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/flights/order/${encodeURIComponent(bookingId)}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Unable to load booking information."
          );
        }

        setOrder(data.order);
      } catch (err) {
        console.error("Load booking error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load booking information."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f3ec] px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl">
            <div className="h-2 bg-[#1d5c48]" />

            <div className="px-6 py-14 text-center sm:px-10">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f0ec]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1d5c48] border-t-transparent" />
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1d5c48]">
                Papeg Tour & Travel
              </p>

              <h1 className="mt-3 text-2xl font-bold text-[#26332e] sm:text-3xl">
                Loading Booking Confirmation
              </h1>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
                Please wait while we retrieve your booking information.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-[#f6f3ec] px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl">
            <div className="h-2 bg-red-500" />

            <div className="px-6 py-12 text-center sm:px-10 sm:py-14">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-3xl font-bold text-red-600">
                !
              </div>

              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
                Papeg Tour & Travel
              </p>

              <h1 className="mt-3 text-2xl font-bold text-[#26332e] sm:text-3xl">
                Booking Confirmation Not Found
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-600">
                {error ||
                  "We could not find the booking information for this order."}
              </p>

              {orderId && (
                <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-gray-50 p-4 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Order ID
                  </p>

                  <p className="mt-1 break-all text-sm font-semibold text-[#26332e]">
                    {orderId}
                  </p>
                </div>
              )}

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/flight"
                  className="rounded-xl bg-[#1d5c48] px-6 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  Back to Flight Search
                </Link>

                <Link
                  href="/"
                  className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-center text-sm font-bold text-[#26332e] transition hover:bg-gray-50"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const passengers = order.passengers || [];
  const documents = order.documents || [];

  const electronicTickets = documents.filter(
    (document) => document.type === "electronic_ticket"
  );

  const bookingReference = order.booking_reference || order.id || "-";
  const bookingStatus = order.status || "confirmed";

  return (
    <main className="min-h-screen bg-[#f6f3ec] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">

        {/* =====================================================
            PRINT-ONLY FLIGHT TICKET
        ====================================================== */}

        <section className="flight-ticket-print">
          <div className="ticket-header">
            <div className="ticket-brand-area">
              <div className="ticket-logo">PAPEG</div>

              <div>
                <p className="ticket-brand">
                  PAPEG TOUR & TRAVEL
                </p>

                <p className="ticket-label">
                  ELECTRONIC TICKET
                </p>
              </div>
            </div>

            <div className="ticket-status">
              ISSUED
            </div>
          </div>

          <div className="ticket-reference">
            <div>
              <span>BOOKING REFERENCE</span>
              <strong>{bookingReference}</strong>
            </div>

            <div>
              <span>TICKET IDENTIFIER</span>

              <strong>
                {electronicTickets[0]?.unique_identifier || "-"}
              </strong>
            </div>
          </div>

          <div className="ticket-section">
            <p className="ticket-section-title">
              PASSENGER
            </p>

            {passengers.length === 0 ? (
              <p className="ticket-empty">
                No passenger information available.
              </p>
            ) : (
              passengers.map((passenger, index) => (
                <div
                  key={passenger.id || index}
                  className="ticket-passenger"
                >
                  <div>
                    <span>FULL NAME</span>

                    <strong>
                      {getPassengerName(passenger)}
                    </strong>
                  </div>

                  <div>
                    <span>TYPE</span>

                    <strong>
                      {passenger.type || "Passenger"}
                    </strong>
                  </div>

                  <div>
                    <span>GENDER</span>

                    <strong>
                      {passenger.gender || "-"}
                    </strong>
                  </div>

                  <div>
                    <span>DATE OF BIRTH</span>

                    <strong>
                      {passenger.born_on || "-"}
                    </strong>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="ticket-section">
            <p className="ticket-section-title">
              FLIGHT INFORMATION
            </p>

            <div className="ticket-flight">
              <div className="ticket-airport">
                <span>FROM</span>

                <strong>DJJ</strong>

                <small>Jayapura</small>
              </div>

              <div className="ticket-arrow">
                →
              </div>

              <div className="ticket-airport ticket-airport-right">
                <span>TO</span>

                <strong>WMX</strong>

                <small>Wamena</small>
              </div>
            </div>

            <div className="ticket-flight-details">
              <div>
                <span>TRAVEL DATE</span>

                <strong>
                  14 October 2026
                </strong>
              </div>

              <div>
                <span>BOOKING STATUS</span>

                <strong>
                  {bookingStatus}
                </strong>
              </div>

              <div>
                <span>BOOKING CREATED</span>

                <strong>
                  {formatDate(order.created_at)}
                </strong>
              </div>
            </div>
          </div>

          <div className="ticket-total">
            <div>
              <span>TOTAL PAID</span>

              <strong>
                {paymentAmount !== null
                  ? formatMoney(
                      paymentAmount,
                      paymentCurrency
                    )
                  : formatMoney(
                      order.total_amount,
                      order.total_currency
                    )}
              </strong>
            </div>

            <div className="ticket-currency">
              {paymentAmount !== null
                ? paymentCurrency
                : order.total_currency || "EUR"}
            </div>
          </div>

          <div className="ticket-note">
            <strong>
              Important Information
            </strong>

            <p>
              Please check that the passenger name and
              booking information are correct. Keep this
              electronic ticket for your travel records.
            </p>
          </div>

          <div className="ticket-footer">
            <span>
              Papeg Tour & Travel
            </span>

            <span>
              Discover the Heart of Papua
            </span>
          </div>
        </section>

        {/* =====================================================
            SUCCESS HEADER
        ====================================================== */}

        <section className="screen-only mb-6 overflow-hidden rounded-[2rem] bg-[#1d5c48] shadow-xl">
          <div className="relative px-6 py-10 text-center sm:px-10 sm:py-14">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl font-bold text-[#1d5c48] shadow-lg">
              ✓
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/75 sm:text-sm">
              Papeg Tour & Travel
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Booking Confirmed
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
              Your flight booking has been successfully
              created. Please keep your booking reference
              for future communication and travel records.
            </p>

            <div className="mt-8 flex justify-center">
              <div className="rounded-full bg-white/10 px-5 py-2 text-xs font-semibold text-white ring-1 ring-white/20">
                ✓ Reservation Successfully Created
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            BOOKING SUMMARY
        ====================================================== */}

        <section className="screen-only mb-6 overflow-hidden rounded-[2rem] bg-white shadow-lg">
          <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1d5c48]">
                  Reservation
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#26332e]">
                  Booking Summary
                </h2>
              </div>

              <span className="inline-flex w-fit items-center rounded-full bg-green-100 px-4 py-2 text-xs font-bold capitalize text-green-700">
                ✓ {bookingStatus}
              </span>
            </div>
          </div>

          <div className="grid gap-px bg-gray-100 sm:grid-cols-2">
            <div className="bg-white p-6 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                Booking Reference
              </p>

              <p className="mt-2 break-all text-3xl font-black tracking-[0.12em] text-[#1d5c48]">
                {bookingReference}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Keep this reference for your booking.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                Order ID
              </p>

              <p className="mt-3 break-all text-sm font-bold leading-6 text-[#26332e]">
                {order.id || "-"}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Papeg booking order identifier.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                Booking Status
              </p>

              <div className="mt-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-bold capitalize text-green-700 ring-1 ring-green-200">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {bookingStatus}
                </span>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                Booking Created
              </p>

              <p className="mt-3 font-semibold text-[#26332e]">
                {formatDate(order.created_at)}
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            ELECTRONIC TICKET
        ====================================================== */}

        <section className="screen-only mb-6 overflow-hidden rounded-[2rem] bg-white shadow-lg">
          <div className="border-b border-gray-100 px-6 py-6 sm:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e7f0ec] text-2xl">
                🎫
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1d5c48]">
                  Travel Document
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#26332e]">
                  Electronic Ticket
                </h2>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Your electronic ticket information
                  returned by the airline booking provider.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {electronicTickets.length === 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex gap-4">
                  <div className="text-xl">
                    ⏳
                  </div>

                  <div>
                    <p className="font-bold text-amber-900">
                      Ticket document is being processed.
                    </p>

                    <p className="mt-1 text-sm leading-6 text-amber-800">
                      Please keep your booking reference.
                      Your ticket information may become
                      available shortly.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {electronicTickets.map(
                  (ticket, index) => (
                    <div
                      key={
                        ticket.unique_identifier ||
                        index
                      }
                      className="overflow-hidden rounded-2xl border border-green-200 bg-green-50"
                    >
                      <div className="border-b border-green-200 bg-white/70 px-5 py-4 sm:px-6">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.15em] text-green-700">
                              Ticket {index + 1}
                            </p>

                            <p className="mt-1 text-lg font-bold text-[#26332e]">
                              Electronic Ticket Issued
                            </p>
                          </div>

                          <span className="inline-flex w-fit rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                            ISSUED
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-px bg-green-200 sm:grid-cols-2">
                        <div className="bg-green-50 p-5 sm:p-6">
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-green-700/70">
                            Ticket Identifier
                          </p>

                          <p className="mt-2 break-all text-xl font-black tracking-wide text-[#1d5c48]">
                            {ticket.unique_identifier ||
                              "-"}
                          </p>
                        </div>

                        <div className="bg-green-50 p-5 sm:p-6">
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-green-700/70">
                            Passenger
                          </p>

                          <p className="mt-2 font-bold text-[#26332e]">
                            {ticket.passenger_ids?.length ||
                              0}{" "}
                            passenger
                            {ticket.passenger_ids &&
                            ticket.passenger_ids.length !== 1
                              ? "s"
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            BOOKING TOTAL
        ====================================================== */}

        <section className="screen-only mb-6 overflow-hidden rounded-[2rem] bg-[#26332e] shadow-lg">
          <div className="flex flex-col gap-6 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                Payment Summary
              </p>

              <h2 className="mt-1 text-2xl font-bold text-white">
                Booking Total
              </h2>

              <p className="mt-1 text-sm text-white/60">
                Total amount associated with this booking.
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-4xl font-black tracking-tight text-white">
                {paymentAmount !== null
                  ? formatMoney(
                      paymentAmount,
                      paymentCurrency
                    )
                  : formatMoney(
                      order.total_amount,
                      order.total_currency
                    )}
              </p>

              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-white/50">
                Currency:{" "}
                {paymentAmount !== null
                  ? paymentCurrency
                  : order.total_currency || "EUR"}
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            PASSENGER DETAILS
        ====================================================== */}

        <section className="screen-only mb-6 overflow-hidden rounded-[2rem] bg-white shadow-lg">
          <div className="border-b border-gray-100 px-6 py-6 sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1d5c48]">
              Traveller Information
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#26332e]">
              Passenger Details
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Passenger information included in this booking.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {passengers.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-5 text-center text-sm text-gray-600">
                No passenger details were returned by the
                booking provider.
              </div>
            ) : (
              <div className="space-y-5">
                {passengers.map(
                  (passenger, index) => (
                    <div
                      key={passenger.id || index}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
                    >
                      <div className="flex items-center gap-4 border-b border-gray-200 bg-white px-5 py-5 sm:px-6">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1d5c48] text-sm font-black text-white shadow-sm">
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <p className="break-words text-lg font-bold text-[#26332e]">
                            {getPassengerName(passenger)}
                          </p>

                          <p className="mt-0.5 text-sm capitalize text-gray-500">
                            {passenger.type || "Passenger"}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
                            Full Name
                          </p>

                          <p className="mt-1.5 break-words font-medium text-[#26332e]">
                            {getPassengerName(passenger)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
                            Passenger Type
                          </p>

                          <p className="mt-1.5 capitalize text-[#26332e]">
                            {passenger.type || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
                            Gender
                          </p>

                          <p className="mt-1.5 capitalize text-[#26332e]">
                            {passenger.gender || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
                            Date of Birth
                          </p>

                          <p className="mt-1.5 text-[#26332e]">
                            {passenger.born_on || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
                            Email
                          </p>

                          <p className="mt-1.5 break-all text-[#26332e]">
                            {passenger.email || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
                            Phone
                          </p>

                          <p className="mt-1.5 break-words text-[#26332e]">
                            {passenger.phone_number || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            IMPORTANT INFORMATION
        ====================================================== */}

        <section className="screen-only mb-6 overflow-hidden rounded-[2rem] border border-amber-200 bg-amber-50 shadow-sm">
          <div className="px-6 py-6 sm:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-xl">
                ℹ
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                  Please Read
                </p>

                <h2 className="mt-1 text-xl font-bold text-amber-950">
                  Important Information
                </h2>
              </div>
            </div>

            <ul className="mt-6 space-y-3 text-sm leading-6 text-amber-950">
              <li className="flex gap-3">
                <span className="mt-0.5 font-black text-amber-700">
                  ✓
                </span>

                <span>
                  Please save your booking reference and
                  order ID.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="mt-0.5 font-black text-amber-700">
                  ✓
                </span>

                <span>
                  Make sure the passenger names and
                  personal details are correct.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="mt-0.5 font-black text-amber-700">
                  ✓
                </span>

                <span>
                  Keep your electronic ticket information
                  for your travel records.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="mt-0.5 font-black text-amber-700">
                  ✓
                </span>

                <span>
                  For assistance with your booking, please
                  contact Papeg Tour & Travel.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* =====================================================
            ACTIONS
        ====================================================== */}

        <div className="screen-only flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border-2 border-[#1d5c48] bg-white px-7 py-3.5 text-center text-sm font-bold text-[#1d5c48] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f7faf8] hover:shadow-md"
          >
            🖨 Print Ticket
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl bg-[#1d5c48] px-7 py-3.5 text-center text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#174b3b] hover:shadow-md"
          >
            📄 Save as PDF
          </button>

          <Link
            href="/flight"
            className="rounded-xl border-2 border-gray-200 bg-white px-7 py-3.5 text-center text-sm font-bold text-[#26332e] shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50"
          >
            Book Another Flight
          </Link>

          <Link
            href="/tours"
            className="rounded-xl border-2 border-gray-200 bg-white px-7 py-3.5 text-center text-sm font-bold text-[#26332e] shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50"
          >
            Explore Our Tours
          </Link>

          <Link
            href="/"
            className="rounded-xl border-2 border-gray-200 bg-white px-7 py-3.5 text-center text-sm font-bold text-[#26332e] shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50"
          >
            Back to Home
          </Link>
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer className="screen-only px-4 py-10 text-center">
          <p className="text-sm font-semibold text-[#26332e]">
            Thank you for choosing Papeg Tour & Travel.
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Discover Papua Highlands with us.
          </p>
        </footer>
      </div>

      {/* =======================================================
          PRINT STYLES
      ======================================================== */}

      <style jsx global>{`
        .flight-ticket-print {
          display: none;
        }

        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          html,
          body {
            width: 100%;
            min-height: 100%;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden;
          }

          .flight-ticket-print,
          .flight-ticket-print * {
            visibility: visible;
          }

          .flight-ticket-print {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: #26332e !important;
            border: 1px solid #d9e1dc !important;
            border-radius: 14px !important;
            box-shadow: none !important;
            overflow: hidden !important;
            font-family:
              Arial,
              Helvetica,
              sans-serif !important;
          }

          .ticket-header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 20px !important;
            padding: 20px 22px !important;
            background: #1d5c48 !important;
            color: white !important;
          }

          .ticket-brand-area {
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
          }

          .ticket-logo {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 42px !important;
            height: 42px !important;
            border-radius: 9px !important;
            background: white !important;
            color: #1d5c48 !important;
            font-size: 12px !important;
            font-weight: 900 !important;
          }

          .ticket-brand {
            margin: 0 !important;
            font-size: 16px !important;
            font-weight: 800 !important;
            letter-spacing: 0.08em !important;
            color: white !important;
          }

          .ticket-label {
            margin: 4px 0 0 !important;
            font-size: 8px !important;
            font-weight: 700 !important;
            letter-spacing: 0.18em !important;
            color: rgba(255, 255, 255, 0.75) !important;
          }

          .ticket-status {
            padding: 6px 11px !important;
            border: 1px solid rgba(255, 255, 255, 0.35) !important;
            border-radius: 999px !important;
            font-size: 8px !important;
            font-weight: 800 !important;
            letter-spacing: 0.08em !important;
            color: white !important;
          }

          .ticket-reference {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 1px !important;
            background: #e7ece9 !important;
          }

          .ticket-reference > div {
            padding: 14px 18px !important;
            background: white !important;
          }

          .ticket-reference span,
          .ticket-passenger span,
          .ticket-flight-details span,
          .ticket-airport span,
          .ticket-total span {
            display: block !important;
            margin-bottom: 5px !important;
            font-size: 8px !important;
            font-weight: 700 !important;
            letter-spacing: 0.12em !important;
            color: #7b8580 !important;
          }

          .ticket-reference strong {
            display: block !important;
            font-size: 18px !important;
            font-weight: 900 !important;
            color: #1d5c48 !important;
            letter-spacing: 0.08em !important;
            overflow-wrap: anywhere !important;
          }

          .ticket-section {
            padding: 16px 18px !important;
            border-top: 1px solid #e7ece9 !important;
            background: white !important;
          }

          .ticket-section-title {
            margin: 0 0 11px !important;
            font-size: 9px !important;
            font-weight: 800 !important;
            letter-spacing: 0.15em !important;
            color: #1d5c48 !important;
          }

          .ticket-passenger {
            display: grid !important;
            grid-template-columns:
              2fr
              1fr
              1fr
              1.3fr !important;
            gap: 14px !important;
          }

          .ticket-passenger strong,
          .ticket-flight-details strong {
            display: block !important;
            font-size: 10px !important;
            font-weight: 750 !important;
            color: #26332e !important;
            overflow-wrap: anywhere !important;
          }

          .ticket-flight {
            display: grid !important;
            grid-template-columns:
              1fr
              auto
              1fr !important;
            align-items: center !important;
            gap: 18px !important;
            padding: 17px !important;
            border: 1px solid #dfe7e3 !important;
            border-radius: 12px !important;
            background: #f7faf8 !important;
          }

          .ticket-airport strong {
            display: block !important;
            font-size: 29px !important;
            line-height: 1 !important;
            font-weight: 900 !important;
            color: #1d5c48 !important;
          }

          .ticket-airport small {
            display: block !important;
            margin-top: 5px !important;
            font-size: 9px !important;
            color: #727c77 !important;
          }

          .ticket-airport-right {
            text-align: right !important;
          }

          .ticket-arrow {
            font-size: 22px !important;
            font-weight: 700 !important;
            color: #1d5c48 !important;
          }

          .ticket-flight-details {
            display: grid !important;
            grid-template-columns:
              1fr
              1fr
              1fr !important;
            gap: 14px !important;
            margin-top: 12px !important;
          }

          .ticket-total {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 20px !important;
            padding: 18px 20px !important;
            background: #26332e !important;
            color: white !important;
          }

          .ticket-total span {
            color: rgba(255, 255, 255, 0.6) !important;
          }

          .ticket-total strong {
            display: block !important;
            font-size: 22px !important;
            font-weight: 900 !important;
            color: white !important;
          }

          .ticket-currency {
            font-size: 9px !important;
            font-weight: 800 !important;
            letter-spacing: 0.1em !important;
            color: rgba(255, 255, 255, 0.65) !important;
          }

          .ticket-note {
            margin: 13px 18px !important;
            padding: 11px 13px !important;
            border: 1px solid #eadfca !important;
            border-radius: 9px !important;
            background: #fffaf1 !important;
          }

          .ticket-note strong {
            display: block !important;
            font-size: 9px !important;
            color: #594719 !important;
          }

          .ticket-note p {
            margin: 4px 0 0 !important;
            font-size: 8px !important;
            line-height: 1.5 !important;
            color: #776f5e !important;
          }

          .ticket-footer {
            display: flex !important;
            justify-content: space-between !important;
            gap: 15px !important;
            padding: 11px 18px !important;
            border-top: 1px solid #e7ece9 !important;
            font-size: 8px !important;
            color: #7b8580 !important;
          }

          .screen-only {
            display: none !important;
          }

          .flight-ticket-print,
          .ticket-header,
          .ticket-reference,
          .ticket-section,
          .ticket-flight,
          .ticket-total,
          .ticket-note,
          .ticket-footer {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </main>
  );
}