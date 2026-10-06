"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

type Airport = {
  iata_code?: string;
  city_name?: string;
  name?: string;
  time_zone?: string;
};

type Carrier = {
  iata_code?: string;
  name?: string;
  logo_symbol_url?: string;
  logo_lockup_url?: string | null;
};

type SegmentPassenger = {
  passenger_id?: string;
  cabin_class?: string;
  cabin_class_marketing_name?: string;
  seat?: string | null;
  baggages?: {
    quantity?: number;
    type?: string;
  }[];
};

type Segment = {
  id?: string;
  departing_at?: string;
  arriving_at?: string;
  duration?: string;
  marketing_carrier_flight_number?: string;
  operating_carrier_flight_number?: string;
  origin_terminal?: string;
  destination_terminal?: string;
  aircraft?: {
    name?: string;
    iata_code?: string;
  };
  origin?: Airport;
  destination?: Airport;
  marketing_carrier?: Carrier;
  operating_carrier?: Carrier;
  passengers?: SegmentPassenger[];
  stops?: unknown[];
};

type Slice = {
  id?: string;
  duration?: string;
  origin?: Airport;
  destination?: Airport;
  segments?: Segment[];
  fare_brand_name?: string;
};

type BookingReference = {
  booking_reference?: string;
  carrier?: Carrier;
};

type PaymentStatus = {
  paid_at?: string | null;
  awaiting_payment?: boolean;
};

type BookingOrder = {
  id?: string;
  booking_reference?: string;
  booking_references?: BookingReference[];
  type?: string;
  status?: string;
  created_at?: string;
  total_amount?: string | number | null;
  total_currency?: string | null;
  base_amount?: string | number | null;
  base_currency?: string | null;
  tax_amount?: string | number | null;
  tax_currency?: string | null;
  passengers?: Passenger[];
  documents?: TicketDocument[];
  slices?: Slice[];
  payment_status?: PaymentStatus;
};

type PaymentInfo = {
  orderId?: string;
  midtransOrderId?: string;
  amount?: number | string;
  currency?: string;
  status?: string;
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatFlightDate(value?: string | null) {
  if (!value) return "-";

  const datePart = value.split("T")[0];

  if (!datePart) return "-";

  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) return value;

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatFlightTime(value?: string | null) {
  if (!value) return "-";

  const timePart = value.split("T")[1];

  if (!timePart) return "-";

  return timePart.slice(0, 5);
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
      currency: currency || "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${numericAmount.toFixed(2)} ${currency || ""}`.trim();
  }
}

function getPassengerName(passenger?: Passenger) {
  if (!passenger) return "-";

  const fullName = [
    passenger.given_name,
    passenger.family_name,
  ]
    .filter(Boolean)
    .join(" ");

  return fullName || "-";
}

function formatDuration(duration?: string | null) {
  if (!duration) return "-";

  const hours = duration.match(/(\d+)H/)?.[1];
  const minutes = duration.match(/(\d+)M/)?.[1];

  const parts: string[] = [];

  if (hours) {
    parts.push(`${hours}h`);
  }

  if (minutes) {
    parts.push(`${minutes}m`);
  }

  return parts.length > 0 ? parts.join(" ") : duration;
}

function getBaggageText(segment?: Segment) {
  if (!segment?.passengers?.length) return "-";

  const baggage = segment.passengers[0]?.baggages || [];

  if (!baggage.length) return "Not specified";

  return baggage
    .map((item) => {
      const quantity = item.quantity ?? 0;

      if (item.type === "checked") {
        return `${quantity} checked`;
      }

      if (item.type === "carry_on") {
        return `${quantity} carry-on`;
      }

      return `${quantity} ${item.type || "bag"}`;
    })
    .join(" • ");
}

function getCabinClass(segment?: Segment) {
  if (!segment?.passengers?.length) return "-";

  return (
    segment.passengers[0]?.cabin_class_marketing_name ||
    segment.passengers[0]?.cabin_class ||
    "-"
  );
}

