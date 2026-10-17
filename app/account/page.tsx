
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AccountPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (mode === "register") {
        const normalizedPhone = phone.trim();

        if (!normalizedPhone) {
          throw new Error("Nomor HP atau WhatsApp wajib diisi.");
        }

        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: name.trim(),
              phone: normalizedPhone,
            },
            emailRedirectTo: `${window.location.origin}/account`,
          },
        });

        if (error) throw error;

        if (data.session) {
          setMessage("Pendaftaran berhasil. Anda sudah masuk ke akun.");
          router.push("/account/profile");
        } else {
          setMessage(
            "Pendaftaran berhasil. Silakan periksa email Anda untuk mengonfirmasi akun sebelum login."
          );
        }
      } else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

        if (error) throw error;

        if (data.session) {
          router.replace("/account/profile");
          router.refresh();
          return;
        }

        setMessage(
          "Login berhasil, tetapi sesi belum tersedia. Silakan coba lagi."
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f3ec] px-4 py-12 text-[#26332e]">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <Link
          href="/"
          className="text-sm font-medium text-[#1d5c48] hover:underline"
        >
          ← Kembali ke Beranda
        </Link>

        <div className="mt-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1d5c48]">
            Papeg Tour &amp; Travel
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            {mode === "register" ? "Buat Akun" : "Selamat Datang"}
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            {mode === "register"
              ? "Daftar untuk mulai mengelola perjalanan Anda."
              : "Masuk untuk mengakses akun Anda."}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setMessage("");
              setPassword("");
            }}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              mode === "register"
                ? "bg-white text-[#1d5c48] shadow"
                : "text-gray-600"
            }`}
          >
            Daftar
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("login");
              setMessage("");
              setPassword("");
            }}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              mode === "login"
                ? "bg-white text-[#1d5c48] shadow"
                : "text-gray-600"
            }`}
          >
            Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label
                  htmlFor="full-name"
                  className="mb-1 block text-sm font-medium"
                >
                  Nama lengkap
                </label>
                <input
                  id="full-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-[#1d5c48]"
                  placeholder="Nama lengkap Anda"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-1 block text-sm font-medium"
                >
                  Nomor HP / WhatsApp
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  maxLength={20}
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-[#1d5c48]"
                  placeholder="+62 812 3456 7890"
                />
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-[#1d5c48]"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={
                mode === "register"
                  ? "new-password"
                  : "current-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-[#1d5c48]"
              placeholder="Minimal 8 karakter"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#1d5c48] px-4 py-3 font-semibold text-white transition hover:bg-[#164736] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Memproses..."
              : mode === "register"
                ? "Buat Akun"
                : "Login"}
          </button>
        </form>

        {message && (
          <div
            role="status"
            aria-live="polite"
            className="mt-5 break-words rounded-lg bg-gray-100 p-3 text-sm"
          >
            {message}
          </div>
        )}

        <p className="mt-6 text-center text-xs leading-5 text-gray-500">
          Dengan menggunakan akun, Anda bertanggung jawab menjaga
          kerahasiaan password Anda.
        </p>
      </div>
    </main>
  );
}