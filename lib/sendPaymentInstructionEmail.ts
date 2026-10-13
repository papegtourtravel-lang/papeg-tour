type PaymentInstructionEmailData = {
  to: string;
  customerName?: string;
  orderId: string;
  bookingReference?: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  amount: number;
  currency: "IDR";
  paymentUrl: string;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function sendPaymentInstructionEmail(
  data: PaymentInstructionEmailData
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const replyTo = process.env.EMAIL_REPLY_TO;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY belum diset");
  }

  if (!from) {
    throw new Error("EMAIL_FROM belum diset");
  }

  if (!data.to) {
    throw new Error("Email pelanggan belum diberikan");
  }

  if (
    !Number.isFinite(data.amount) ||
    data.amount <= 0
  ) {
    throw new Error("Nominal pembayaran tidak valid");
  }

  const paymentUrl = new URL(data.paymentUrl);
  if (
    paymentUrl.protocol !== "https:" &&
    paymentUrl.hostname !== "localhost"
  ) {
    throw new Error("URL pembayaran tidak valid");
  }

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f3f4f6;padding:24px 12px;color:#26332e">
      <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden">
        <div style="background:#1d5c48;color:#fff;padding:24px">
          <h1 style="margin:0;font-size:23px">PAPEG TOUR &amp; TRAVEL</h1>
          <p style="margin:8px 0 0">Informasi pemesanan penerbangan</p>
        </div>

        <div style="padding:24px">
          <h2 style="margin-top:0">Pemesanan Anda sedang menunggu pembayaran</h2>
          <p>Halo ${escapeHtml(data.customerName || "Pelanggan")},</p>
          <p>Transaksi pembayaran untuk pemesanan penerbangan Anda telah dibuat. Silakan lanjutkan pembayaran melalui halaman pembayaran yang aman.</p>

          <div style="background:#f6f3ec;border-radius:10px;padding:18px;margin:20px 0">
            <p style="margin:0 0 8px"><strong>Kode booking:</strong> ${escapeHtml(data.bookingReference || data.orderId)}</p>
            <p style="margin:0 0 8px"><strong>Order ID:</strong> ${escapeHtml(data.orderId)}</p>
            <p style="margin:0 0 8px"><strong>Rute:</strong> ${escapeHtml(data.origin || "-")} → ${escapeHtml(data.destination || "-")}</p>
            <p style="margin:0 0 8px"><strong>Tanggal keberangkatan:</strong> ${escapeHtml(data.departureDate || "-")}</p>
            <p style="margin:0"><strong>Total tagihan:</strong> ${escapeHtml(formatIDR(data.amount))}</p>
          </div>

          <p>Metode pembayaran dapat dipilih pada halaman pembayaran. Ikuti instruksi yang ditampilkan oleh penyedia pembayaran.</p>

          <p style="text-align:center;margin:28px 0">
            <a href="${escapeHtml(data.paymentUrl)}" style="display:inline-block;background:#1d5c48;color:#fff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:bold">
              Lanjutkan Pembayaran
            </a>
          </p>

          <p style="font-size:13px;color:#6b7280">Email ini bukan bukti pembayaran dan bukan e-ticket. E-ticket akan dikirim setelah pembayaran terverifikasi dan tiket berhasil diterbitkan.</p>
          <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0" />
          <p style="font-size:13px;color:#6b7280">Papeg Tour &amp; Travel<br />Wamena, Papua Pegunungan, Indonesia</p>
        </div>
      </div>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [data.to],
      reply_to: replyTo || undefined,
      subject: "Papeg Tour & Travel - Instruksi Pembayaran",
      html,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Resend payment email error:", result);
    throw new Error(
      result?.message || "Gagal mengirim email instruksi pembayaran"
    );
  }

  console.log("Email instruksi pembayaran berhasil dikirim:", result);
  return result;
}