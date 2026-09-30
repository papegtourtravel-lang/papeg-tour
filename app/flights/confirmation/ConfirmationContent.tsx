
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

type BookingOrder = {
  id?: string;
  booking_reference?: string;
  type?: string;
  status?: string;
  created_at?: string;
  total_amount?: string | number | null;
  total_currency?: string | null;
  passengers?: Passenger[];
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

export default function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<BookingOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("Booking Order ID is missing.");
      setLoading(false);
      return;
    }

    const bookingId = orderId;

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
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
              !
            </div>

            <h1 className="text-2xl font-bold text-[#26332e]">
              Booking Confirmation Not Found
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-gray-600">
              {error ||
                "We could not find the booking information for this order."}
            </p>

            {orderId && (
              <p className="mt-4 break-all text-sm text-gray-500">
                Order ID: {orderId}
              </p>
            )}

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/flight"
                className="rounded-xl bg-[#1d5c48] px-6 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Back to Flight Search
              </Link>

              <Link
                href="/"
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-[#26332e] transition hover:bg-gray-50"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const passengers = order.passengers || [];

  return (
    <main className="min-h-screen bg-[#f6f3ec] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">

        {/* Success Header */}
        <div className="mb-8 rounded-3xl bg-[#1d5c48] p-8 text-white shadow-lg sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl text-[#1d5c48] shadow-md">
              ✓
            </div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
              Papeg Tour & Travel
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Booking Confirmed
            </h1>

            <p className="mt-3 max-w-2xl text-white/85">
              Your flight booking has been successfully created.
              Please keep your booking reference for future communication.
            </p>
          </div>
        </div>

        {/* Booking Reference */}
        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Booking Reference
              </p>

              <p className="mt-2 break-all text-2xl font-bold tracking-wide text-[#1d5c48]">
                {order.booking_reference || order.id || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Order ID
              </p>

              <p className="mt-2 break-all font-semibold text-[#26332e]">
                {order.id || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Booking Status
              </p>

              <div className="mt-2">
                <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold capitalize text-green-700">
                  {order.status || "Confirmed"}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Created
              </p>

              <p className="mt-2 font-semibold text-[#26332e]">
                {formatDate(order.created_at)}
              </p>
            </div>

          </div>
        </section>

        {/* Booking Total */}
        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <h2 className="text-xl font-bold text-[#26332e]">
                Booking Total
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Total amount associated with this booking.
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-3xl font-bold text-[#1d5c48]">
                {formatMoney(
                  order.total_amount,
                  order.total_currency
                )}
              </p>

              {order.total_currency && (
                <p className="mt-1 text-sm text-gray-500">
                  Currency: {order.total_currency}
                </p>
              )}
            </div>

          </div>
        </section>

        {/* Passenger Details */}
        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#26332e]">
              Passenger Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Passengers included in this booking.
            </p>
          </div>

          {passengers.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-5 text-center text-gray-600">
              No passenger details were returned by the booking provider.
            </div>
          ) : (
            <div className="space-y-4">
              {passengers.map((passenger, i) => (
                <div
                  key={passenger.id || i}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                >

                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d5c48] font-bold text-white">
                      {i + 1}
                    </div>

                    <div>
                      <p className="font-bold text-[#26332e]">
                        {passenger.given_name || ""}{" "}
                        {passenger.family_name || ""}
                      </p>

                      <p className="text-sm capitalize text-gray-500">
                        {passenger.type || "Passenger"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Full Name
                      </p>

                      <p className="mt-1 font-medium text-[#26332e]">
                        {passenger.given_name || "-"}{" "}
                        {passenger.family_name || ""}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Gender
                      </p>

                      <p className="mt-1 capitalize text-[#26332e]">
                        {passenger.gender || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Date of Birth
                      </p>

                      <p className="mt-1 text-[#26332e]">
                        {passenger.born_on || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Email
                      </p>

                      <p className="mt-1 break-all text-[#26332e]">
                        {passenger.email || "-"}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Phone
                      </p>

                      <p className="mt-1 text-[#26332e]">
                        {passenger.phone_number || "-"}
                      </p>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Important Information */}
        <section className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-amber-900">
            Important Information
          </h2>

          <ul className="mt-4 space-y-3 text-sm leading-6 text-amber-900">

            <li className="flex gap-3">
              <span className="font-bold">•</span>
              <span>
                Please save your booking reference and order ID.
              </span>
            </li>

            <li className="flex gap-3">
              <span className="font-bold">•</span>
              <span>
                Make sure the passenger names and personal details are
                correct.
              </span>
            </li>

            <li className="flex gap-3">
              <span className="font-bold">•</span>
              <span>
                Keep your booking confirmation for your travel records.
              </span>
            </li>

            <li className="flex gap-3">
              <span className="font-bold">•</span>
              <span>
                For assistance with your booking, please contact Papeg
                Tour & Travel.
              </span>
            </li>

          </ul>
        </section>

        {/* Actions */}
        <div className="flex flex-col justify-center gap-3 sm:flex-row">

          <Link
            href="/flight"
            className="rounded-xl bg-[#1d5c48] px-7 py-3 text-center font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Book Another Flight
          </Link>

          <Link
            href="/tours"
            className="rounded-xl border border-gray-300 bg-white px-7 py-3 text-center font-semibold text-[#26332e] shadow-sm transition hover:bg-gray-50"
          >
            Explore Our Tours
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-gray-300 bg-white px-7 py-3 text-center font-semibold text-[#26332e] shadow-sm transition hover:bg-gray-50"
          >
            Back to Home
          </Link>

        </div>

        {/* Footer Note */}
        <div className="py-10 text-center">
          <p className="text-sm text-gray-500">
            Thank you for choosing Papeg Tour & Travel.
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Discover Papua Highlands with us.
          </p>
        </div>

      </div>
    </main>
  );
}