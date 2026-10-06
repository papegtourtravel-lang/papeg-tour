import {
  PDFDocument,
  StandardFonts,
  rgb,
  PDFPage,
} from "pdf-lib";

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

type FlightTicketPdfData = {
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

function formatDate(
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

function formatTime(
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

function formatDateTime(
  value?: string | null
) {
  if (!value) {
    return "-";
  }

  return `${formatDate(value)} ${formatTime(value)}`;
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

function getAirline(
  segment?: Segment
) {
  return (
    segment?.marketing_carrier?.name ||
    segment?.operating_carrier?.name ||
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

function getAircraft(
  segment?: Segment
) {
  return (
    segment?.aircraft?.name ||
    segment?.aircraft?.iata_code ||
    "-"
  );
}

function getBaggage(
  segment?: Segment
) {
  if (!segment?.passengers?.length) {
    return "-";
  }

  const baggage =
    segment.passengers[0]?.baggages ||
    [];

  if (baggage.length === 0) {
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

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  font: any,
  color: any
) {
  page.drawText(text || "-", {
    x,
    y,
    size,
    font,
    color,
  });
}

function drawLabelValue(
  page: PDFPage,
  label: string,
  value: string,
  x: number,
  y: number,
  regularFont: any,
  boldFont: any,
  colors: {
    gray: any;
    dark: any;
  }
) {
  drawText(
    page,
    label.toUpperCase(),
    x,
    y,
    7,
    boldFont,
    colors.gray
  );

  drawText(
    page,
    value || "-",
    x,
    y - 14,
    9,
    regularFont,
    colors.dark
  );
}

export async function generateFlightTicketPdf(
  data: FlightTicketPdfData
): Promise<Buffer> {
  const pdfDoc =
    await PDFDocument.create();

  const regularFont =
    await pdfDoc.embedFont(
      StandardFonts.Helvetica
    );

  const boldFont =
    await pdfDoc.embedFont(
      StandardFonts.HelveticaBold
    );

  const pageWidth = 595.28;
  const pageHeight = 841.89;

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

  const white = rgb(
    1,
    1,
    1
  );

  const successGreen = rgb(
    22 / 255,
    101 / 255,
    52 / 255
  );

  const warningBackground = rgb(
    255 / 255,
    247 / 255,
    237 / 255
  );

  const warningText = rgb(
    154 / 255,
    52 / 255,
    18 / 255
  );

  const margin = 35;

  let page =
    pdfDoc.addPage([
      pageWidth,
      pageHeight,
    ]);

  let y =
    pageHeight - 45;

  function addPage() {
    page =
      pdfDoc.addPage([
        pageWidth,
        pageHeight,
      ]);

    y =
      pageHeight - 45;

    drawPageHeader();

    y -= 90;
  }

  function ensureSpace(
    requiredHeight: number
  ) {
    if (
      y - requiredHeight <
      75
    ) {
      addPage();
    }
  }

  function drawPageHeader() {
    page.drawRectangle({
      x: margin,
      y: pageHeight - 85,
      width:
        pageWidth -
        margin * 2,
      height: 55,
      color: green,
    });

    drawText(
      page,
      "PAPEG TOUR & TRAVEL",
      margin + 20,
      pageHeight - 53,
      16,
      boldFont,
      white
    );

    drawText(
      page,
      "Papua Highlands - Indonesia",
      margin + 20,
      pageHeight - 70,
      8,
      regularFont,
      rgb(
        235 / 255,
        245 / 255,
        240 / 255
      )
    );
  }

  // ============================
  // FIRST PAGE HEADER
  // ============================

  page.drawRectangle({
    x: margin,
    y: y - 72,
    width:
      pageWidth -
      margin * 2,
    height: 72,
    color: green,
  });

  drawText(
    page,
    "PAPEG TOUR & TRAVEL",
    55,
    y - 30,
    19,
    boldFont,
    white
  );

  drawText(
    page,
    "Papua Highlands - Indonesia",
    55,
    y - 50,
    9,
    regularFont,
    rgb(
      235 / 255,
      245 / 255,
      240 / 255
    )
  );

  y -= 95;

  // ============================
  // TITLE
  // ============================

  page.drawRectangle({
    x: margin,
    y: y - 78,
    width:
      pageWidth -
      margin * 2,
    height: 78,
    color: lightGreen,
    borderColor: rgb(
      187 / 255,
      247 / 255,
      208 / 255
    ),
    borderWidth: 1,
  });

  drawText(
    page,
    "BOOKING CONFIRMED",
    52,
    y - 25,
    9,
    boldFont,
    successGreen
  );

  drawText(
    page,
    "Electronic Ticket",
    52,
    y - 48,
    19,
    boldFont,
    dark
  );

  drawText(
    page,
    "Thank you for booking with Papeg Tour & Travel.",
    52,
    y - 65,
    8.5,
    regularFont,
    gray
  );

  y -= 102;

  // ============================
  // BOOKING INFORMATION
  // ============================

  drawText(
    page,
    "BOOKING INFORMATION",
    margin,
    y,
    12,
    boldFont,
    dark
  );

  y -= 20;

  page.drawRectangle({
    x: margin,
    y: y - 122,
    width:
      pageWidth -
      margin * 2,
    height: 122,
    borderColor: border,
    borderWidth: 1,
  });

  drawLabelValue(
    page,
    "Booking Reference",
    data.bookingReference ||
      "-",
    52,
    y - 20,
    regularFont,
    boldFont,
    { gray, dark }
  );

  drawLabelValue(
    page,
    "Order ID",
    data.orderId || "-",
    52,
    y - 57,
    regularFont,
    boldFont,
    { gray, dark }
  );

  drawLabelValue(
    page,
    "Status",
    data.bookingStatus ||
      "CONFIRMED",
    350,
    y - 20,
    regularFont,
    boldFont,
    { gray, dark }
  );

  drawLabelValue(
    page,
    "Booking Type",
    data.bookingType ||
      "-",
    350,
    y - 57,
    regularFont,
    boldFont,
    { gray, dark }
  );

  drawLabelValue(
    page,
    "Created",
    formatDateTime(
      data.createdAt
    ),
    52,
    y - 94,
    regularFont,
    boldFont,
    { gray, dark }
  );

  drawLabelValue(
    page,
    "Paid",
    formatDateTime(
      data.paidAt
    ),
    350,
    y - 94,
    regularFont,
    boldFont,
    { gray, dark }
  );

  y -= 152;

  // ============================
  // FLIGHT ITINERARY
  // ============================

  drawText(
    page,
    "FLIGHT ITINERARY",
    margin,
    y,
    12,
    boldFont,
    dark
  );

  y -= 20;

  const slices =
    data.slices || [];

  if (slices.length === 0) {
    page.drawRectangle({
      x: margin,
      y: y - 48,
      width:
        pageWidth -
        margin * 2,
      height: 48,
      color: warningBackground,
    });

    drawText(
      page,
      "Flight itinerary information is not available.",
      50,
      y - 28,
      8.5,
      regularFont,
      warningText
    );

    y -= 68;
  } else {
    slices.forEach(
      (slice, sliceIndex) => {
        const segments =
          slice.segments ||
          [];

        ensureSpace(
          100
        );

        const sliceTitle =
          sliceIndex === 0
            ? "OUTBOUND"
            : sliceIndex === 1
              ? "RETURN"
              : `JOURNEY ${
                  sliceIndex + 1
                }`;

        drawText(
          page,
          sliceTitle,
          margin,
          y,
          9,
          boldFont,
          green
        );

        y -= 16;

        const route =
          `${
            slice.origin
              ?.city_name ||
            slice.origin
              ?.iata_code ||
            "-"
          } to ${
            slice.destination
              ?.city_name ||
            slice.destination
              ?.iata_code ||
            "-"
          }`;

        drawText(
          page,
          route,
          margin,
          y,
          14,
          boldFont,
          dark
        );

        y -= 18;

        if (
          slice.fare_brand_name
        ) {
          drawText(
            page,
            `Fare: ${slice.fare_brand_name}`,
            margin,
            y,
            8,
            regularFont,
            gray
          );

          y -= 14;
        }

        if (
          segments.length === 0
        ) {
          drawText(
            page,
            "Segment information unavailable.",
            margin,
            y,
            8,
            regularFont,
            gray
          );

          y -= 25;

          return;
        }

        segments.forEach(
          (
            segment,
            segmentIndex
          ) => {
            const boxHeight = 164;

            ensureSpace(
              boxHeight + 15
            );

            page.drawRectangle({
              x: margin,
              y:
                y -
                boxHeight,
              width:
                pageWidth -
                margin * 2,
              height:
                boxHeight,
              color: rgb(
                249 / 255,
                250 / 255,
                251 / 255
              ),
              borderColor:
                border,
              borderWidth: 1,
            });

            drawText(
              page,
              `SEGMENT ${
                segmentIndex + 1
              }`,
              50,
              y - 18,
              7.5,
              boldFont,
              gray
            );

            const originCode =
              segment.origin
                ?.iata_code ||
              "-";

            const destinationCode =
              segment.destination
                ?.iata_code ||
              "-";

            drawText(
              page,
              `${originCode}  TO  ${destinationCode}`,
              50,
              y - 40,
              14,
              boldFont,
              dark
            );

            drawText(
              page,
              `${
                segment.origin
                  ?.city_name ||
                "-"
              } to ${
                segment.destination
                  ?.city_name ||
                "-"
              }`,
              50,
              y - 55,
              8,
              regularFont,
              gray
            );

            drawLabelValue(
              page,
              "Departure",
              `${formatDate(
                segment.departing_at
              )} ${formatTime(
                segment.departing_at
              )}`,
              50,
              y - 78,
              regularFont,
              boldFont,
              { gray, dark }
            );

            drawLabelValue(
              page,
              "Arrival",
              `${formatDate(
                segment.arriving_at
              )} ${formatTime(
                segment.arriving_at
              )}`,
              205,
              y - 78,
              regularFont,
              boldFont,
              { gray, dark }
            );

            drawLabelValue(
              page,
              "Airline",
              getAirline(
                segment
              ),
              360,
              y - 78,
              regularFont,
              boldFont,
              { gray, dark }
            );

            drawLabelValue(
              page,
              "Flight",
              getFlightNumber(
                segment
              ),
              50,
              y - 113,
              regularFont,
              boldFont,
              { gray, dark }
            );

            drawLabelValue(
              page,
              "Cabin",
              getCabinClass(
                segment
              ),
              205,
              y - 113,
              regularFont,
              boldFont,
              { gray, dark }
            );

            drawLabelValue(
              page,
              "Duration",
              formatDuration(
                segment.duration
              ),
              360,
              y - 113,
              regularFont,
              boldFont,
              { gray, dark }
            );

            drawLabelValue(
              page,
              "Aircraft",
              getAircraft(
                segment
              ),
              50,
              y - 148,
              regularFont,
              boldFont,
              { gray, dark }
            );

            drawLabelValue(
              page,
              "Baggage",
              getBaggage(
                segment
              ),
              205,
              y - 148,
              regularFont,
              boldFont,
              { gray, dark }
            );

            drawLabelValue(
              page,
              "Terminals",
              `${
                segment.origin_terminal ||
                "-"
              } / ${
                segment.destination_terminal ||
                "-"
              }`,
              360,
              y - 148,
              regularFont,
              boldFont,
              { gray, dark }
            );

            y -=
              boxHeight +
              14;
          }
        );

        y -= 8;
      }
    );
  }

  // ============================
  // PASSENGER DETAILS
  // ============================

  ensureSpace(100);

  drawText(
    page,
    "PASSENGER DETAILS",
    margin,
    y,
    12,
    boldFont,
    dark
  );

  y -= 20;

  const passengers =
    data.passengers || [];

  if (
    passengers.length === 0
  ) {
    drawText(
      page,
      "Passenger information unavailable.",
      margin,
      y,
      8.5,
      regularFont,
      gray
    );

    y -= 25;
  } else {
    passengers.forEach(
      (
        passenger,
        index
      ) => {
        const boxHeight = 92;

        ensureSpace(
          boxHeight + 15
        );

        page.drawRectangle({
          x: margin,
          y:
            y -
            boxHeight,
          width:
            pageWidth -
            margin * 2,
          height:
            boxHeight,
          color: rgb(
            249 / 255,
            250 / 255,
            251 / 255
          ),
          borderColor:
            border,
          borderWidth: 1,
        });

        drawText(
          page,
          `PASSENGER ${
            index + 1
          }`,
          50,
          y - 18,
          7.5,
          boldFont,
          gray
        );

        drawText(
          page,
          getPassengerName(
            passenger
          ),
          50,
          y - 37,
          11,
          boldFont,
          dark
        );

        drawLabelValue(
          page,
          "Type",
          passenger.type ||
            "-",
          50,
          y - 56,
          regularFont,
          boldFont,
          { gray, dark }
        );

        drawLabelValue(
          page,
          "Gender",
          passenger.gender ||
            "-",
          160,
          y - 56,
          regularFont,
          boldFont,
          { gray, dark }
        );

        drawLabelValue(
          page,
          "Date of Birth",
          passenger.born_on ||
            "-",
          270,
          y - 56,
          regularFont,
          boldFont,
          { gray, dark }
        );

        drawLabelValue(
          page,
          "Email",
          passenger.email ||
            "-",
          50,
          y - 83,
          regularFont,
          boldFont,
          { gray, dark }
        );

        drawLabelValue(
          page,
          "Phone",
          passenger.phone_number ||
            "-",
          350,
          y - 83,
          regularFont,
          boldFont,
          { gray, dark }
        );

        y -=
          boxHeight +
          14;
      }
    );
  }

  // ============================
  // ELECTRONIC TICKET
  // ============================

  ensureSpace(100);

  drawText(
    page,
    "ELECTRONIC TICKET",
    margin,
    y,
    12,
    boldFont,
    dark
  );

  y -= 20;

  const ticketDocuments =
    (data.documents || []).filter(
      (document) =>
        document.type ===
        "electronic_ticket"
    );

  if (
    ticketDocuments.length ===
    0
  ) {
    page.drawRectangle({
      x: margin,
      y: y - 45,
      width:
        pageWidth -
        margin * 2,
      height: 45,
      color:
        warningBackground,
    });

    drawText(
      page,
      "Electronic ticket information is being processed.",
      50,
      y - 27,
      8.5,
      regularFont,
      warningText
    );

    y -= 65;
  } else {
    ticketDocuments.forEach(
      (
        document,
        index
      ) => {
        ensureSpace(75);

        page.drawRectangle({
          x: margin,
          y: y - 58,
          width:
            pageWidth -
            margin * 2,
          height: 58,
          color:
            lightBackground,
        });

        drawText(
          page,
          `TICKET IDENTIFIER${
            ticketDocuments.length >
            1
              ? ` ${
                  index + 1
                }`
              : ""
          }`,
          52,
          y - 19,
          7.5,
          boldFont,
          gray
        );

        drawText(
          page,
          document.unique_identifier ||
            "-",
          52,
          y - 42,
          15,
          boldFont,
          green
        );

        y -= 70;
      }
    );
  }

  // ============================
  // PAYMENT
  // ============================

  ensureSpace(140);

  drawText(
    page,
    "PAYMENT",
    margin,
    y,
    12,
    boldFont,
    dark
  );

  y -= 20;

  page.drawRectangle({
    x: margin,
    y: y - 110,
    width:
      pageWidth -
      margin * 2,
    height: 110,
    color:
      lightBackground,
  });

  drawText(
    page,
    "TOTAL PAID",
    52,
    y - 20,
    7.5,
    boldFont,
    gray
  );

  drawText(
    page,
    formatMoney(
      data.totalAmount,
      data.totalCurrency
    ),
    52,
    y - 43,
    16,
    boldFont,
    green
  );

  drawLabelValue(
    page,
    "Base Fare",
    formatMoney(
      data.baseAmount,
      data.baseCurrency
    ),
    300,
    y - 20,
    regularFont,
    boldFont,
    { gray, dark }
  );

  drawLabelValue(
    page,
    "Tax",
    formatMoney(
      data.taxAmount,
      data.taxCurrency
    ),
    300,
    y - 58,
    regularFont,
    boldFont,
    { gray, dark }
  );

  y -= 135;

  // ============================
  // IMPORTANT INFORMATION
  // ============================

  ensureSpace(130);

  drawText(
    page,
    "IMPORTANT INFORMATION",
    margin,
    y,
    12,
    boldFont,
    dark
  );

  y -= 20;

  const informationLines = [
    "Please keep this electronic ticket and your",
    "identification documents with you when travelling.",
    "",
    "Please check your flight date and departure time",
    "carefully before travelling.",
    "",
    "Airport check-in and boarding requirements are",
    "determined by the operating airline.",
    "",
    "Flight schedules may be subject to airline changes.",
  ];

  informationLines.forEach(
    (line) => {
      if (line === "") {
        y -= 7;
        return;
      }

      ensureSpace(18);

      drawText(
        page,
        line,
        margin,
        y,
        8,
        regularFont,
        gray
      );

      y -= 12;
    }
  );

  // ============================
  // FOOTER
  // ============================

  function drawFooter(
    footerPage: PDFPage
  ) {
    footerPage.drawLine({
      start: {
        x: margin,
        y: 58,
      },
      end: {
        x:
          pageWidth -
          margin,
        y: 58,
      },
      thickness: 1,
      color: border,
    });

    drawText(
      footerPage,
      "Papeg Tour & Travel",
      margin,
      40,
      9,
      boldFont,
      dark
    );

    drawText(
      footerPage,
      "Wamena - Papua Pegunungan - Indonesia",
      margin,
      27,
      7.5,
      regularFont,
      gray
    );

    drawText(
      footerPage,
      "Thank you for choosing Papeg Tour & Travel.",
      margin,
      15,
      7.5,
      regularFont,
      gray
    );
  }

  for (
    const pdfPage of pdfDoc.getPages()
  ) {
    drawFooter(pdfPage);
  }

  const pdfBytes =
    await pdfDoc.save();

  return Buffer.from(
    pdfBytes
  );
}