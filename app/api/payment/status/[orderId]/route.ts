
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (
      !orderId ||
      orderId.length > 100 ||
      !/^[a-zA-Z0-9_-]+$/.test(orderId)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid order ID." },
        { status: 400 }
      );
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      return NextResponse.json(
        { success: false, error: "Midtrans server key is not configured." },
        { status: 500 }
      );
    }

    // This endpoint matches the existing Sandbox payment setup.
    const midtransOrderId = `PAPEG-${orderId}`;
    const credentials = Buffer.from(`${serverKey}:`).toString("base64");

    const response = await fetch(
      `https://api.sandbox.midtrans.com/v2/${encodeURIComponent(
        midtransOrderId
      )}/status`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${credentials}`,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // A transaction not found is not proof of payment.
      return NextResponse.json(
        {
          success: false,
          paid: false,
          error:
            data?.status_message ||
            "Could not verify the Midtrans transaction.",
        },
        { status: response.status === 404 ? 200 : 502 }
      );
    }

    if (data?.order_id !== midtransOrderId) {
      return NextResponse.json(
        {
          success: false,
          paid: false,
          error: "The Midtrans order ID does not match.",
        },
        { status: 502 }
      );
    }

    const transactionStatus = String(
      data?.transaction_status || ""
    ).toLowerCase();

    const fraudStatus = String(
      data?.fraud_status || ""
    ).toLowerCase();

    const paid =
      transactionStatus === "settlement" ||
      (transactionStatus === "capture" &&
        fraudStatus === "accept");

    const amount = Number(data?.gross_amount);

    if (paid && (!Number.isFinite(amount) || amount <= 0)) {
      return NextResponse.json(
        {
          success: false,
          paid: false,
          error: "Invalid payment amount returned by Midtrans.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        paid,
        payment: paid
          ? {
              orderId,
              midtransOrderId,
              amount,
              currency: "IDR",
              status: transactionStatus,
              transactionId: data?.transaction_id || null,
              paidAt:
                data?.settlement_time ||
                data?.transaction_time ||
                null,
            }
          : null,
        transactionStatus,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Midtrans status verification error:", error);

    return NextResponse.json(
      {
        success: false,
        paid: false,
        error: "Unable to verify payment status.",
      },
      { status: 500 }
    );
  }
}