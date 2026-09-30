import { NextRequest, NextResponse } from "next/server";

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
        { success: false, error: "DUFFEL_ACCESS_TOKEN is not configured." },
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
          error: data?.errors?.[0]?.message || "Failed to fetch Duffel order.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      order: data?.data,
    });
  } catch (error) {
    console.error("Order API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error.",
      },
      { status: 500 }
    );
  }
}