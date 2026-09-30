
"use client";

import { useState } from "react";

type FlightSegment = {
  departing_at?: string;
  arriving_at?: string;
  origin?: {
    iata_code?: string;
  };
  destination?: {
    iata_code?: string;
  };
  marketing_carrier?: {
    name?: string;
    iata_code?: string;
  };
  operating_carrier?: {
    name?: string;
    iata_code?: string;
  };
  flight_number?: string;
};

type FlightOffer = {
  id: string;
  passengers?: Array<{
    id?: string;
    type?: string;
  }>;
  total_amount?: string;
  total_currency?: string;
  owner?: {
    name?: string;
    iata_code?: string;
  };
  cabin_class?: string;
  slices?: Array<{
    duration?: string;
    segments?: FlightSegment[];
  }>;
};

type Passenger = {
  id?: string;
  title: string;
  given_name: string;
  family_name: string;
  born_on: string;
  gender: string;
  email: string;
  phone_number: string;
};

export default function FlightPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [cabin, setCabin] = useState("economy");

  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [selectedOffer, setSelectedOffer] =
    useState<FlightOffer | null>(null);

  const [passengerDetails, setPassengerDetails] =
    useState<Passenger[]>([]);

  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] =
    useState(false);

  const [error, setError] = useState("");

  async function searchFlights() {
    setLoading(true);
    setError("");
    setOffers([]);
    setSelectedOffer(null);
    setPassengerDetails([]);

    try {
      const response = await fetch(
        "/api/flights/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to,
            departure,
            returnDate,
            passengers,
            cabin,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Flight search failed."
        );
        return;
      }

      setOffers(
        Array.isArray(data.offers)
          ? data.offers
          : []
      );
    } catch {
      setError(
        "Unable to connect to the flight search service."
      );
    } finally {
      setLoading(false);
    }
  }

  function selectFlight(
    offer: FlightOffer
  ) {
    setError("");
    setSelectedOffer(offer);

    const count =
      Number(passengers) || 1;

    const offerPassengers =
      offer.passengers || [];

    const newPassengers =
      Array.from(
        { length: count },
        (_, index) => {
          const duffelPassenger =
            offerPassengers[index];

          return {
            id: duffelPassenger?.id,
            title: "mr",
            given_name: "",
            family_name: "",
            born_on: "",
            gender: "m",
            email: "",
            phone_number: "",
          };
        }
      );

    setPassengerDetails(
      newPassengers
    );

    setTimeout(() => {
      document
        .getElementById(
          "passenger-details"
        )
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  }

  function updatePassenger(
    index: number,
    field: keyof Passenger,
    value: string
  ) {
    setPassengerDetails(
      (current) =>
        current.map(
          (
            passenger,
            passengerIndex
          ) =>
            passengerIndex === index
              ? {
                  ...passenger,
                  [field]: value,
                }
              : passenger
        )
    );
  }

  async function createBooking() {
    setBookingLoading(true);
    setError("");

    try {
      if (!selectedOffer?.id) {
        setError(
          "Please select a flight first."
        );
        return;
      }

      if (passengerDetails.length === 0) {
        setError(
          "Please enter passenger information."
        );
        return;
      }

      for (
        let i = 0;
        i < passengerDetails.length;
        i++
      ) {
        const passenger =
          passengerDetails[i];

        if (!passenger.id) {
          setError(
            `Passenger ${
              i + 1
            } is missing the Duffel passenger ID.`
          );
          return;
        }

        if (!passenger.given_name) {
          setError(
            `Passenger ${
              i + 1
            } first name is required.`
          );
          return;
        }

        if (!passenger.family_name) {
          setError(
            `Passenger ${
              i + 1
            } last name is required.`
          );
          return;
        }

        if (!passenger.born_on) {
          setError(
            `Passenger ${
              i + 1
            } date of birth is required.`
          );
          return;
        }

        if (!passenger.email) {
          setError(
            `Passenger ${
              i + 1
            } email is required.`
          );
          return;
        }

        if (!passenger.phone_number) {
          setError(
            `Passenger ${
              i + 1
            } phone number is required.`
          );
          return;
        }
      }

      const response = await fetch(
        "/api/flights/order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            offerId:
              selectedOffer.id,
            passengers:
              passengerDetails,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        setError(
          data.message ||
            "Unable to create booking."
        );
        return;
      }

      const createdOrder =
        data.order;

      const createdOrderId =
        createdOrder?.id || "";

      if (!createdOrderId) {
        setError(
          "Booking was created but no Duffel Order ID was returned."
        );
        return;
      }

      sessionStorage.setItem(
        "selectedFlight",
        JSON.stringify(
          selectedOffer
        )
      );

      sessionStorage.setItem(
        "passengerDetails",
        JSON.stringify(
          passengerDetails
        )
      );

      sessionStorage.setItem(
        "bookingPassengers",
        JSON.stringify(
          passengerDetails
        )
      );

      sessionStorage.setItem(
        "bookingOrder",
        JSON.stringify(
          createdOrder
        )
      );

      window.location.assign(
        "/flights/review"
      );
    } catch {
      setError(
        "Unable to connect to the booking service."
      );
    } finally {
      setBookingLoading(false);
    }
  }

  function formatDate(
    date?: string
  ) {
    if (!date) {
      return "-";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return date;
    }

    return parsed.toLocaleString(
      "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  function getRoute(
    offer: FlightOffer
  ) {
    const segments =
      offer.slices?.[0]
        ?.segments;

    if (
      !segments ||
      segments.length === 0
    ) {
      return "-";
    }

    const first =
      segments[0];

    const last =
      segments[
        segments.length - 1
      ];

    return `${
      first.origin?.iata_code ||
      "-"
    } → ${
      last.destination
        ?.iata_code || "-"
    }`;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f3ec",
        padding: "50px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: "40px",
          }}
        >
          <p
            style={{
              color: "#1d5c48",
              fontWeight: 700,
              letterSpacing: "2px",
            }}
          >
            PAPEG TOUR & TRAVEL
          </p>

          <h1
            style={{
              fontSize: "42px",
              margin: "10px 0",
              color: "#26332e",
            }}
          >
            Book Your Flight
          </h1>

          <p
            style={{
              color: "#66736d",
              fontSize: "17px",
            }}
          >
            Search and book flights
            with Papeg Tour & Travel.
          </p>
        </div>

        <section
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "18px",
            marginBottom: "30px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#26332e",
            }}
          >
            Search Flights
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "15px",
            }}
          >
            <input
              value={from}
              onChange={(e) =>
                setFrom(
                  e.target.value
                )
              }
              placeholder="From (e.g. WMX)"
              style={inputStyle}
            />

            <input
              value={to}
              onChange={(e) =>
                setTo(
                  e.target.value
                )
              }
              placeholder="To (e.g. DPS)"
              style={inputStyle}
            />

            <input
              type="date"
              value={departure}
              onChange={(e) =>
                setDeparture(
                  e.target.value
                )
              }
              style={inputStyle}
            />

            <input
              type="date"
              value={returnDate}
              onChange={(e) =>
                setReturnDate(
                  e.target.value
                )
              }
              style={inputStyle}
            />

            <select
              value={passengers}
              onChange={(e) =>
                setPassengers(
                  e.target.value
                )
              }
              style={inputStyle}
            >
              <option value="1">
                1 Adult
              </option>
              <option value="2">
                2 Adults
              </option>
              <option value="3">
                3 Adults
              </option>
              <option value="4">
                4 Adults
              </option>
              <option value="5">
                5 Adults
              </option>
            </select>

            <select
              value={cabin}
              onChange={(e) =>
                setCabin(
                  e.target.value
                )
              }
              style={inputStyle}
            >
              <option value="economy">
                Economy
              </option>
              <option value="premium_economy">
                Premium Economy
              </option>
              <option value="business">
                Business
              </option>
              <option value="first">
                First
              </option>
            </select>
          </div>

          <button
            type="button"
            onClick={
              searchFlights
            }
            disabled={loading}
            style={
              primaryButtonStyle
            }
          >
            {loading
              ? "Searching..."
              : "Search Flights"}
          </button>
        </section>

        {error && (
          <div
            style={{
              background: "#fff0f0",
              color: "#a33",
              padding: "18px",
              borderRadius: "12px",
              marginBottom: "25px",
            }}
          >
            {error}
          </div>
        )}

        {offers.length > 0 && (
          <section
            style={{
              marginBottom: "40px",
            }}
          >
            <h2
              style={{
                color: "#26332e",
              }}
            >
              Available Flights
            </h2>

            <div
              style={{
                display: "grid",
                gap: "18px",
              }}
            >
              {offers.map(
                (offer) => (
                  <div
                    key={offer.id}
                    style={{
                      background:
                        "#ffffff",
                      padding:
                        "25px",
                      borderRadius:
                        "16px",
                      boxShadow:
                        "0 6px 20px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        gap: "20px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            fontSize:
                              "24px",
                            color:
                              "#1d5c48",
                          }}
                        >
                          {getRoute(
                            offer
                          )}
                        </strong>

                        <p>
                          {
                            offer
                              .owner
                              ?.name
                          }
                        </p>

                        <p>
                          Departure:{" "}
                          {formatDate(
                            offer
                              .slices?.[0]
                              ?.segments?.[0]
                              ?.departing_at
                          )}
                        </p>
                      </div>

                      <div
                        style={{
                          textAlign:
                            "right",
                        }}
                      >
                        <strong
                          style={{
                            fontSize:
                              "24px",
                            color:
                              "#26332e",
                          }}
                        >
                          {
                            offer.total_amount
                          }{" "}
                          {
                            offer.total_currency
                          }
                        </strong>

                        <br />

                        <button
                          type="button"
                          onClick={() =>
                            selectFlight(
                              offer
                            )
                          }
                          style={
                            primaryButtonStyle
                          }
                        >
                          Select Flight
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {selectedOffer && (
          <section
            id="passenger-details"
            style={{
              background: "#ffffff",
              padding: "30px",
              borderRadius: "18px",
              marginBottom: "30px",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <p
              style={{
                color: "#1d5c48",
                fontWeight: 700,
                letterSpacing: "1px",
              }}
            >
              PASSENGER DETAILS
            </p>

            <h2>
              Enter Passenger Information
            </h2>

            {passengerDetails.map(
              (
                passenger,
                index
              ) => (
                <div
                  key={index}
                  style={{
                    border:
                      "1px solid #e4e4e4",
                    borderRadius:
                      "14px",
                    padding:
                      "20px",
                    marginBottom:
                      "20px",
                  }}
                >
                  <h3>
                    Passenger{" "}
                    {index + 1}
                  </h3>

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "15px",
                    }}
                  >
                    <select
                      value={
                        passenger.title
                      }
                      onChange={(e) =>
                        updatePassenger(
                          index,
                          "title",
                          e.target.value
                        )
                      }
                      style={
                        inputStyle
                      }
                    >
                      <option value="mr">
                        Mr
                      </option>
                      <option value="mrs">
                        Mrs
                      </option>
                      <option value="ms">
                        Ms
                      </option>
                    </select>

                    <input
                      placeholder="First Name"
                      value={
                        passenger.given_name
                      }
                      onChange={(e) =>
                        updatePassenger(
                          index,
                          "given_name",
                          e.target.value
                        )
                      }
                      style={
                        inputStyle
                      }
                    />

                    <input
                      placeholder="Last Name"
                      value={
                        passenger.family_name
                      }
                      onChange={(e) =>
                        updatePassenger(
                          index,
                          "family_name",
                          e.target.value
                        )
                      }
                      style={
                        inputStyle
                      }
                    />

                    <input
                      type="date"
                      value={
                        passenger.born_on
                      }
                      onChange={(e) =>
                        updatePassenger(
                          index,
                          "born_on",
                          e.target.value
                        )
                      }
                      style={
                        inputStyle
                      }
                    />

                    <select
                      value={
                        passenger.gender
                      }
                      onChange={(e) =>
                        updatePassenger(
                          index,
                          "gender",
                          e.target.value
                        )
                      }
                      style={
                        inputStyle
                      }
                    >
                      <option value="m">
                        Male
                      </option>
                      <option value="f">
                        Female
                      </option>
                    </select>

                    <input
                      type="email"
                      placeholder="Email"
                      value={
                        passenger.email
                      }
                      onChange={(e) =>
                        updatePassenger(
                          index,
                          "email",
                          e.target.value
                        )
                      }
                      style={
                        inputStyle
                      }
                    />

                    <input
                      placeholder="WhatsApp"
                      value={
                        passenger.phone_number
                      }
                      onChange={(e) =>
                        updatePassenger(
                          index,
                          "phone_number",
                          e.target.value
                        )
                      }
                      style={
                        inputStyle
                      }
                    />
                  </div>
                </div>
              )
            )}

            <button
              type="button"
              onClick={
                createBooking
              }
              disabled={
                bookingLoading
              }
              style={
                primaryButtonStyle
              }
            >
              {bookingLoading
                ? "Creating Booking Hold..."
                : "Create Booking Hold"}
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "13px 15px",
  border:
    "1px solid #d8ddd9",
  borderRadius: "10px",
  fontSize: "15px",
  background: "#ffffff",
  color: "#26332e",
};

const primaryButtonStyle = {
  marginTop: "20px",
  padding: "14px 24px",
  border: "none",
  borderRadius: "10px",
  background: "#1d5c48",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: 700,
  cursor: "pointer",
};
