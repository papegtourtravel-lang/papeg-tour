import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const notification = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = notification;

    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      return NextResponse.json(
        {
          error: "MIDTRANS_SERVER_KEY belum diset",
        },
        { status: 500 }
      );
    }

    if (
      !order_id ||
      !status_code ||
      !gross_amount ||
      !signature_key
    ) {
      return NextResponse.json(
        {
          error: "Invalid Midtrans notification",
        },
        { status: 400 }
      );
    }

    // ==============================
    // VERIFY MIDTRANS SIGNATURE
    // ==============================

    const input =
      order_id +
      status_code +
      gross_amount +
      serverKey;

    const expectedSignature = crypto
      .createHash("sha512")
      .update(input)
      .digest("hex");

    if (expectedSignature !== signature_key) {
      console.error("Invalid Midtrans signature");

      return NextResponse.json(
        {
          error: "Invalid signature",
        },
        { status: 401 }
      );
    }

    // ==============================
    // DETERMINE PAYMENT STATUS
    // ==============================

    let paymentStatus = "pending";

    if (
      transaction_status === "settlement" &&
      fraud_status === "accept"
    ) {
      paymentStatus = "paid";
    } else if (
      transaction_status === "capture" &&
      fraud_status === "accept"
    ) {
      paymentStatus = "paid";
    } else if (transaction_status === "pending") {
      paymentStatus = "pending";
    } else if (transaction_status === "expire") {
      paymentStatus = "expired";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny"
    ) {
      paymentStatus = "failed";
    }

    console.log("=== MIDTRANS PAYMENT ===");
    console.log("Order ID:", order_id);
    console.log("Amount:", gross_amount);
    console.log("Payment Type:", payment_type);
    console.log("Transaction Status:", transaction_status);
    console.log("Fraud Status:", fraud_status);
    console.log("Payment Status:", paymentStatus);

    // ==============================
    // ONLY PROCESS SUCCESSFUL PAYMENT
    // ==============================

    if (paymentStatus !== "paid") {
      return NextResponse.json({
        success: true,
        payment_status: paymentStatus,
      });
    }

    // ==============================
    // CHECK DUFFEL TOKEN
    // ==============================

    const duffelToken = process.env.DUFFEL_ACCESS_TOKEN;

    if (!duffelToken) {
      console.error("DUFFEL_ACCESS_TOKEN belum diset");

      return NextResponse.json(
        {
          error: "DUFFEL_ACCESS_TOKEN belum diset",
        },
        { status: 500 }
      );
    }

    // ==============================
    // CONVERT MIDTRANS ORDER ID
    // ==============================

    const prefix = "PAPEG-";

    if (!order_id.startsWith(prefix)) {
      return NextResponse.json(
        {
          error: "Invalid Papeg order ID",
        },
        { status: 400 }
      );
    }

    const duffelOrderId = order_id.substring(
      prefix.length
    );

    console.log(
      "Duffel Order ID:",
      duffelOrderId
    );

    // ==============================
    // GET DUFFEL ORDER
    // ==============================

    const orderResponse = await fetch(
      `https://api.duffel.com/air/orders/${encodeURIComponent(
        duffelOrderId
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${duffelToken}`,
          "Duffel-Version": "v2",
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      console.error(
        "Duffel order error:",
        orderData
      );

      return NextResponse.json(
        {
          error: "Gagal mengambil order Duffel",
          details: orderData,
        },
        { status: 502 }
      );
    }

    const duffelOrder = orderData?.data;

    if (!duffelOrder) {
      return NextResponse.json(
        {
          error: "Order Duffel tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // ==============================
    // CHECK IF ALREADY PAID
    // ==============================

    if (
      duffelOrder.payment_status
        ?.awaiting_payment === false
    ) {
      console.log(
        "Duffel order sudah dibayar."
      );

      return NextResponse.json({
        success: true,
        payment_status: "paid",
        duffel_status: "already_paid",
        order_id: duffelOrderId,
      });
    }

    // ==============================
    // PAY DUFFEL HOLD ORDER
    // ==============================

    const paymentResponse = await fetch(
      "https://api.duffel.com/air/payments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${duffelToken}`,
          "Duffel-Version": "v2",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          data: {
            order_id: duffelOrderId,
            payment: {
              type: "balance",
              amount: duffelOrder.total_amount,
              currency: duffelOrder.total_currency,
            },
          },
        }),
      }
    );

    const paymentData =
      await paymentResponse.json();

    if (!paymentResponse.ok) {
      console.error(
        "Duffel payment failed:",
        paymentData
      );

      return NextResponse.json(
        {
          error: "Pembayaran Duffel gagal",
          details: paymentData,
        },
        { status: 502 }
      );
    }

    console.log(
      "Duffel payment berhasil:",
      paymentData
    );

    // ==============================
    // CHECK DUFFEL ORDER AGAIN
    // ==============================

    const finalResponse = await fetch(
      `https://api.duffel.com/air/orders/${encodeURIComponent(
        duffelOrderId
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${duffelToken}`,
          "Duffel-Version": "v2",
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const finalData =
      await finalResponse.json();

    if (!finalResponse.ok) {
      console.error(
        "Duffel final order check failed:",
        finalData
      );

      return NextResponse.json({
        success: true,
        payment_status: "paid",
        duffel_payment: "paid",
        ticket_status: "checking",
        order_id: duffelOrderId,
      });
    }

    const finalOrder = finalData?.data;

    console.log(
      "=== DUFFEL FINAL ORDER ==="
    );

    console.log(
      "Order ID:",
      finalOrder?.id
    );

    console.log(
      "Booking Reference:",
      finalOrder?.booking_reference
    );

    console.log(
      "Awaiting Payment:",
      finalOrder?.payment_status
        ?.awaiting_payment
    );

    console.log(
      "Documents:",
      finalOrder?.documents
    );

    return NextResponse.json({
      success: true,
      payment_status: "paid",
      duffel_payment: "paid",
      order_id: duffelOrderId,
      booking_reference:
        finalOrder?.booking_reference || null,
      awaiting_payment:
        finalOrder?.payment_status
          ?.awaiting_payment ?? null,
      documents:
        finalOrder?.documents || [],
    });
  } catch (error) {
    console.error(
      "Midtrans webhook error:",
      error
    );

    return NextResponse.json(
      {
        error: "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}