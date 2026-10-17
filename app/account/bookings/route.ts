
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error(
        "Supabase server configuration is missing."
      );

      return NextResponse.json(
        { error: "Konfigurasi server belum lengkap." },
        { status: 500 }
      );
    }

    const authorization =
      request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const accessToken =
      authorization.slice("Bearer ".length).trim();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Sesi login tidak valid." },
        { status: 401 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verifikasi token melalui Supabase Auth.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sesi tidak valid. Silakan login kembali." },
        { status: 401 }
      );
    }

    // Gunakan ID dari pengguna terverifikasi,
    // bukan user_id yang dikirim browser.
    const { data: bookings, error: bookingsError } =
      await supabase
        .from("flight_bookings")
        .select(
          "id, duffel_order_id, booking_reference, origin, destination, departure_date, passenger_count, total_amount, currency, payment_status, ticket_status, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (bookingsError) {
      console.error(
        "Failed to load flight booking history:",
        bookingsError.message
      );

      return NextResponse.json(
        { error: "Riwayat penerbangan gagal dimuat." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bookings: bookings ?? [],
    });
  } catch (error) {
    console.error(
      "Flight booking history endpoint error:",
      error
    );

    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}