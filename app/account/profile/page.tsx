
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import FlightBookingHistory from "./FlightBookingHistory";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (error || !data.session) {
        router.replace("/account");
        return;
      }

      setUser(data.session.user);
      setLoading(false);
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      if (!session) {
        router.replace("/account");
        return;
      }

      setUser(session.user);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleLogout() {
    setSigningOut(true);
    setMessage("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage("Logout gagal. Silakan coba lagi.");
      setSigningOut(false);
      return;
    }

    router.replace("/account");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f3ec] text-[#26332e]">
        Memuat profil pelanggan...
      </main>
    );
  }

  if (!user) return null;

  const metadata = user.user_metadata ?? {};

  const fullName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : "Pelanggan Papeg";

  const phone =
    typeof metadata.phone === "string"
      ? metadata.phone
      : "Nomor HP belum tersedia";

  return (
    <main className="min-h-screen bg-[#f6f3ec] px-4 py-12 text-[#26332e]">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-sm font-medium text-[#1d5c48] hover:underline"
        >
          ← Kembali ke Beranda
        </Link>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1d5c48]">
            Papeg Tour &amp; Travel
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Profil Pelanggan
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Informasi akun Anda yang terdaftar di Papeg.
          </p>

          <div className="mt-8 space-y-5">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Nama lengkap
              </p>
              <p className="mt-1 font-semibold">
                {fullName}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Email
              </p>
              <p className="mt-1 break-all font-semibold">
                {user.email ?? "Email tidak tersedia"}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Nomor HP / WhatsApp
              </p>
              <p className="mt-1 font-semibold">
                {phone}
              </p>
            </div>
          </div>

          {message && (
            <p
              role="alert"
              className="mt-4 text-sm text-red-700"
            >
              {message}
            </p>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="mt-8 w-full rounded-lg bg-[#1d5c48] px-4 py-3 font-semibold text-white transition hover:bg-[#164736] disabled:opacity-60"
          >
            {signingOut ? "Sedang keluar..." : "Logout"}
          </button>
        </section>

        <FlightBookingHistory />
      </div>
    </main>
  );
}