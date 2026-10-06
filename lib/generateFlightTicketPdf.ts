import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";

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

type FlightTicketPdfData = {
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

export async function generateFlightTicketPdf(
  data: FlightTicketPdfData
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage([595.28, 841.89]);

  const regularFont = await pdfDoc.embedFont(
    StandardFonts.Helvetica
  );

  const boldFont = await pdfDoc.embedFont(
    StandardFonts.HelveticaBold
  );

  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();

  const green = rgb(
    29 / 255,
    92 / 255,
    72 / 255
  );

  const dark = rgb(
    38 / 255,
    51 / 255,
    46 / 255
  );

  const gray = rgb(
    107 / 255,
    114 / 255,
    128 / 255
  );

  const lightBackground = rgb(
    246 / 255,
    243 / 255,
    236 / 255
  );

  const lightGreen = rgb(
    236 / 255,
    253 / 255,
    245 / 255
  );

  const border = rgb(
    229 / 255,
    231 / 255,
    235 / 255
  );

  let y = pageHeight - 45;

  // ==============================
  // HEADER
  // ==============================

  page.drawRectangle({
    x: 35,
    y: y - 72,
    width: pageWidth - 70,
    height: 72,
    color: green,
  });

  page.drawText(
    "PAPEG TOUR & TRAVEL",
    {
      x: 55,
      y: y - 30,
      size: 19,
      font: boldFont,
      color: rgb(1, 1, 1),
    }
  );

  page.drawText(
    "Papua Highlands • Indonesia",
    {
      x: 55,
      y: y - 50,
      size: 9,
      font: regularFont,
      color: rgb(
        235 / 255,
        245 / 255,
        240 / 255
      ),
    }
  );

  y -= 95;

  // ==============================
  // TITLE
  // ==============================

  page.drawRectangle({
    x: 35,
    y: y - 78,
    width: pageWidth - 70,
    height: 78,
    color: lightGreen,
    borderColor: rgb(
      187 / 255,
      247 / 255,
      208 / 255
    ),
    borderWidth: 1,
  });

  page.drawText(
    "BOOKING CONFIRMED",
    {
      x: 52,
      y: y - 25,
      size: 9,
      font: boldFont,
      color: rgb(
        22 / 255,
        101 / 255,
        52 / 255
      ),
    }
  );

  page.drawText(
    "Electronic Ticket",
    {
      x: 52,
      y: y - 48,
      size: 19,
      font: boldFont,
      color: dark,
    }
  );

  page.drawText(
    "Thank you for booking with Papeg Tour & Travel.",
    {
      x: 52,
      y: y - 65,
      size: 8.5,
      font: regularFont,
      color: gray,
    }
  );

  y -= 102;

  // ==============================
  // BOOKING INFORMATION
  // ==============================

  page.drawText(
    "BOOKING INFORMATION",
    {
      x: 35,
      y,
      size: 12,
      font: boldFont,
      color: dark,
    }
  );

  y -= 20;

  page.drawRectangle({
    x: 35,
    y: y - 105,
    width: pageWidth - 70,
    height: 105,
    borderColor: border,
    borderWidth: 1,
  });

  // Booking Reference

  page.drawText(
    "BOOKING REFERENCE",
    {
      x: 52,
      y: y - 22,
      size: 7.5,
      font: boldFont,
      color: gray,
    }
  );

  page.drawText(
    data.bookingReference || "-",
    {
      x: 52,
      y: y - 42,
      size: 17,
      font: boldFont,
      color: green,
    }
  );

  // Order ID

  page.drawText(
    "ORDER ID",
    {
      x: 52,
      y: y - 62,
      size: 7.5,
      font: boldFont,
      color: gray,
    }
  );

  page.drawText(
    data.orderId || "-",
    {
      x: 52,
      y: y - 78,
      size: 8.5,
      font: regularFont,
      color: dark,
    }
  );

  // Status

  page.drawText(
    "STATUS",
    {
      x: 350,
      y: y - 22,
      size: 7.5,
      font: boldFont,
      color: gray,
    }
  );

  page.drawText(
    "CONFIRMED",
    {
      x: 350,
      y: y - 42,
      size: 11,
      font: boldFont,
      color: rgb(
        22 / 255,
        101 / 255,
        52 / 255
      ),
    }
  );

  y -= 135;

  // ==============================
  // PASSENGERS
  // ==============================

  page.drawText(
    "PASSENGER DETAILS",
    {
      x: 35,
      y,
      size: 12,
      font: boldFont,
      color: dark,
    }
  );

  y -= 20;

  const passengers = data.passengers || [];

  if (passengers.length === 0) {
    page.drawText(
      "Passenger information unavailable.",
      {
        x: 35,
        y,
        size: 9,
        font: regularFont,
        color: gray,
      }
    );

    y -= 25;
  } else {
    passengers.forEach(
      (passenger, index) => {
        page.drawRectangle({
          x: 35,
          y: y - 52,
          width: pageWidth - 70,
          height: 52,
          color: rgb(
            249 / 255,
            250 / 255,
            251 / 255
          ),
          borderColor: border,
          borderWidth: 1,
        });

        page.drawText(
          `PASSENGER ${index + 1}`,
          {
            x: 50,
            y: y - 18,
            size: 7.5,
            font: boldFont,
            color: gray,
          }
        );

        page.drawText(
          getPassengerName(passenger),
          {
            x: 50,
            y: y - 38,
            size: 11,
            font: boldFont,
            color: dark,
          }
        );

        if (passenger.email) {
          page.drawText(
            passenger.email,
            {
              x: 300,
              y: y - 38,
              size: 8,
              font: regularFont,
              color: gray,
            }
          );
        }

        y -= 62;
      }
    );
  }

  y -= 5;

  // ==============================
  // ELECTRONIC TICKET
  // ==============================

  page.drawText(
    "ELECTRONIC TICKET",
    {
      x: 35,
      y,
      size: 12,
      font: boldFont,
      color: dark,
    }
  );

  y -= 20;

  const ticketDocuments =
    (data.documents || []).filter(
      (document) =>
        document.type ===
        "electronic_ticket"
    );

  if (ticketDocuments.length === 0) {
    page.drawRectangle({
      x: 35,
      y: y - 45,
      width: pageWidth - 70,
      height: 45,
      color: rgb(
        255 / 255,
        247 / 255,
        237 / 255
      ),
    });

    page.drawText(
      "Electronic ticket information is being processed.",
      {
        x: 50,
        y: y - 27,
        size: 8.5,
        font: regularFont,
        color: rgb(
          154 / 255,
          52 / 255,
          18 / 255
        ),
      }
    );

    y -= 65;
  } else {
    ticketDocuments.forEach(
      (document, index) => {
        page.drawRectangle({
          x: 35,
          y: y - 58,
          width: pageWidth - 70,
          height: 58,
          color: lightBackground,
        });

        page.drawText(
          `TICKET IDENTIFIER${
            ticketDocuments.length > 1
              ? ` ${index + 1}`
              : ""
          }`,
          {
            x: 52,
            y: y - 19,
            size: 7.5,
            font: boldFont,
            color: gray,
          }
        );

        page.drawText(
          document.unique_identifier ||
            "-",
          {
            x: 52,
            y: y - 42,
            size: 15,
            font: boldFont,
            color: green,
          }
        );

        y -= 70;
      }
    );
  }

  // ==============================
  // PAYMENT
  // ==============================

  page.drawText(
    "PAYMENT",
    {
      x: 35,
      y,
      size: 12,
      font: boldFont,
      color: dark,
    }
  );

  y -= 20;

  page.drawRectangle({
    x: 35,
    y: y - 58,
    width: pageWidth - 70,
    height: 58,
    color: lightBackground,
  });

  page.drawText(
    "TOTAL PAID",
    {
      x: 52,
      y: y - 20,
      size: 7.5,
      font: boldFont,
      color: gray,
    }
  );

  page.drawText(
    formatMoney(
      data.totalAmount,
      data.totalCurrency
    ),
    {
      x: 52,
      y: y - 43,
      size: 16,
      font: boldFont,
      color: green,
    }
  );

  y -= 80;

  // ==============================
  // IMPORTANT INFORMATION
  // ==============================

  page.drawText(
    "IMPORTANT INFORMATION",
    {
      x: 35,
      y,
      size: 12,
      font: boldFont,
      color: dark,
    }
  );

  y -= 18;

  const informationLines = [
    "Please keep this electronic ticket and your",
    "identification documents with you when travelling.",
    "",
    "Please check your flight details before departure",
    "and arrive at the airport according to the airline's",
    "recommended check-in time.",
  ];

  informationLines.forEach(
    (line) => {
      page.drawText(line, {
        x: 35,
        y,
        size: 8,
        font: regularFont,
        color: gray,
      });

      y -= 12;
    }
  );

  // ==============================
  // FOOTER
  // ==============================

  page.drawLine({
    start: {
      x: 35,
      y: 58,
    },
    end: {
      x: pageWidth - 35,
      y: 58,
    },
    thickness: 1,
    color: border,
  });

  page.drawText(
    "Papeg Tour & Travel",
    {
      x: 35,
      y: 40,
      size: 9,
      font: boldFont,
      color: dark,
    }
  );

  page.drawText(
    "Wamena – Papua Pegunungan • Indonesia",
    {
      x: 35,
      y: 27,
      size: 7.5,
      font: regularFont,
      color: gray,
    }
  );

  page.drawText(
    "Thank you for choosing Papeg Tour & Travel.",
    {
      x: 35,
      y: 15,
      size: 7.5,
      font: regularFont,
      color: gray,
    }
  );

  const pdfBytes =
    await pdfDoc.save();

  return Buffer.from(pdfBytes);
}