"use client";
import { Button } from "@/components/UI";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { Suspense } from "react";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
      <CheckCircle2 size={80} className="text-green-500 mb-6 animate-in zoom-in duration-500" />
      <h1 className="text-4xl font-bold mb-4">Pack your bags!</h1>
      <p className="text-lg text-neutral-600 mb-2">Your reservation is confirmed.</p>
      {id && <p className="text-sm font-semibold text-neutral-500 mb-8">Booking Reference: #{id}</p>}
      
      <div className="flex gap-4">
        <Button onClick={() => router.push("/trips")} primary>View My Trips</Button>
        <Button onClick={() => router.push("/")}>Explore more</Button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
