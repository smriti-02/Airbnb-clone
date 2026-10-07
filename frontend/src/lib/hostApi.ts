import { API_URL, apiFetch } from "./api";
import { HostListingDraft, OTPResponse, UserResponse, Reservation, MonthlyEarning } from "./hostTypes";

async function hostApiFetchForm<T>(endpoint: string, formData: FormData): Promise<T> {
  let userId = "";
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("airbnb_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.id) userId = user.id.toString();
      } catch (e) {}
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    body: formData,
    headers: userId ? { "X-User-Id": userId } : {},
    cache: "no-store"
  });

  if (!response.ok) {
    let errorMsg = "An error occurred";
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const hostApi = {
  sendOtp: (identifier: string) => 
    apiFetch<OTPResponse>("/auth/otp/send", { method: "POST", body: JSON.stringify({ identifier }) }),
  verifyOtp: (identifier: string, otp: string, first_name?: string, last_name?: string) =>
    apiFetch<UserResponse>("/auth/otp/verify", { method: "POST", body: JSON.stringify({ identifier, otp, first_name, last_name }) }),
  createDraft: () => apiFetch<HostListingDraft>("/host/listings/draft", { method: "POST" }),
  updateDraft: (id: number, data: Partial<HostListingDraft>) =>
    apiFetch<HostListingDraft>(`/host/listings/${id}`, { method: "PATCH", body: JSON.stringify(data), cache: "no-store" }),
  publishListing: (id: number) => apiFetch<{ message: string }>(`/host/listings/${id}/publish`, { method: "POST", cache: "no-store" }),
  unlistListing: (id: number) => apiFetch<{ message: string }>(`/host/listings/${id}/unlist`, { method: "POST", cache: "no-store" }),
  relistListing: (id: number) => apiFetch<{ message: string }>(`/host/listings/${id}/relist`, { method: "POST", cache: "no-store" }),
  deleteListing: (id: number) => apiFetch<{ message: string }>(`/host/listings/${id}`, { method: "DELETE", cache: "no-store" }),
  getMyListings: () => apiFetch<HostListingDraft[]>("/host/listings", { method: "GET" }),
  getDraft: (id: number) => apiFetch<HostListingDraft>(`/host/listings/${id}`, { method: "GET" }),
  submitVerification: (formData: FormData) => hostApiFetchForm<{ message: string }>("/host/verification", formData),
  checkVerification: () => apiFetch<{ status: string }>("/host/verification", { method: "GET" }),
  addPhotos: (id: number, formData: FormData) => hostApiFetchForm<{ message: string }>(`/host/listings/${id}/photos`, formData),
  addPhotoUrl: (id: number, url: string) => apiFetch<{ message: string }>(`/host/listings/${id}/photos`, { method: "POST", body: JSON.stringify({ url }), cache: "no-store" }),
  reorderPhotos: (id: number, ids: number[]) => apiFetch<{ message: string }>(`/host/listings/${id}/photos/order`, { method: "PUT", body: JSON.stringify({ ids }), cache: "no-store" }),
  deletePhoto: (listingId: number, photoId: number) => apiFetch<{ message: string }>(`/host/listings/${listingId}/photos/${photoId}`, { method: "DELETE", cache: "no-store" }),
  
  // Dashboard APIs
  getReservations: (bucket: string = "upcoming") => apiFetch<{ reservations: Reservation[] }>(`/host/reservations?bucket=${bucket}`, { method: "GET" }),
  updateReservationNote: (id: number, note: string) => apiFetch<{ message: string }>(`/host/reservations/${id}/note`, { method: "PATCH", body: JSON.stringify({ note }), cache: "no-store" }),
  getEarnings: () => apiFetch<{ this_month: number, upcoming: number, total: number, monthly_chart: MonthlyEarning[], recent: Reservation[], by_listing: any[] }>("/host/earnings", { method: "GET" }),
  
  // Calendar APIs
  getCalendar: (listing_id: number, month: string) => apiFetch<any>(`/host/listings/${listing_id}/calendar?month=${month}`, { method: "GET" }),
  updateCalendar: (listing_id: number, dates: string[], action: string, price?: number) => 
    apiFetch<{ message: string }>(`/host/listings/${listing_id}/calendar`, { method: "PUT", body: JSON.stringify({ dates, action, price }), cache: "no-store" })
};
