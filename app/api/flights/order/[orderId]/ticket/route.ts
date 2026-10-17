
import { NextRequest, NextResponse } from "next/server";
import { generateFlightTicketPdf } from "@/lib/generateFlightTicketPdf";

function convertEurToIdr(
  amount: string | number | null | undefined,
  currency: string | null | undefined,
  rate: number
): {
  amount: string | number | null;
  currency: string;
} {
  const normalizedCurrency = (currency || "IDR").toUpperCase();

  if (amount === null || amount === undefined || amount === "") {
    return {
      amount: null,
      currency: normalizedCurrency,
    };
  }

  if (normalizedCurrency !== "EUR") {
    return {
      amount,
      currency: normalizedCurrency,
    };
  }

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    throw new Error("Invalid EUR amount received from Duffel.");
  }

  return {
    amount: String(Math.round(numericAmount * rate)),
    currency: "IDR",
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required." },
        { status: 400 }
      );
    }

    const token = process.env.DUFFEL_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "DUFFEL_ACCESS_TOKEN is not configured.",
        },
        { status: 500 }
      );
    }

    const eurIdrRate = Number(process.env.PAPEG_EUR_IDR_RATE);

    if (!Number.isFinite(eurIdrRate) || eurIdrRate <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "PAPEG_EUR_IDR_RATE is missing or invalid.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.duffel.com/air/orders/${encodeURIComponent(orderId)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Duffel-Version": "v2",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            data?.errors?.[0]?.message ||
            "Failed to fetch Duffel order.",
        },
        { status: response.status }
      );
    }

    const order = data?.data;

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking order data was not found.",
        },
        { status: 404 }
      );
    }

    const bookingReference =
      order.booking_reference ||
      order.booking_references?.[0]?.booking_reference ||
      order.id ||
      orderId;

    const total = convertEurToIdr(
      order.total_amount,
      order.total_currency,
      eurIdrRate
    );

    const base = convertEurToIdr(
      order.base_amount,
      order.base_currency || order.total_currency,
      eurIdrRate
    );

    const tax = convertEurToIdr(
      order.tax_amount,
      order.tax_currency || order.total_currency,
      eurIdrRate
    );

    const pdfBuffer = await generateFlightTicketPdf({
      bookingReference,
      orderId: order.id || orderId,

      passengers: order.passengers || [],
      documents: order.documents || [],
      slices: order.slices || [],

      totalAmount: total.amount,
      totalCurrency: total.currency,
      totalLabel: "ORDER TOTAL",

      baseAmount: base.amount,
      baseCurrency: base.currency,

      taxAmount: tax.amount,
      taxCurrency: tax.currency,

      bookingType: order.type || "flight",
      bookingStatus: order.status || "confirmed",
      createdAt: order.created_at || null,
      paidAt: null,
    });

    const safeReference = String(bookingReference).replace(
      /[^a-zA-Z0-9_-]/g,
      "_"
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Papeg_Flight_Ticket_${safeReference}.pdf"`,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Flight ticket PDF API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate flight ticket PDF.",
      },
      { status: 500 }
    );
  }
}