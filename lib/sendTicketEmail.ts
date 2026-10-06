import { generateFlightTicketPdf } from "@/lib/generateFlightTicketPdf";

type Passenger = {
  id?: string;
  type?: string;
  given_name?: string;
  family_name?: string;
  gender?: string;
  born_on?: string;
  email?: string;
  phone_number?: string;
};

type TicketDocument = {
  passenger_ids?: string[];
  unique_identifier?: string;
  type?: string;
};

type Airport = {
  iata_code?: string;
  city_name?: string;
  name?: string;
};

type Carrier = {
  iata_code?: string;
  name?: string;
};

type SegmentPassenger = {
  passenger_id?: string;
  cabin_class?: string;
  cabin_class_marketing_name?: string;
  seat?: string | null;
  baggages?: {
    quantity?: number;
    type?: string;
  }[];
};

type Segment = {
  id?: string;
  departing_at?: string;
  arriving_at?: string;
  duration?: string;

  marketing_carrier_flight_number?: string;
  operating_carrier_flight_number?: string;

  origin_terminal?: string;
  destination_terminal?: string;

  aircraft?: {
    name?: string;
    iata_code?: string;
  };

  origin?: Airport;
  destination?: Airport;

  marketing_carrier?: Carrier;
  operating_carrier?: Carrier;

  passengers?: SegmentPassenger[];

  stops?: unknown[];
};

type Slice = {
  id?: string;
  duration?: string;
  origin?: Airport;
  destination?: Airport;
  segments?: Segment[];
  fare_brand_name?: string;
};

type TicketEmailData = {
  to: string;

  bookingReference?: string | null;
  orderId?: string | null;

  passengers?: Passenger[];
  documents?: TicketDocument[];

  slices?: Slice[];

  totalAmount?: string | number | null;
  totalCurrency?: string | null;

  baseAmount?: string | number | null;
  baseCurrency?: string | null;

  taxAmount?: string | number | null;
  taxCurrency?: string | null;

  bookingType?: string | null;
  bookingStatus?: string | null;
  createdAt?: string | null;

  paidAt?: string | null;
};