function getFlightNumber(segment?: Segment) {
  if (!segment) return "-";

  const carrierCode =
    segment.marketing_carrier?.iata_code ||
    segment.operating_carrier?.iata_code ||
    "";

  const flightNumber =
    segment.marketing_carrier_flight_number ||
    segment.operating_carrier_flight_number ||
    "";

  return `${carrierCode} ${flightNumber}`.trim() || "-";
}

export default function ConfirmationContent() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<BookingOrder | null>(null);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBooking() {
      if (!orderId) {
        setError("Booking order ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        if (typeof window !== "undefined") {
          const storedPayment =
            sessionStorage.getItem("midtransPayment");

          if (storedPayment) {
            try {
              const parsedPayment = JSON.parse(
                storedPayment
              ) as PaymentInfo;

              const matchesOrder =
                parsedPayment.orderId === orderId ||
                parsedPayment.midtransOrderId ===
                  `PAPEG-${orderId}`;

              if (matchesOrder) {
                setPayment(parsedPayment);
              }
            } catch (paymentError) {
              console.warn(
                "Could not read Midtrans payment information:",
                paymentError
              );
            }
          }
        }

        const response = await fetch(
          `/api/flights/order/${encodeURIComponent(orderId)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.error || "Failed to retrieve booking information."
          );
        }

        setOrder(data.order);
      } catch (bookingError) {
        console.error("Confirmation error:", bookingError);

        setError(
          bookingError instanceof Error
            ? bookingError.message
            : "Failed to load booking confirmation."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [orderId]);

  const segments = useMemo(() => {
    if (!order?.slices) return [];

    return order.slices.flatMap(
      (slice) => slice.segments || []
    );
  }, [order]);

  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  const origin = firstSegment?.origin;
  const destination = lastSegment?.destination;

  const airline =
    firstSegment?.marketing_carrier ||
    firstSegment?.operating_carrier;

  const flightNumber = getFlightNumber(firstSegment);

  const bookingReference =
    order?.booking_reference ||
    order?.booking_references?.[0]?.booking_reference ||
    order?.id ||
    "-";

  const bookingStatus = order?.status || "confirmed";

  const documents = order?.documents || [];

  const electronicTickets = documents.filter(
    (document) => document.type === "electronic_ticket"
  );

  const paymentAmount =
    payment?.amount !== undefined
      ? payment.amount
      : order?.total_amount;

  const paymentCurrency =
    payment?.currency ||
    order?.total_currency ||
    "EUR";

  function handlePrint() {
  window.print();
}

async function handleSavePdf() {
  const ticket = document.querySelector(
    ".flight-ticket-print"
  ) as HTMLElement | null;

  if (!ticket) {
    alert("Flight ticket could not be found.");
    return;
  }

  try {
    const originalStyle = {
      display: ticket.style.display,
      position: ticket.style.position,
      left: ticket.style.left,
      top: ticket.style.top,
      width: ticket.style.width,
      background: ticket.style.background,
    };

    ticket.style.display = "block";
    ticket.style.position = "fixed";
    ticket.style.left = "-10000px";
    ticket.style.top = "0";
    ticket.style.width = "190mm";
    ticket.style.background = "#ffffff";

    const canvas = await html2canvas(ticket, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    ticket.style.display = originalStyle.display;
    ticket.style.position = originalStyle.position;
    ticket.style.left = originalStyle.left;
    ticket.style.top = originalStyle.top;
    ticket.style.width = originalStyle.width;
    ticket.style.background = originalStyle.background;

    const imageData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;

    const availableWidth = pageWidth - margin * 2;
    const imageWidth = availableWidth;

    const imageHeight =
      (canvas.height * imageWidth) / canvas.width;

    const availableHeight =
      pageHeight - margin * 2;

    const finalHeight = Math.min(
      imageHeight,
      availableHeight
    );

    pdf.addImage(
      imageData,
      "PNG",
      margin,
      margin,
      imageWidth,
      finalHeight
    );

    const safeReference = bookingReference
      .replace(/[^a-zA-Z0-9-_]/g, "")
      .trim();

    const fileName = `Papeg_Flight_Ticket_${
      safeReference || "Booking"
    }.pdf`;

    pdf.save(fileName);
  } catch (pdfError) {
    console.error("PDF generation error:", pdfError);

    alert(
      "Unable to create the PDF. Please try again."
    );
  }
}
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f3ec] px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#1d5c48] border-t-transparent" />

            <h1 className="text-2xl font-bold text-[#26332e]">
              Loading Booking Confirmation
            </h1>

            <p className="mt-2 text-gray-600">
              Please wait while we retrieve your booking information.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-[#f6f3ec] px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl">
              !
            </div>

            <h1 className="mt-5 text-2xl font-bold text-[#26332e]">
              Booking Confirmation Error
            </h1>

            <p className="mt-3 text-gray-600">
              {error || "Booking information could not be found."}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/flight"
                className="rounded-full bg-[#1d5c48] px-6 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Book Another Flight
              </Link>

              <Link
                href="/"
                className="rounded-full border border-gray-300 px-6 py-3 font-semibold text-[#26332e] transition hover:bg-gray-50"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* PRINT VERSION */}
      <div className="flight-ticket-print">
        <div className="print-ticket">
          <div className="print-ticket-header">
            <div>
              <div className="print-logo-wrapper">
  <img
    src="/images/papeg-logo.png"
    alt="Papeg Tour & Travel"
    className="print-logo"
  />
</div>

              <p className="print-small">
                Flight Booking Confirmation
              </p>
            </div>

            <div className="print-reference">
              <span>BOOKING REFERENCE</span>
              <strong>{bookingReference}</strong>
            </div>
          </div>

          <div className="print-route">
            <div className="print-airport">
              <strong>{origin?.iata_code || "-"}</strong>
              <span>{origin?.city_name || "-"}</span>

              <small>
                {formatFlightDate(firstSegment?.departing_at)}
              </small>

              <small>
                {formatFlightTime(firstSegment?.departing_at)}
              </small>
            </div>

            <div className="print-arrow">
              ✈
            </div>

            <div className="print-airport">
              <strong>{destination?.iata_code || "-"}</strong>
              <span>{destination?.city_name || "-"}</span>

              <small>
                {formatFlightDate(lastSegment?.arriving_at)}
              </small>

              <small>
                {formatFlightTime(lastSegment?.arriving_at)}
              </small>
            </div>
          </div>

          <div className="print-divider" />

          <div className="print-grid">
            <div>
              <span>Airline</span>
              <strong>{airline?.name || "-"}</strong>
            </div>

            <div>
              <span>Flight</span>
              <strong>{flightNumber}</strong>
            </div>

            <div>
              <span>Cabin</span>
              <strong>{getCabinClass(firstSegment)}</strong>
            </div>

            <div>
              <span>Aircraft</span>
              <strong>
                {firstSegment?.aircraft?.name || "-"}
              </strong>
            </div>

            <div>
              <span>Duration</span>
              <strong>
                {formatDuration(firstSegment?.duration)}
              </strong>
            </div>

            <div>
              <span>Baggage</span>
              <strong>{getBaggageText(firstSegment)}</strong>
            </div>
          </div>

          <div className="print-divider" />

          <h3 className="print-section-title">
            Passenger
          </h3>

          {order.passengers?.map((passenger) => (
            <div
              key={passenger.id || getPassengerName(passenger)}
              className="print-passenger"
            >
              <strong>
                {getPassengerName(passenger)}
              </strong>

              <span>
                {passenger.type || "Passenger"}
              </span>
            </div>
          ))}

          {electronicTickets.length > 0 && (
            <>
              <div className="print-divider" />

              <h3 className="print-section-title">
                Electronic Ticket
              </h3>

              {electronicTickets.map((ticket, index) => (
                <div
                  key={`${ticket.unique_identifier}-${index}`}
                  className="print-ticket-number"
                >
                  <span>Ticket Number</span>
                  <strong>
                    {ticket.unique_identifier || "-"}
                  </strong>
                </div>
              ))}
            </>
          )}

          <div className="print-footer">
            <p>
              Issued by Papeg Tour & Travel
            </p>

            <p>
              Please present this confirmation when required.
            </p>
          </div>
        </div>
      </div>

      {/* SCREEN VERSION */}
      <main className="screen-only min-h-screen bg-[#f6f3ec] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">

          {/* Success Header */}
          <div className="mb-6 rounded-3xl bg-[#1d5c48] p-8 text-white shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-2xl">
                  ✓
                </div>

                <h1 className="text-3xl font-bold sm:text-4xl">
                  Booking Confirmed
                </h1>

                <p className="mt-2 text-white/80">
                  Your flight booking has been successfully retrieved.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 px-6 py-4">
                <p className="text-xs uppercase tracking-wider text-white/70">
                  Booking Reference
                </p>

                <p className="mt-1 text-2xl font-bold tracking-wider">
                  {bookingReference}
                </p>
              </div>
            </div>
          </div>

          {/* Flight Card */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-6 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-[#1d5c48]">
                    Flight Itinerary
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-[#26332e]">
                    {origin?.city_name || "-"} →{" "}
                    {destination?.city_name || "-"}
                  </h2>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-500">
                    {airline?.name || "-"}
                  </p>

                  <p className="font-semibold text-[#26332e]">
                    {flightNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-8 sm:px-8">

              {/* Route */}
              <div className="grid gap-8 md:grid-cols-[1fr_auto_1fr] md:items-center">
                <div>
                  <p className="text-4xl font-bold text-[#26332e]">
                    {origin?.iata_code || "-"}
                  </p>

                  <p className="mt-1 font-semibold text-gray-700">
                    {origin?.city_name || "-"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {origin?.name || "-"}
                  </p>

                  <div className="mt-4">
                    <p className="text-2xl font-bold text-[#26332e]">
                      {formatFlightTime(
                        firstSegment?.departing_at
                      )}
                    </p>

                    <p className="text-sm text-gray-500">
                      {formatFlightDate(
                        firstSegment?.departing_at
                      )}
                    </p>

                    {firstSegment?.origin_terminal && (
                      <p className="mt-1 text-xs text-gray-500">
                        Terminal {firstSegment.origin_terminal}
                      </p>
                    )}
                  </div>
                </div>

                <div className="hidden text-center md:block">
                  <div className="text-2xl text-[#1d5c48]">
                    ✈
                  </div>

                  <div className="my-2 h-px w-28 bg-gray-200" />

                  <p className="text-xs font-medium text-gray-500">
                    {formatDuration(
                      firstSegment?.duration
                    )}
                  </p>

                  {firstSegment?.stops &&
                    firstSegment.stops.length === 0 && (
                      <p className="mt-1 text-xs text-[#1d5c48]">
                        Non-stop
                      </p>
                    )}
                </div>

                <div className="md:text-right">
                  <p className="text-4xl font-bold text-[#26332e]">
                    {destination?.iata_code || "-"}
                  </p>

                  <p className="mt-1 font-semibold text-gray-700">
                    {destination?.city_name || "-"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {destination?.name || "-"}
                  </p>

                  <div className="mt-4">
                    <p className="text-2xl font-bold text-[#26332e]">
                      {formatFlightTime(
                        lastSegment?.arriving_at
                      )}
                    </p>

                    <p className="text-sm text-gray-500">
                      {formatFlightDate(
                        lastSegment?.arriving_at
                      )}
                    </p>

                    {lastSegment?.destination_terminal && (
                      <p className="mt-1 text-xs text-gray-500">
                        Terminal{" "}
                        {lastSegment.destination_terminal}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile flight line */}
              <div className="mt-8 flex items-center justify-center gap-3 md:hidden">
                <div className="h-px flex-1 bg-gray-200" />

                <div className="text-center">
                  <div className="text-xl text-[#1d5c48]">
                    ✈
                  </div>

                  <p className="text-xs text-gray-500">
                    {formatDuration(
                      firstSegment?.duration
                    )}
                  </p>

                  {firstSegment?.stops &&
                    firstSegment.stops.length === 0 && (
                      <p className="text-xs text-[#1d5c48]">
                        Non-stop
                      </p>
                    )}
                </div>

                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Flight Details */}
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-2xl bg-[#f6f3ec] p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Airline
                  </p>

                  <p className="mt-2 font-bold text-[#26332e]">
                    {airline?.name || "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f6f3ec] p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Flight
                  </p>

                  <p className="mt-2 font-bold text-[#26332e]">
                    {flightNumber}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f6f3ec] p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Cabin
                  </p>

                  <p className="mt-2 font-bold capitalize text-[#26332e]">
                    {getCabinClass(firstSegment)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f6f3ec] p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Baggage
                  </p>

                  <p className="mt-2 font-bold text-[#26332e]">
                    {getBaggageText(firstSegment)}
                  </p>
                </div>

              </div>

              {/* Aircraft */}
              <div className="mt-4 grid gap-4 sm:grid-cols-3">

                <div className="rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Aircraft
                  </p>

                  <p className="mt-2 font-semibold text-[#26332e]">
                    {firstSegment?.aircraft?.name || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Duration
                  </p>

                  <p className="mt-2 font-semibold text-[#26332e]">
                    {formatDuration(
                      firstSegment?.duration
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Fare
                  </p>

                  <p className="mt-2 font-semibold text-[#26332e]">
                    {order.slices?.[0]?.fare_brand_name ||
                      "-"}
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-[#26332e]">
                Booking Information
              </h2>

              <div className="mt-6 space-y-4">

                <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <span className="text-gray-500">
                    Booking Reference
                  </span>

                  <span className="font-bold text-[#26332e]">
                    {bookingReference}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <span className="text-gray-500">
                    Booking ID
                  </span>

                  <span className="max-w-[220px] break-all text-right text-sm font-medium text-[#26332e]">
                    {order.id || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <span className="text-gray-500">
                    Booking Type
                  </span>

                  <span className="font-semibold capitalize text-[#26332e]">
                    {order.type || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <span className="text-gray-500">
                    Status
                  </span>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold capitalize text-green-700">
                    {bookingStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">
                    Created
                  </span>

                  <span className="font-semibold text-[#26332e]">
                    {formatDate(order.created_at)}
                  </span>
                </div>

              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-[#26332e]">
                Payment
              </h2>

              <div className="mt-6 rounded-2xl bg-[#f6f3ec] p-6">
                <p className="text-sm text-gray-500">
                  Total Paid
                </p>

                <p className="mt-2 text-3xl font-bold text-[#1d5c48]">
                  {formatMoney(
                    paymentAmount,
                    paymentCurrency
                  )}
                </p>

                {order.base_amount !== undefined && (
                  <div className="mt-5 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Base fare
                      </span>

                      <span className="font-medium">
                        {formatMoney(
                          order.base_amount,
                          order.base_currency
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Tax
                      </span>

                      <span className="font-medium">
                        {formatMoney(
                          order.tax_amount,
                          order.tax_currency
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {order.payment_status?.paid_at && (
                <p className="mt-4 text-sm text-gray-500">
                  Payment recorded on{" "}
                  {formatDate(
                    order.payment_status.paid_at
                  )}
                  .
                </p>
              )}

              {order.payment_status?.awaiting_payment ===
                false && (
                <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  Payment status: completed
                </div>
              )}
            </section>

          </div>

          {/* Electronic Ticket */}
          <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#26332e]">
                  Electronic Ticket
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Ticket information returned by the airline booking system.
                </p>
              </div>

              {electronicTickets.length > 0 && (
                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                  Available
                </span>
              )}
            </div>

            {electronicTickets.length > 0 ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {electronicTickets.map((ticket, index) => (
                  <div
                    key={`${ticket.unique_identifier}-${index}`}
                    className="rounded-2xl border border-gray-100 bg-[#f6f3ec] p-5"
                  >
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Ticket Number
                    </p>

                    <p className="mt-2 break-all text-lg font-bold tracking-wide text-[#26332e]">
                      {ticket.unique_identifier || "-"}
                    </p>

                    <p className="mt-3 text-xs text-gray-500">
                      Passenger ticket document
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl bg-yellow-50 p-5 text-sm text-yellow-800">
                Electronic ticket information is not available in this order yet.
              </div>
            )}
          </section>

          {/* Passengers */}
          <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-[#26332e]">
              Passenger Details
            </h2>

            <div className="mt-6 space-y-4">
              {order.passengers?.map((passenger, index) => (
                <div
                  key={passenger.id || index}
                  className="rounded-2xl border border-gray-100 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Passenger {index + 1}
                      </p>

                      <h3 className="mt-1 text-lg font-bold text-[#26332e]">
                        {getPassengerName(passenger)}
                      </h3>
                    </div>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-600">
                      {passenger.type || "passenger"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-500">
                        Gender
                      </p>

                      <p className="mt-1 font-medium capitalize">
                        {passenger.gender || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Date of Birth
                      </p>

                      <p className="mt-1 font-medium">
                        {passenger.born_on || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Email
                      </p>

                      <p className="mt-1 break-all font-medium">
                        {passenger.email || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Phone
                      </p>

                      <p className="mt-1 font-medium">
                        {passenger.phone_number || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Important Information */}
          <section className="mt-6 rounded-3xl border border-[#1d5c48]/10 bg-[#1d5c48]/5 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#26332e]">
              Important Information
            </h2>

            <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-700">
              <li>
                • Please check your flight date and departure time carefully.
              </li>

              <li>
                • Airport check-in and boarding requirements are determined by the operating airline.
              </li>

              <li>
                • Please carry the identification document used during booking.
              </li>

              <li>
                • Flight schedules may be subject to airline changes.
              </li>
            </ul>
          </section>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 pb-10">
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-full bg-[#1d5c48] px-6 py-3 font-semibold text-white transition hover:opacity-90"
            >
              Print Ticket
            </button>

            <button
  type="button"
  onClick={handleSavePdf}
  className="inline-flex items-center gap-2 rounded-full border-2 border-[#1d5c48] bg-white px-6 py-3 font-semibold text-[#1d5c48] shadow-sm transition hover:bg-[#1d5c48] hover:text-white hover:shadow-md"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-5 w-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2"
    />
  </svg>

  Save as PDF
</button>

            <Link
              href="/flight"
              className="rounded-full border border-gray-300 px-6 py-3 font-semibold text-[#26332e] transition hover:bg-gray-50"
            >
              Book Another Flight
            </Link>

            <Link
              href="/tours"
              className="rounded-full border border-gray-300 px-6 py-3 font-semibold text-[#26332e] transition hover:bg-gray-50"
            >
              Explore Tours
            </Link>

            <Link
              href="/"
              className="rounded-full border border-gray-300 px-6 py-3 font-semibold text-[#26332e] transition hover:bg-gray-50"
            >
              Home
            </Link>
          </div>
        </div>
      </main>

     <style jsx global>{`
  /* =========================================
     FLIGHT TICKET - PDF & PRINT BASE STYLES
     ========================================= */

  .flight-ticket-print {
    display: none;
    width: 100%;
    max-width: 190mm;
    margin: 0 auto;
    padding: 0;
    background: white;
    color: #26332e;
    font-family: Arial, Helvetica, sans-serif;
    box-sizing: border-box;
  }

  .flight-ticket-print *,
  .flight-ticket-print *::before,
  .flight-ticket-print *::after {
    box-sizing: border-box;
  }

  .print-ticket {
    width: 100%;
    max-width: 190mm;
    margin: 0 auto;
    background: white;
    color: #26332e;
    font-family: Arial, Helvetica, sans-serif;
  }

  .print-ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding-bottom: 18px;
  border-bottom: 2px solid #1d5c48;
  min-height: 85px;

}

.print-logo-wrapper {
  width: 170px;
  min-width: 170px;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: visible;
  flex-shrink: 0;
}

.print-logo {
  display: block;
  width: 170px !important;
  height: 110px !important;
  max-width: 170px !important;
  max-height: 110px !important;
  object-fit: contain !important;
  object-position: left center;
  flex-shrink: 0 !important;

  }

  .print-small {
    margin: 6px 0 0;
    font-size: 10px;
    color: #666;
  }

  .print-reference {
    text-align: right;
  }

  .print-reference span {
    display: block;
    font-size: 9px;
    letter-spacing: 1px;
    color: #777;
  }

  .print-reference strong {
    display: block;
    margin-top: 4px;
    font-size: 20px;
    letter-spacing: 2px;
    color: #1d5c48;
  }

  .print-route {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 25px;
    padding: 28px 0;
  }

  .print-airport {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .print-airport:last-child {
    text-align: right;
  }

  .print-airport strong {
    font-size: 30px;
    color: #26332e;
  }

  .print-airport span {
    font-size: 13px;
    font-weight: 600;
  }

  .print-airport small {
    font-size: 10px;
    color: #666;
  }

  .print-arrow {
    font-size: 25px;
    color: #1d5c48;
    text-align: center;
  }

  .print-divider {
    height: 1px;
    background: #ddd;
    margin: 18px 0;
  }

  .print-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .print-grid div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .print-grid span,
  .print-ticket-number span {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    color: #777;
  }

  .print-grid strong,
  .print-ticket-number strong {
    font-size: 11px;
    color: #26332e;
  }

  .print-section-title {
    margin: 0 0 10px;
    font-size: 14px;
    color: #1d5c48;
  }

  .print-passenger {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    padding: 9px 0;
    border-bottom: 1px solid #eee;
  }

  .print-passenger strong {
    font-size: 12px;
  }

  .print-passenger span {
    font-size: 10px;
    color: #777;
    text-transform: capitalize;
  }

  .print-ticket-number {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    padding: 12px;
    background: #f6f3ec;
    border-radius: 8px;
  }

  .print-footer {
    margin-top: 35px;
    padding-top: 15px;
    border-top: 1px solid #ddd;
    text-align: center;
    color: #777;
    font-size: 9px;
  }

  .print-footer p {
    margin: 3px 0;
  }

  /* =========================================
     PDF SCREEN CAPTURE SUPPORT
     ========================================= */

  @media screen {
    .flight-ticket-print {
      position: absolute;
      left: -10000px;
      top: 0;
    }
  }

  /* =========================================
     PRINT VERSION
     ========================================= */

  @media print {
    html,
    body {
      width: 100%;
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
    }

    body * {
      visibility: hidden !important;
    }

    .flight-ticket-print,
    .flight-ticket-print * {
      visibility: visible !important;
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
    }

    .screen-only {
      display: none !important;
    }

    @page {
      size: A4;
      margin: 12mm;
    }

    .print-ticket {
      width: 100%;
      max-width: 190mm;
      margin: 0 auto;
    }
  }
`}</style>
    </>
  );
}