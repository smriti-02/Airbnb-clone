import BookClient from "@/app/book/[id]/BookClient";
import { Suspense } from "react";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookClient id={id} />
    </Suspense>
  );
}
