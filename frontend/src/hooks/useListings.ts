import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export function useListings(searchParams: URLSearchParams) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const query = searchParams.toString();
        const data = await apiFetch<any>(`/listings?${query}`);
        
        const page = parseInt(searchParams.get("page") || "1");
        
        if (page === 1) {
          setListings(data.items);
        } else {
          setListings(prev => {
            // Prevent duplicates on double-render
            const existingIds = new Set(prev.map(i => i.id));
            const newItems = data.items.filter((i: any) => !existingIds.has(i.id));
            return [...prev, ...newItems];
          });
        }
        
        setTotal(data.total);
        setHasMore(data.items.length === data.page_size);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchListings();
  }, [searchParams.toString()]);

  return { listings, loading, error, hasMore, total };
}
