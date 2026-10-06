
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const duffelToken = process.env.DUFFEL_ACCESS_TOKEN;

    if (!serverKey) {
      return NextResponse.json(
        { error: "MIDTRANS_SERVER_KEY belum diset" },
        { status: 500 }
      );
    }

    if (!duffelToken) {
      return NextResponse.json(
        { error: "DUFFEL_ACCESS_TOKEN belum diset" },
        { status: 500 }
      );
    }

    const orderId = body.orderId;
    const customer = body.customer || {};

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil harga asli dari Duffel
    const duffelResponse = await fetch(
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

    const duffelData = await duffelResponse.json();

    if (!duffelResponse.ok) {
      return NextResponse.json(
        {
          error: "Gagal mengambil order dari Duffel",
          details: duffelData,
        },
        { status: duffelResponse.status }
      );
    }

    const duffelOrder = duffelData?.data;

    const totalAmount = Number(duffelOrder?.total_amount);
    const totalCurrency = String(
      duffelOrder?.total_currency || ""
    ).toUpperCase();

    if (!totalAmount || !totalCurrency) {
      return NextResponse.json(
        { error: "Harga order Duffel tidak ditemukan" },
        { status: 400 }
      );
    }

    // Kurs dikunci melalui .env.local
    const eurIdrRate = Number(process.env.PAPEG_EUR_IDR_RATE);

    if (!eurIdrRate || eurIdrRate <= 0) {
      return NextResponse.json(
        {
          error: "PAPEG_EUR_IDR_RATE belum diset di .env.local",
        },
        { status: 500 }
      );
    }

    let idrAmount: number;

    if (totalCurrency === "IDR") {
      idrAmount = Math.round(totalAmount);
    } else if (totalCurrency === "EUR") {
      idrAmount = Math.round(totalAmount * eurIdrRate);
    } else {
      return NextResponse.json(
        {
          error: `Currency ${totalCurrency} belum didukung untuk pembayaran IDR.`,
        },
        { status: 400 }
      );
    }

    const auth = Buffer.from(`${serverKey}:`).toString("base64");

    const midtransOrderId = `PAPEG-${orderId}`;

    const response = await fetch(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          transaction_details: {
            order_id: midtransOrderId,
            gross_amount: idrAmount,
          },

          customer_details: {
            first_name: customer.firstName || "Customer",
            last_name: customer.lastName || "",
            email: customer.email || "",
            phone: customer.phone || "",
          },

          callbacks: {
            finish:
              `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/flights/payment`,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Midtrans menolak transaksi",
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,

      token: data.token,
      redirect_url: data.redirect_url,

      duffel: {
        orderId,
        amount: totalAmount,
        currency: totalCurrency,
      },

      payment: {
        amount: idrAmount,
        currency: "IDR",
        exchangeRate:
          totalCurrency === "EUR" ? eurIdrRate : null,
      },
    });
  } catch (error) {
    console.error("Midtrans error:", error);

    return NextResponse.json(
      {
        error: "Gagal membuat transaksi pembayaran",
      },
      { status: 500 }
    );
  }
}