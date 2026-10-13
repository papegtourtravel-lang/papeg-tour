import { NextResponse } from "next/server";
import { sendPaymentInstructionEmail } from "@/lib/sendPaymentInstructionEmail";

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

const orderId = String(body.orderId || "").trim();
const customer = body.customer || {};

if (!orderId) {
  return NextResponse.json(
    { error: "orderId wajib diisi" },
    { status: 400 }
  );
}

// 1. Ambil order dan harga asli dari Duffel.
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

if (
  !Number.isFinite(totalAmount) ||
  totalAmount <= 0 ||
  !totalCurrency
) {
  return NextResponse.json(
    { error: "Harga order Duffel tidak valid" },
    { status: 400 }
  );
}

// 2. Hitung harga dalam rupiah.
const eurIdrRate = Number(process.env.PAPEG_EUR_IDR_RATE);

let idrAmount: number;

if (totalCurrency === "IDR") {
  idrAmount = Math.round(totalAmount);
} else if (totalCurrency === "EUR") {
  if (!Number.isFinite(eurIdrRate) || eurIdrRate <= 0) {
    return NextResponse.json(
      { error: "PAPEG_EUR_IDR_RATE belum diset dengan benar" },
      { status: 500 }
    );
  }

  idrAmount = Math.round(totalAmount * eurIdrRate);
} else {
  return NextResponse.json(
    {
      error: `Currency ${totalCurrency} belum didukung untuk pembayaran IDR.`,
    },
    { status: 400 }
  );
}

if (!Number.isSafeInteger(idrAmount) || idrAmount <= 0) {
  return NextResponse.json(
    { error: "Nominal pembayaran IDR tidak valid" },
    { status: 400 }
  );
}

// 3. Buat transaksi pembayaran Midtrans Sandbox.
const auth = Buffer.from(`${serverKey}:`).toString("base64");
const midtransOrderId = `PAPEG-${orderId}`;

const midtransResponse = await fetch(
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
        finish: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/flights/payment`,
      },
    }),
  }
);

const midtransData = await midtransResponse.json();

if (!midtransResponse.ok) {
  return NextResponse.json(
    {
      error: "Midtrans menolak transaksi",
      details: midtransData,
    },
    { status: midtransResponse.status }
  );
}

// 4. Ambil informasi rute dari order Duffel.
const firstSlice = duffelOrder?.slices?.[0];
const firstSegment = firstSlice?.segments?.[0];

const origin =
  firstSlice?.origin?.city_name ||
  firstSlice?.origin?.iata_code ||
  "";

const destination =
  firstSlice?.destination?.city_name ||
  firstSlice?.destination?.iata_code ||
  "";

const departureDate = firstSegment?.departing_at
  ? String(firstSegment.departing_at).split("T")[0]
  : "";

// 5. Kirim email instruksi pembayaran.
// Jika email gagal, transaksi Midtrans tetap berhasil dibuat.
let paymentEmailSent = false;

const customerEmail =
  typeof customer.email === "string"
    ? customer.email.trim()
    : "";

if (customerEmail && midtransData.redirect_url) {
  try {
    await sendPaymentInstructionEmail({
      to: customerEmail,
      customerName: [
        customer.firstName,
        customer.lastName,
      ]
        .filter(
          (part) =>
            typeof part === "string" && part.trim().length > 0
        )
        .join(" "),
      orderId,
      bookingReference:
        duffelOrder?.booking_reference || orderId,
      origin,
      destination,
      departureDate,
      amount: idrAmount,
      currency: "IDR",
      paymentUrl: midtransData.redirect_url,
    });

    paymentEmailSent = true;
  } catch (emailError) {
    console.error(
      "Gagal mengirim email instruksi pembayaran:",
      emailError
    );
  }
} else {
  console.warn(
    "Email instruksi pembayaran dilewati karena email pelanggan atau URL pembayaran tidak tersedia."
  );
}

// 6. Kembalikan hasil transaksi kepada halaman pembayaran.
return NextResponse.json({
  success: true,
  token: midtransData.token,
  redirect_url: midtransData.redirect_url,

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

  paymentEmailSent,
});

} catch (error) {
console.error("Midtrans payment creation error:", error);

return NextResponse.json(
  { error: "Gagal membuat transaksi pembayaran" },
  { status: 500 }
);

}
}
