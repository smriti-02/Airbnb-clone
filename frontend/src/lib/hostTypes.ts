export interface HostListingDraft {
  id: number;
  title: string | null;
  description: string | null;
  property_type: string | null;
  price_per_night: number | null;
  cleaning_fee: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  max_guests: number | null;
  bedrooms: number | null;
  beds: number | null;
  bathrooms: number | null;
  wizard_step: string | null;
  status: string;
  place_type: string | null;
  instant_book: boolean;
  min_nights: number;
  highlights: string[];
  safety_details: Record<string, boolean>;
  new_listing_promo: boolean;
  weekly_discount_pct: number;
  monthly_discount_pct: number;
  photos: { id: number; url: string; position: number }[];
  amenities: { id: number; name: string; icon: string | null }[];
  cover_photo?: string | null;
  completion_pct?: number;
}

export interface OTPResponse {
  sent: boolean;
  hint: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
  is_host: boolean;
  phone?: string;
  phone_verified?: boolean;
}

export interface Reservation {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  created_at: string;
  host_note?: string;
  guest_name?: string;
  host_earning?: number;
  guest_avatar?: string;
  listing_title?: string;
  listing_cover?: string;
}

export interface MonthlyEarning {
  month: string;
  amount: number;
}
