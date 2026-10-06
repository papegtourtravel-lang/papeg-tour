import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        {
          error: "Email tujuan belum diberikan",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    const replyTo = process.env.EMAIL_REPLY_TO;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "RESEND_API_KEY belum diset",
        },
        { status: 500 }
      );
    }

    if (!from) {
      return NextResponse.json(
        {
          error: "EMAIL_FROM belum diset",
        },
        { status: 500 }
      );
    }

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
          to: [email],
          reply_to: replyTo || undefined,
          subject: "Papeg Tour & Travel — Test Email",
          html: `
            <div style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 30px;
              color: #26332e;
            ">

              <div style="
                background: #1d5c48;
                color: white;
                padding: 25px;
                border-radius: 14px 14px 0 0;
              ">
                <h1 style="
                  margin: 0;
                  font-size: 24px;
                ">
                  PAPEG TOUR & TRAVEL
                </h1>

                <p style="
                  margin: 8px 0 0;
                  opacity: 0.85;
                ">
                  Papua Highlands • Indonesia
                </p>
              </div>

              <div style="
                border: 1px solid #e5e7eb;
                border-top: none;
                padding: 30px;
                border-radius: 0 0 14px 14px;
              ">

                <h2>
                  Email System Test
                </h2>

                <p>
                  Selamat! Sistem email Papeg
                  Tour & Travel berhasil terhubung
                  dengan Resend.
                </p>

                <div style="
                  background: #f6f3ec;
                  padding: 18px;
                  border-radius: 10px;
                  margin: 20px 0;
                ">
                  <strong>
                    Status:
                  </strong>

                  <span style="
                    color: #1d5c48;
                    font-weight: bold;
                  ">
                    Email system ready
                  </span>
                </div>

                <p>
                  Setelah pengujian ini berhasil,
                  sistem akan kita sambungkan ke
                  pembayaran tiket Papeg.
                </p>

                <hr style="
                  border: none;
                  border-top: 1px solid #e5e7eb;
                  margin: 25px 0;
                " />

                <p style="
                  font-size: 13px;
                  color: #6b7280;
                ">
                  Papeg Tour & Travel<br />
                  Wamena – Papua Pegunungan<br />
                  Indonesia
                </p>

              </div>

            </div>
          `,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Resend API error:",
        data
      );

      return NextResponse.json(
        {
          error: "Gagal mengirim email",
          details: data,
        },
        { status: response.status }
      );
    }

    console.log(
      "Email berhasil dikirim:",
      data
    );

    return NextResponse.json({
      success: true,
      message: "Email berhasil dikirim",
      id: data?.id || null,
    });
  } catch (error) {
    console.error(
      "Email route error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Terjadi kesalahan saat mengirim email",
      },
      { status: 500 }
    );
  }
}