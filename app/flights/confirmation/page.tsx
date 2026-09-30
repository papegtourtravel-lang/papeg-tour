
import { Suspense } from "react";
import ConfirmationContent from "./ConfirmationContent";

function LoadingConfirmation() {
  return (
    <main className="min-h-screen bg-[#f6f3ec] px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#1d5c48] border-t-transparent" />

          <h1 className="text-2xl font-bold text-[#26332e]">
            Loading Booking Confirmation
          </h1>

          <p className="mt-2 text-gray-600">
            Please wait while we retrieve your booking information.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<LoadingConfirmation />}>
      <ConfirmationContent />
    </Suspense>
  );
}