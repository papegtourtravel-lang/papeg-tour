import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderId = body.orderId;
    const duffelToken = process.env.DUFFEL_ACCESS_TOKEN;

    if (!duffelToken) {
      return NextResponse.json(
        { error: "DUFFEL_ACCESS_TOKEN belum diset" },
        { status: 500 }
      );
    }

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil harga TERBARU dari Duffel
    const orderResponse = await fetch(
      `https://api.duffel.com/air/orders/${encodeURIComponent(orderId)}`,
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
      return NextResponse.json(
        {
          error: "Gagal mengambil order Duffel",
          details: orderData,
        },
        { status: orderResponse.status }
      );
    }

    const order = orderData?.data;

    if (!order) {
      return NextResponse.json(
        { error: "Data order Duffel tidak ditemukan" },
        { status: 404 }
      );
    }

    if (order.type !== "hold") {
      return NextResponse.json(
        {
          error: "Order bukan hold order",
        },
        { status: 400 }
      );
    }

    if (order.payment_status?.awaiting_payment === false) {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        message: "Order Duffel sudah dibayar.",
        order,
      });
    }

    const amount = order.total_amount;
    const currency = order.total_currency;

    if (!amount || !currency) {
      return NextResponse.json(
        {
          error: "Harga order Duffel tidak tersedia",
        },
        { status: 400 }
      );
    }

    // Bayar hold order melalui Duffel
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
            order_id: orderId,
            payment: {
              type: "balance",
              amount,
              currency,
            },
          },
        }),
      }
    );

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok) {
      return NextResponse.json(
        {
          error: "Duffel menolak pembayaran order",
          details: paymentData,
        },
        { status: paymentResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pembayaran Duffel berhasil dikirim.",
      payment: paymentData?.data,
    });
  } catch (error) {
    console.error("Duffel payment error:", error);

    return NextResponse.json(
      {
        error: "Gagal membayar order Duffel",
      },
      { status: 500 }
    );
  }
}