function formatMoney(
  amount?: string | number | null,
  currency?: string | null
) {
  if (
    amount === null ||
    amount === undefined ||
    amount === ""
  ) {
    return "-";
  }

  const value = Number(amount);

  if (Number.isNaN(value)) {
    return `${amount} ${currency || ""}`.trim();
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
    }`.trim();
  }
}

function getPassengerName(
  passenger?: Passenger
) {
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

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatFlightDate(
  value?: string | null
) {
  if (!value) {
    return "-";
  }

  const datePart = value.split("T")[0];

  if (!datePart) {
    return "-";
  }

  const [year, month, day] =
    datePart.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  const date = new Date(
    year,
    month - 1,
    day
  );

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatFlightTime(
  value?: string | null
) {
  if (!value) {
    return "-";
  }

  const timePart = value.split("T")[1];

  if (!timePart) {
    return "-";
  }

  return timePart.slice(0, 5);
}

function formatDuration(
  duration?: string | null
) {
  if (!duration) {
    return "-";
  }

  const hours =
    duration.match(/(\d+)H/)?.[1];

  const minutes =
    duration.match(/(\d+)M/)?.[1];

  const parts: string[] = [];

  if (hours) {
    parts.push(`${hours}h`);
  }

  if (minutes) {
    parts.push(`${minutes}m`);
  }

  return parts.length > 0
    ? parts.join(" ")
    : duration;
}

function getFlightNumber(
  segment?: Segment
) {
  if (!segment) {
    return "-";
  }

  const carrierCode =
    segment.marketing_carrier?.iata_code ||
    segment.operating_carrier?.iata_code ||
    "";

  const flightNumber =
    segment.marketing_carrier_flight_number ||
    segment.operating_carrier_flight_number ||
    "";

  return (
    `${carrierCode} ${flightNumber}`.trim() ||
    "-"
  );
}

function getCabinClass(
  segment?: Segment
) {
  if (!segment?.passengers?.length) {
    return "-";
  }

  return (
    segment.passengers[0]
      ?.cabin_class_marketing_name ||
    segment.passengers[0]
      ?.cabin_class ||
    "-"
  );
}

function getBaggageText(
  segment?: Segment
) {
  if (!segment?.passengers?.length) {
    return "-";
  }

  const baggage =
    segment.passengers[0]?.baggages ||
    [];

  if (!baggage.length) {
    return "Not specified";
  }

  return baggage
    .map((item) => {
      const quantity =
        item.quantity ?? 0;

      if (item.type === "checked") {
        return `${quantity} checked`;
      }

      if (
        item.type === "carry_on"
      ) {
        return `${quantity} carry-on`;
      }

      return `${quantity} ${
        item.type || "bag"
      }`;
    })
    .join(", ");
}

function getAirline(
  segment?: Segment
) {
  return (
    segment?.marketing_carrier?.name ||
    segment?.operating_carrier?.name ||
    "-"
  );
}

function getAircraft(
  segment?: Segment
) {
  return (
    segment?.aircraft?.name ||
    segment?.aircraft?.iata_code ||
    "-"
  );
}

// ==============================
// PASSENGER HTML
// ==============================

function createPassengerHtml(
  passengers: Passenger[]
) {
  if (passengers.length === 0) {
    return `
      <p style="color:#6b7280;">
        Passenger information unavailable.
      </p>
    `;
  }

  return passengers
    .map(
      (passenger, index) => `
        <div style="
          padding:14px 0;
          border-bottom:1px solid #e5e7eb;
        ">

          <strong>
            Passenger ${index + 1}
          </strong>

          <div style="
            margin-top:5px;
            font-size:15px;
            font-weight:bold;
          ">
            ${escapeHtml(
              getPassengerName(passenger)
            )}
          </div>

          <div style="
            margin-top:8px;
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:6px 20px;
            font-size:13px;
            color:#4b5563;
          ">

            <div>
              Gender:
              ${escapeHtml(
                passenger.gender || "-"
              )}
            </div>

            <div>
              Date of Birth:
              ${escapeHtml(
                passenger.born_on || "-"
              )}
            </div>

            <div>
              Email:
              ${escapeHtml(
                passenger.email || "-"
              )}
            </div>

            <div>
              Phone:
              ${escapeHtml(
                passenger.phone_number || "-"
              )}
            </div>

          </div>
        </div>
      `
    )
    .join("");
}

// ==============================
// ITINERARY HTML
// ==============================

function createItineraryHtml(
  slices: Slice[]
) {
  if (slices.length === 0) {
    return `
      <div style="
        background:#fff7ed;
        padding:16px;
        border-radius:10px;
        color:#9a3412;
      ">
        Flight itinerary information
        is not available.
      </div>
    `;
  }

  return slices
    .map((slice, sliceIndex) => {
      const segments =
        slice.segments || [];

      return `
        <div style="
          margin-top:16px;
          padding:18px;
          border:1px solid #e5e7eb;
          border-radius:12px;
        ">

          <div style="
            font-size:12px;
            color:#1d5c48;
            text-transform:uppercase;
            font-weight:bold;
            letter-spacing:1px;
          ">
            ${sliceIndex === 0
              ? "Outbound"
              : `Journey ${sliceIndex + 1}`}
          </div>

          <div style="
            margin-top:7px;
            font-size:18px;
            font-weight:bold;
          ">
            ${escapeHtml(
              slice.origin?.city_name ||
                slice.origin?.iata_code ||
                "-"
            )}

            to

            ${escapeHtml(
              slice.destination
                ?.city_name ||
                slice.destination
                  ?.iata_code ||
                "-"
            )}
          </div>

          ${
            slice.fare_brand_name
              ? `
                <div style="
                  margin-top:5px;
                  font-size:12px;
                  color:#6b7280;
                ">
                  Fare:
                  ${escapeHtml(
                    slice.fare_brand_name
                  )}
                </div>
              `
              : ""
          }

          ${
            segments.length > 0
              ? segments
                  .map(
                    (
                      segment,
                      segmentIndex
                    ) => `
                      <div style="
                        margin-top:15px;
                        padding-top:15px;
                        border-top:1px solid #f0f0f0;
                      ">

                        <div style="
                          font-size:12px;
                          color:#6b7280;
                        ">
                          Segment ${
                            segmentIndex + 1
                          }
                        </div>

                        <div style="
                          margin-top:8px;
                          font-size:16px;
                          font-weight:bold;
                          color:#26332e;
                        ">
                          ${escapeHtml(
                            segment.origin
                              ?.iata_code ||
                              "-"
                          )}

                          to

                          ${escapeHtml(
                            segment.destination
                              ?.iata_code ||
                              "-"
                          )}
                        </div>

                        <div style="
                          margin-top:6px;
                          font-size:13px;
                          color:#4b5563;
                        ">
                          ${escapeHtml(
                            segment.origin
                              ?.city_name ||
                              "-"
                          )}
                          to
                          ${escapeHtml(
                            segment.destination
                              ?.city_name ||
                              "-"
                          )}
                        </div>

                        <div style="
                          margin-top:10px;
                          display:grid;
                          grid-template-columns:1fr 1fr;
                          gap:8px 20px;
                          font-size:13px;
                        ">

                          <div>
                            <strong>
                              Departure
                            </strong>
                            <br />
                            ${escapeHtml(
                              formatFlightDate(
                                segment.departing_at
                              )
                            )}
                            -
                            ${escapeHtml(
                              formatFlightTime(
                                segment.departing_at
                              )
                            )}
                          </div>

                          <div>
                            <strong>
                              Arrival
                            </strong>
                            <br />
                            ${escapeHtml(
                              formatFlightDate(
                                segment.arriving_at
                              )
                            )}
                            -
                            ${escapeHtml(
                              formatFlightTime(
                                segment.arriving_at
                              )
                            )}
                          </div>

                          <div>
                            <strong>
                              Airline
                            </strong>
                            <br />
                            ${escapeHtml(
                              getAirline(
                                segment
                              )
                            )}
                          </div>

                          <div>
                            <strong>
                              Flight
                            </strong>
                            <br />
                            ${escapeHtml(
                              getFlightNumber(
                                segment
                              )
                            )}
                          </div>

                          <div>
                            <strong>
                              Cabin
                            </strong>
                            <br />
                            ${escapeHtml(
                              getCabinClass(
                                segment
                              )
                            )}
                          </div>

                          <div>
                            <strong>
                              Aircraft
                            </strong>
                            <br />
                            ${escapeHtml(
                              getAircraft(
                                segment
                              )
                            )}
                          </div>

                          <div>
                            <strong>
                              Duration
                            </strong>
                            <br />
                            ${escapeHtml(
                              formatDuration(
                                segment.duration
                              )
                            )}
                          </div>

                          <div>
                            <strong>
                              Baggage
                            </strong>
                            <br />
                            ${escapeHtml(
                              getBaggageText(
                                segment
                              )
                            )}
                          </div>

                          ${
                            segment
                              .origin_terminal
                              ? `
                                <div>
                                  <strong>
                                    Departure Terminal
                                  </strong>
                                  <br />
                                  ${escapeHtml(
                                    segment.origin_terminal
                                  )}
                                </div>
                              `
                              : ""
                          }

                          ${
                            segment
                              .destination_terminal
                              ? `
                                <div>
                                  <strong>
                                    Arrival Terminal
                                  </strong>
                                  <br />
                                  ${escapeHtml(
                                    segment.destination_terminal
                                  )}
                                </div>
                              `
                              : ""
                          }

                        </div>

                      </div>
                    `
                  )
                  .join("")
              : `
                <p style="
                  margin-top:15px;
                  color:#6b7280;
                  font-size:13px;
                ">
                  Segment information unavailable.
                </p>
              `
          }

        </div>
      `;
    })
    .join("");
}

export async function sendTicketEmail(
  data: TicketEmailData
) {
  const apiKey =
    process.env.RESEND_API_KEY;

  const from =
    process.env.EMAIL_FROM;

  const replyTo =
    process.env.EMAIL_REPLY_TO;

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

  const passengers =
    data.passengers || [];

  const documents =
    data.documents || [];

  const slices =
    data.slices || [];

  const ticketDocuments =
    documents.filter(
      (document) =>
        document.type ===
        "electronic_ticket"
    );

  const passengerHtml =
    createPassengerHtml(
      passengers
    );

  const itineraryHtml =
    createItineraryHtml(
      slices
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
                  word-break:break-all;
                ">
                  ${escapeHtml(
                    document.unique_identifier ||
                      "-"
                  )}
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
      font-family:Arial,Helvetica,sans-serif;
      background:#f3f4f6;
      padding:30px 15px;
      color:#26332e;
    ">

      <div style="
        max-width:700px;
        margin:0 auto;
      ">

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
            Papua Highlands - Indonesia
          </div>

        </div>

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
                ${escapeHtml(
                  data.bookingReference ||
                    "-"
                )}
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
                ${escapeHtml(
                  data.orderId || "-"
                )}
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
                Booking Status
              </div>

              <div style="
                margin-top:5px;
                font-weight:bold;
                color:#166534;
              ">
                ${escapeHtml(
                  data.bookingStatus ||
                    "Confirmed"
                )}
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
                Booking Type
              </div>

              <div style="
                margin-top:5px;
                font-weight:bold;
              ">
                ${escapeHtml(
                  data.bookingType || "-"
                )}
              </div>
            </div>

          </div>

          <h2 style="
            font-size:18px;
            margin-top:30px;
            margin-bottom:10px;
          ">
            Flight Itinerary
          </h2>

          ${itineraryHtml}

          <h2 style="
            font-size:18px;
            margin-top:30px;
            margin-bottom:10px;
          ">
            Passenger Details
          </h2>

          ${passengerHtml}

          <h2 style="
            font-size:18px;
            margin-top:30px;
            margin-bottom:10px;
          ">
            Electronic Ticket
          </h2>

          ${ticketHtml}

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

            ${
              data.baseAmount !==
                undefined ||
              data.taxAmount !==
                undefined
                ? `
                  <div style="
                    margin-top:15px;
                    padding-top:12px;
                    border-top:1px solid #ddd;
                    font-size:13px;
                  ">

                    ${
                      data.baseAmount !==
                      undefined
                        ? `
                          <div style="
                            display:flex;
                            justify-content:space-between;
                            margin-bottom:7px;
                          ">
                            <span>
                              Base fare
                            </span>

                            <strong>
                              ${formatMoney(
                                data.baseAmount,
                                data.baseCurrency
                              )}
                            </strong>
                          </div>
                        `
                        : ""
                    }

                    ${
                      data.taxAmount !==
                      undefined
                        ? `
                          <div style="
                            display:flex;
                            justify-content:space-between;
                          ">
                            <span>
                              Tax
                            </span>

                            <strong>
                              ${formatMoney(
                                data.taxAmount,
                                data.taxCurrency
                              )}
                            </strong>
                          </div>
                        `
                        : ""
                    }

                  </div>
                `
                : ""
            }

          </div>

          ${
            data.paidAt
              ? `
                <p style="
                  margin-top:12px;
                  font-size:13px;
                  color:#6b7280;
                ">
                  Payment recorded on
                  ${escapeHtml(
                    formatFlightDate(
                      data.paidAt
                    )
                  )}.
                </p>
              `
              : ""
          }

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
              Please check your flight date
              and departure time carefully.
            </p>

            <p style="margin:8px 0 0;">
              Airport check-in and boarding
              requirements are determined by
              the operating airline.
            </p>

            <p style="margin:8px 0 0;">
              Please carry the identification
              document used during booking.
            </p>

            <p style="margin:8px 0 0;">
              Flight schedules may be subject
              to airline changes.
            </p>

          </div>

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

            Wamena - Papua Pegunungan

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

  // ==============================
  // GENERATE PDF
  // ==============================

  let pdfBuffer: Buffer | null =
    null;

  try {
    pdfBuffer =
      await generateFlightTicketPdf({
        bookingReference:
          data.bookingReference,

        orderId:
          data.orderId,

        passengers,

        documents,

        slices,

        totalAmount:
          data.totalAmount,

        totalCurrency:
          data.totalCurrency,

        baseAmount:
          data.baseAmount,

        baseCurrency:
          data.baseCurrency,

        taxAmount:
          data.taxAmount,

        taxCurrency:
          data.taxCurrency,

        bookingType:
          data.bookingType,

        bookingStatus:
          data.bookingStatus,

        createdAt:
          data.createdAt,

        paidAt:
          data.paidAt,
      });

    console.log(
      "Flight ticket PDF berhasil dibuat."
    );
  } catch (pdfError) {
    console.error(
      "Gagal membuat flight ticket PDF:",
      pdfError
    );

    // Email tetap dikirim walaupun
    // PDF gagal dibuat.
    pdfBuffer = null;
  }

  // ==============================
  // PDF FILE NAME
  // ==============================

  const safeReference =
    (
      data.bookingReference ||
      "Booking"
    )
      .replace(
        /[^a-zA-Z0-9-_]/g,
        ""
      )
      .trim();

  const pdfFileName =
    `Papeg_Flight_Ticket_${
      safeReference || "Booking"
    }.pdf`;

  // ==============================
  // RESEND PAYLOAD
  // ==============================

  const resendPayload: {
    from: string;
    to: string[];
    reply_to?: string;
    subject: string;
    html: string;
    attachments?: Array<{
      filename: string;
      content: string;
    }>;
  } = {
    from,
    to: [data.to],

    reply_to:
      replyTo || undefined,

    subject:
      "Papeg Tour & Travel - Electronic Ticket",

    html,
  };

  // ==============================
  // ADD PDF ATTACHMENT
  // ==============================

  if (pdfBuffer) {
    resendPayload.attachments = [
      {
        filename: pdfFileName,
        content:
          pdfBuffer.toString(
            "base64"
          ),
      },
    ];
  }

  // ==============================
  // SEND EMAIL
  // ==============================

  const response = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${apiKey}`,

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(
        resendPayload
      ),
    }
  );

  const result =
    await response.json();

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