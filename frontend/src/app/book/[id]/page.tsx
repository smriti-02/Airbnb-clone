import BookClient from "./BookClient";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookClient id={id} />;
}
