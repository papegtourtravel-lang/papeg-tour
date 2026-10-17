
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type FlightBooking = {
  id: string;
  duffel_order_id: string;
  booking_reference: string | null;
  origin: string | null;
  destination: string | null;
  departure_date: string | null;
  passenger_count: number | null;
  total_amount: number | string | null;
  currency: string | null;
  payment_status: string;
  ticket_status: string;
  created_at: string;
};

function formatDate(value: string | null) {
  if (!value) return "Belum tersedia";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatAmount(
  amount: number | string | null,
  currency: string | null
) {
  if (amount === null || amount === undefined || !currency) {
    return "Belum tersedia";
  }

  const number = Number(amount);

  if (!Number.isFinite(number)) {
    return "Belum tersedia";
  }

  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(number);
  } catch {
    return `${number} ${currency}`;
  }
}

function formatStatus(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function FlightBookingHistory() {
  const [bookings, setBookings] = useState<FlightBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBookings() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
          throw new Error(
            "Sesi login tidak ditemukan. Silakan login kembali."
          );
        }

        const response = await fetch("/api/account-bookings", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error || "Riwayat penerbangan gagal dimuat."
          );
        }

        if (active) {
          setBookings(result.bookings ?? []);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Terjadi kesalahan saat memuat riwayat."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadBookings();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mt-8 rounded-2xl border border-[#deded5] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-[#26332e]">
          Riwayat Penerbangan
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Lihat pesanan penerbangan yang terhubung dengan akun Anda.
        </p>
      </div>

      {loading && (
        <p className="text-sm text-gray-600">
          Memuat riwayat penerbangan...
        </p>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="rounded-xl bg-[#f6f3ec] p-5 text-center">
          <p className="font-medium text-[#26332e]">
            Belum ada riwayat penerbangan.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Pesanan baru akan muncul setelah proses penyimpanan booking
            dihubungkan ke akun Anda.
          </p>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-xl border border-[#e5e5df] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-[#1d5c48]">
                    {booking.origin || "Asal belum tersedia"}
                    {" → "}
                    {booking.destination || "Tujuan belum tersedia"}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Keberangkatan: {formatDate(booking.departure_date)}
                  </p>
                </div>

                <div className="text-sm">
                  <span className="text-gray-500">Pembayaran: </span>
                  <span className="font-medium text-[#26332e]">
                    {formatStatus(booking.payment_status)}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-gray-500">Referensi pemesanan</p>
                  <p className="font-medium text-[#26332e]">
                    {booking.booking_reference || "Belum tersedia"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Status tiket</p>
                  <p className="font-medium text-[#26332e]">
                    {formatStatus(booking.ticket_status)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Jumlah penumpang</p>
                  <p className="font-medium text-[#26332e]">
                    {booking.passenger_count ?? "Belum tersedia"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Total pembayaran</p>
                  <p className="font-medium text-[#26332e]">
                    {formatAmount(booking.total_amount, booking.currency)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}