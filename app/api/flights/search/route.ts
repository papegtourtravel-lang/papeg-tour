import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      from,
      to,
      departure,
      returnDate,
      passengers,
      cabin,
    } = body;

    // =========================
    // VALIDATE INPUT
    // =========================

    if (!from || !to || !departure) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Origin, destination, and departure date are required.",
        },
        { status: 400 }
      );
    }

    const origin = String(from).trim().toUpperCase();
    const destination = String(to).trim().toUpperCase();

    if (origin.length !== 3 || destination.length !== 3) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Airport codes must contain exactly 3 letters.",
        },
        { status: 400 }
      );
    }

    // =========================
    // DUFFEL TOKEN
    // =========================

    const token = process.env.DUFFEL_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Duffel API token is not configured.",
        },
        { status: 500 }
      );
    }

    // =========================
    // PASSENGERS
    // =========================

    const passengerCount =
      Math.min(
        Math.max(
          Number(passengers) || 1,
          1
        ),
        9
      );

    const duffelPassengers = Array.from(
      { length: passengerCount },
      () => ({
        type: "adult",
      })
    );

    // =========================
    // SLICES
    // =========================

    const slices: Array<{
      origin: string;
      destination: string;
      departure_date: string;
    }> = [
      {
        origin,
        destination,
        departure_date: departure,
      },
    ];

    if (returnDate) {
      slices.push({
        origin: destination,
        destination: origin,
        departure_date: returnDate,
      });
    }

    // =========================
    // DUFFEL OFFER REQUEST
    // =========================

    console.log(
      "Creating Duffel offer request:",
      {
        origin,
        destination,
        departure,
        returnDate,
        passengerCount,
        cabin,
      }
    );

    const duffelResponse = await fetch(
      "https://api.duffel.com/air/offer_requests",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "Duffel-Version": "v2",
        },
        body: JSON.stringify({
          data: {
            cabin_class:
              cabin || "economy",

            passengers:
              duffelPassengers,

            slices,

            return_offers: true,
          },
        }),
        cache: "no-store",
      }
    );

    const duffelData =
      await duffelResponse.json();

    // =========================
    // DUFFEL ERROR
    // =========================

    if (!duffelResponse.ok) {
      console.error(
        "Duffel Search Error:",
        duffelData
      );

      return NextResponse.json(
        {
          success: false,
          message:
            duffelData?.errors?.[0]?.message ||
            "Duffel flight search failed.",
          error: duffelData,
        },
        {
          status:
            duffelResponse.status,
        }
      );
    }

    // =========================
    // OFFERS
    // =========================

    const offers =
      Array.isArray(
        duffelData?.data?.offers
      )
        ? duffelData.data.offers
        : [];

    console.log(
      `Duffel returned ${offers.length} offers.`
    );

    // Debug passenger IDs
    if (offers.length > 0) {
      console.log(
        "First offer passenger IDs:",
        offers[0]?.passengers?.map(
          (passenger: {
            id?: string;
            type?: string;
          }) => ({
            id: passenger.id,
            type: passenger.type,
          })
        )
      );
    }

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({
      success: true,

      message:
        "Flight search successful.",

      search: {
        from: origin,
        to: destination,
        departure,
        returnDate:
          returnDate || null,
        passengers:
          passengerCount,
        cabin:
          cabin || "economy",
      },

      offers,
    });
  } catch (error) {
    console.error(
      "Flight Search Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal server error.",
      },
      { status: 500 }
    );
  }
}