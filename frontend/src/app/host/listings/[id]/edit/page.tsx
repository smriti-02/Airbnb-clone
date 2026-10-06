"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/UI";
import ListingFormClient from "@/components/Host/ListingFormClient";
import { use } from "react"; 

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/host/listings/${id}`)
      .then(res => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10"><Skeleton className="h-[600px] max-w-3xl mx-auto" /></div>;
  if (!data) return <div className="p-10 text-center text-2xl font-bold">Listing not found</div>;

  return <ListingFormClient initialData={data} />;
}
