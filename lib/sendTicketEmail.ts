type Passenger = {
  given_name?: string;
  family_name?: string;
  email?: string;
};

type TicketDocument = {
  passenger_ids?: string[];
  unique_identifier?: string;
  type?: string;
};

type TicketEmailData = {
  to: string;
  bookingReference?: string | null;
  orderId?: string | null;
  passengers?: Passenger[];
  documents?: TicketDocument[];
  totalAmount?: string | number | null;
  totalCurrency?: string | null;
};

function formatMoney(
  amount?: string | number | null,
  currency?: string | null
) {
  if (amount === null || amount === undefined) {
    return "-";
  }

  const value = Number(amount);

  if (Number.isNaN(value)) {
    return `${amount} ${currency || ""}`;
  }

  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency || "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toLocaleString("id-ID")} ${
      currency || ""
    }`;
  }
}

function getPassengerName(passenger?: Passenger) {
  if (!passenger) {
    return "-";
  }

  const name = [
    passenger.given_name,
    passenger.family_name,
  ]
    .filter(Boolean)
    .join(" ");

  return name || "-";
}

export async function sendTicketEmail(
  data: TicketEmailData
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const replyTo = process.env.EMAIL_REPLY_TO;

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY belum diset"
    );
  }

  if (!from) {
    throw new Error(
      "EMAIL_FROM belum diset"
    );
  }

  if (!data.to) {
    throw new Error(
      "Email tujuan belum diberikan"
    );
  }

  const passengers = data.passengers || [];

  const passengerHtml =
    passengers.length > 0
      ? passengers
          .map(
            (passenger, index) => `
              <div style="
                padding: 14px 0;
                border-bottom: 1px solid #e5e7eb;
              ">
                <strong>
                  Passenger ${index + 1}
                </strong>

                <div style="
                  margin-top: 5px;
                  font-size: 15px;
                ">
                  ${getPassengerName(passenger)}
                </div>

                ${
                  passenger.email
                    ? `
                      <div style="
                        margin-top: 4px;
                        color: #6b7280;
                        font-size: 13px;
                      ">
                        ${passenger.email}
                      </div>
                    `
                    : ""
                }
              </div>
            `
          )
          .join("")
      : `
          <p style="color:#6b7280;">
            Passenger information unavailable.
          </p>
        `;

  const documents = data.documents || [];

  const ticketDocuments = documents.filter(
    (document) =>
      document.type === "electronic_ticket"
  );

  const ticketHtml =
    ticketDocuments.length > 0
      ? ticketDocuments
          .map(
            (document, index) => `
              <div style="
                background:#f6f3ec;
                padding:16px;
                border-radius:10px;
                margin-top:10px;
              ">
                <strong>
                  Ticket Identifier ${
                    ticketDocuments.length > 1
                      ? index + 1
                      : ""
                  }
                </strong>

                <div style="
                  margin-top:6px;
                  font-size:18px;
                  font-weight:bold;
                  color:#1d5c48;
                  letter-spacing:1px;
                ">
                  ${
                    document.unique_identifier ||
                    "-"
                  }
                </div>
              </div>
            `
          )
          .join("")
      : `
          <div style="
            background:#fff7ed;
            padding:16px;
            border-radius:10px;
            color:#9a3412;
          ">
            Electronic ticket information
            is being processed.
          </div>
        `;

  const html = `
    <div style="
      font-family: Arial, Helvetica, sans-serif;
      background:#f3f4f6;
      padding:30px 15px;
      color:#26332e;
    ">

      <div style="
        max-width:650px;
        margin:0 auto;
      ">

        <!-- HEADER -->

        <div style="
          background:#1d5c48;
          color:white;
          padding:28px;
          border-radius:16px 16px 0 0;
        ">

          <div style="
            font-size:24px;
            font-weight:bold;
            letter-spacing:.5px;
          ">
            PAPEG TOUR & TRAVEL
          </div>

          <div style="
            margin-top:7px;
            opacity:.85;
            font-size:14px;
          ">
            Papua Highlands • Indonesia
          </div>

        </div>

        <!-- CONTENT -->

        <div style="
          background:white;
          padding:30px;
          border-radius:0 0 16px 16px;
        ">

          <div style="
            background:#ecfdf5;
            border:1px solid #bbf7d0;
            padding:18px;
            border-radius:12px;
            margin-bottom:25px;
          ">

            <div style="
              color:#166534;
              font-size:13px;
              font-weight:bold;
              text-transform:uppercase;
              letter-spacing:1px;
            ">
              Booking Confirmed
            </div>

            <h1 style="
              margin:7px 0 0;
              font-size:25px;
            ">
              Electronic Ticket
            </h1>

            <p style="
              margin:7px 0 0;
              color:#4b5563;
            ">
              Thank you for booking with
              Papeg Tour & Travel.
            </p>

          </div>

          <!-- BOOKING -->

          <h2 style="
            font-size:18px;
            margin-bottom:15px;
          ">
            Booking Information
          </h2>

          <div style="
            border:1px solid #e5e7eb;
            border-radius:12px;
            overflow:hidden;
          ">

            <div style="
              padding:15px;
              border-bottom:1px solid #e5e7eb;
            ">
              <div style="
                font-size:12px;
                color:#6b7280;
                text-transform:uppercase;
              ">
                Booking Reference
              </div>

              <div style="
                margin-top:5px;
                font-size:20px;
                font-weight:bold;
                color:#1d5c48;
              ">
                ${
                  data.bookingReference || "-"
                }
              </div>
            </div>

            <div style="
              padding:15px;
              border-bottom:1px solid #e5e7eb;
            ">
              <div style="
                font-size:12px;
                color:#6b7280;
                text-transform:uppercase;
              ">
                Order ID
              </div>

              <div style="
                margin-top:5px;
                font-size:14px;
                word-break:break-all;
              ">
                ${data.orderId || "-"}
              </div>
            </div>

            <div style="
              padding:15px;
            ">
              <div style="
                font-size:12px;
                color:#6b7280;
                text-transform:uppercase;
              ">
                Booking Status
              </div>

              <div style="
                margin-top:5px;
                font-weight:bold;
                color:#166534;
              ">
                Confirmed
              </div>
            </div>

          </div>

          <!-- PASSENGERS -->

          <h2 style="
            font-size:18px;
            margin-top:30px;
            margin-bottom:10px;
          ">
            Passenger Details
          </h2>

          ${passengerHtml}

          <!-- TICKET -->

          <h2 style="
            font-size:18px;
            margin-top:30px;
            margin-bottom:10px;
          ">
            Electronic Ticket
          </h2>

          ${ticketHtml}

          <!-- PAYMENT -->

          <h2 style="
            font-size:18px;
            margin-top:30px;
            margin-bottom:10px;
          ">
            Payment
          </h2>

          <div style="
            background:#f6f3ec;
            padding:20px;
            border-radius:12px;
          ">

            <div style="
              font-size:12px;
              color:#6b7280;
              text-transform:uppercase;
            ">
              Total Paid
            </div>

            <div style="
              margin-top:5px;
              font-size:25px;
              font-weight:bold;
              color:#1d5c48;
            ">
              ${formatMoney(
                data.totalAmount,
                data.totalCurrency
              )}
            </div>

          </div>

          <!-- INFORMATION -->

          <div style="
            margin-top:30px;
            padding:18px;
            background:#f9fafb;
            border-radius:12px;
            font-size:13px;
            line-height:1.6;
            color:#4b5563;
          ">

            <strong style="color:#26332e;">
              Important Information
            </strong>

            <p style="margin:8px 0 0;">
              Please keep this electronic ticket
              and your identification documents
              with you when travelling.
            </p>

            <p style="margin:8px 0 0;">
              Please check your flight details
              before departure and arrive at the
              airport according to the airline's
              recommended check-in time.
            </p>

          </div>

          <!-- FOOTER -->

          <div style="
            margin-top:30px;
            padding-top:20px;
            border-top:1px solid #e5e7eb;
            font-size:13px;
            color:#6b7280;
            line-height:1.6;
          ">

            <strong style="color:#26332e;">
              Papeg Tour & Travel
            </strong>

            <br />

            Wamena – Papua Pegunungan
            <br />

            Indonesia

            <br /><br />

            Thank you for choosing
            Papeg Tour & Travel.

          </div>

        </div>

      </div>

    </div>
  `;

  const response = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [data.to],
        reply_to: replyTo || undefined,
        subject:
          "Papeg Tour & Travel — Electronic Ticket",
        html,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error(
      "Resend ticket email error:",
      result
    );

    throw new Error(
      result?.message ||
        "Gagal mengirim email tiket"
    );
  }

  console.log(
    "Ticket email berhasil dikirim:",
    result
  );

  return result;
}