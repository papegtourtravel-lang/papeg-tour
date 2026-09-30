
import { NextResponse } from "next/server";

type PassengerInput = {
  id?: string;
  title?: string;
  given_name?: string;
  family_name?: string;
  born_on?: string;
  gender?: string;
  email?: string;
  phone_number?: string;
};

function normalizePhoneNumber(
  phone?: string
): string {
  if (!phone) return "";

  let value = phone.trim();

  // Hapus spasi, tanda kurung, titik, dan tanda hubung
  value = value.replace(
    /[\s().-]/g,
    ""
  );

  // 08123456789 -> +628123456789
  if (value.startsWith("0")) {
    return "+62" + value.substring(1);
  }

  // 628123456789 -> +628123456789
  if (value.startsWith("62")) {
    return "+" + value;
  }

  // +628123456789
  if (value.startsWith("+62")) {
    return value;
  }

  // Nomor internasional lain
  if (value.startsWith("+")) {
    return value;
  }

  return value;
}

function isValidPhoneNumber(
  phone: string
): boolean {
  // E.164: + diikuti 8-15 digit
  return /^\+[1-9]\d{7,14}$/.test(
    phone
  );
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const {
      offerId,
      passengers,
    } = body as {
      offerId?: string;
      passengers?: PassengerInput[];
    };

    // =========================
    // VALIDATE OFFER ID
    // =========================

    if (!offerId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Offer ID is required.",
        },
        { status: 400 }
      );
    }

    // =========================
    // VALIDATE PASSENGERS
    // =========================

    if (
      !Array.isArray(passengers) ||
      passengers.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Passenger information is required.",
        },
        { status: 400 }
      );
    }

    if (passengers.length > 9) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A maximum of 9 passengers can be booked in one order.",
        },
        { status: 400 }
      );
    }

    // =========================
    // DUFFEL TOKEN
    // =========================

    const token =
      process.env.DUFFEL_ACCESS_TOKEN;

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
    // DATE
    // =========================

    const todayString =
      new Date()
        .toISOString()
        .split("T")[0];

    // =========================
    // VALIDATE PASSENGER DATA
    // =========================

    for (
      let i = 0;
      i < passengers.length;
      i++
    ) {
      const passenger =
        passengers[i];

      if (!passenger.id) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Passenger ${
                i + 1
              } is missing the Duffel passenger ID. Please search for the flight again and select it again.`,
            code:
              "missing_passenger_id",
          },
          { status: 422 }
        );
      }

      if (!passenger.given_name) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Passenger ${
                i + 1
              } first name is required.`,
          },
          { status: 400 }
        );
      }

      if (!passenger.family_name) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Passenger ${
                i + 1
              } last name is required.`,
          },
          { status: 400 }
        );
      }

      if (!passenger.born_on) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Passenger ${
                i + 1
              } date of birth is required.`,
          },
          { status: 400 }
        );
      }

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
          passenger.born_on
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Passenger ${
                i + 1
              } date of birth must use YYYY-MM-DD format.`,
          },
          { status: 400 }
        );
      }

      if (
        passenger.born_on >
        todayString
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Passenger ${
                i + 1
              } date of birth cannot be in the future.`,
          },
          { status: 400 }
        );
      }

      if (!passenger.email) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Passenger ${
                i + 1
              } email is required.`,
          },
          { status: 400 }
        );
      }

      if (!passenger.phone_number) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Passenger ${
                i + 1
              } phone number is required.`,
          },
          { status: 400 }
        );
      }
    }

    // =========================
    // NORMALIZE PHONE NUMBERS
    // =========================

    const normalizedPassengers =
      passengers.map(
        (passenger) => ({
          ...passenger,
          phone_number:
            normalizePhoneNumber(
              passenger.phone_number
            ),
        })
      );

    // =========================
    // VALIDATE PHONE NUMBERS
    // =========================

    for (
      let i = 0;
      i <
      normalizedPassengers.length;
      i++
    ) {
      const phone =
        normalizedPassengers[i]
          .phone_number || "";

      if (
        !isValidPhoneNumber(phone)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Passenger ${
                i + 1
              } phone number is invalid. Please enter a valid international number, for example +628123456789.`,
            code:
              "invalid_phone_number",
          },
          { status: 400 }
        );
      }
    }

    // =========================
    // STEP 1
    // VERIFY OFFER
    // =========================

    const offerResponse =
      await fetch(
        `https://api.duffel.com/air/offers/${encodeURIComponent(
          offerId
        )}`,
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${token}`,
            Accept:
              "application/json",
            "Duffel-Version":
              "v2",
          },
          cache: "no-store",
        }
      );

    const offerData =
      await offerResponse.json();

    if (!offerResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The selected flight offer is no longer available. Please search again.",
          code:
            "offer_not_available",
        },
        { status: 422 }
      );
    }

    const currentOffer =
      offerData?.data;

    if (
      !currentOffer ||
      currentOffer.id !== offerId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The selected flight offer could not be verified. Please search again.",
          code:
            "offer_verification_failed",
        },
        { status: 422 }
      );
    }

    // =========================
    // CHECK EXPIRY
    // =========================

    if (currentOffer.expires_at) {
      const expiresAt =
        new Date(
          currentOffer.expires_at
        ).getTime();

      if (
        Number.isNaN(expiresAt) ||
        expiresAt <= Date.now()
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This flight offer has expired. Please search again.",
            code:
              "offer_expired",
            expires_at:
              currentOffer.expires_at,
          },
          { status: 422 }
        );
      }
    }

    // =========================
    // VERIFY PASSENGER IDS
    // =========================

    const offerPassengers =
      Array.isArray(
        currentOffer.passengers
      )
        ? currentOffer.passengers
        : [];

    const offerPassengerIds =
      offerPassengers
        .map(
          (passenger: {
            id?: string;
          }) => passenger.id
        )
        .filter(
          (
            id: string | undefined
          ): id is string =>
            Boolean(id)
        );

    for (
      let i = 0;
      i <
      normalizedPassengers.length;
      i++
    ) {
      const passenger =
        normalizedPassengers[i];

      if (
        !passenger.id ||
        !offerPassengerIds.includes(
          passenger.id
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Passenger ${
                i + 1
              } is not linked to the selected Duffel offer. Please search for the flight again and select it again.`,
            code:
              "passenger_offer_mismatch",
          },
          { status: 422 }
        );
      }
    }

    // =========================
    // PAYMENT REQUIREMENT
    // =========================

    const requiresInstantPayment =
      currentOffer
        ?.payment_requirements
        ?.requires_instant_payment ===
      true;

    if (
      requiresInstantPayment
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This flight requires instant payment and cannot be placed on hold. Please select another flight or continue with the payment flow.",
          code:
            "instant_payment_required",
          offer: {
            id: currentOffer.id,
            total_amount:
              currentOffer.total_amount,
            total_currency:
              currentOffer.total_currency,
          },
        },
        { status: 422 }
      );
    }

    // =========================
    // PREPARE PASSENGERS
    // =========================

    const orderPassengers =
      normalizedPassengers.map(
        (passenger) => ({
          id:
            passenger.id,

          title:
            passenger.title ||
            "mr",

          given_name:
            passenger.given_name,

          family_name:
            passenger.family_name,

          born_on:
            passenger.born_on,

          gender:
            passenger.gender ||
            "m",

          email:
            passenger.email,

          phone_number:
            passenger.phone_number,
        })
      );

    // =========================
    // STEP 2
    // CREATE HOLD ORDER
    // =========================

    const duffelResponse =
      await fetch(
        "https://api.duffel.com/air/orders",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
            "Duffel-Version":
              "v2",
          },

          body: JSON.stringify({
            data: {
              type: "hold",

              selected_offers: [
                offerId,
              ],

              passengers:
                orderPassengers,
            },
          }),
        }
      );

    const duffelData =
      await duffelResponse.json();

    // =========================
    // DUFFEL ORDER ERROR
    // =========================

    if (!duffelResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            duffelData?.errors?.[0]
              ?.message ||
            "Duffel booking request failed.",
          code:
            duffelData?.errors?.[0]
              ?.code ||
            "duffel_order_error",
        },
        {
          status:
            duffelResponse.status,
        }
      );
    }

    // =========================
    // SUCCESS
    // =========================

    return NextResponse.json({
      success: true,

      message:
        "Flight booking hold created successfully.",

      order:
        duffelData?.data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal server error.",
      },
      { status: 500 }
    );
  }
}