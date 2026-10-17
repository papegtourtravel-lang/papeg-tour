
import { NextRequest, NextResponse } from "next/server";

type ConvertedAmount = {
  amount: string | number | null;
  currency: string;
};

function convertForDisplay(
  amount: string | number | null | undefined,
  currency: string | null | undefined,
  rate: number
): ConvertedAmount {
  const normalizedCurrency = (currency || "EUR").toUpperCase();

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
    throw new Error("Invalid fare amount received from Duffel.");
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

    const baseCurrency =
      order.base_currency || order.total_currency || "EUR";

    const taxCurrency =
      order.tax_currency || order.total_currency || "EUR";

    const rate = Number(process.env.PAPEG_EUR_IDR_RATE);

    const hasEurAmount =
      (order.base_amount != null &&
        String(baseCurrency).toUpperCase() === "EUR") ||
      (order.tax_amount != null &&
        String(taxCurrency).toUpperCase() === "EUR");

    if (
      hasEurAmount &&
      (!Number.isFinite(rate) || rate <= 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "PAPEG_EUR_IDR_RATE is missing or invalid.",
        },
        { status: 500 }
      );
    }

    const effectiveRate =
      Number.isFinite(rate) && rate > 0 ? rate : 1;

    const baseDisplay = convertForDisplay(
      order.base_amount,
      baseCurrency,
      effectiveRate
    );

    const taxDisplay = convertForDisplay(
      order.tax_amount,
      taxCurrency,
      effectiveRate
    );

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        base_amount_display: baseDisplay.amount,
        base_currency_display: baseDisplay.currency,
        tax_amount_display: taxDisplay.amount,
        tax_currency_display: taxDisplay.currency,
      },
    });
  } catch (error) {
    console.error("Order API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error.",
      },
      { status: 500 }
    );
  }
}