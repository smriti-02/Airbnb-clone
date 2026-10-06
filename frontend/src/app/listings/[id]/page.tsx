import ListingDetailClient from "@/app/listings/[id]/ListingDetailClient";

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ListingDetailClient id={id} />;
}
