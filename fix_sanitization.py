import os

page_path = r'c:\Users\91639\OneDrive\Desktop\4th year\College work\Airbnb clone\frontend\src\app\become-a-host\[id]\[step]\page.tsx'

with open(page_path, 'r', encoding='utf-8') as f:
    content = f.read()

sanitize_fn = """
  const sanitizeDraftForApi = (d: any) => {
    return {
      title: d.title,
      description: d.description,
      price_per_night: d.price_per_night,
      cleaning_fee: d.cleaning_fee,
      pincode: d.pincode,
      state: d.state,
      latitude: d.latitude,
      longitude: d.longitude,
      max_guests: d.max_guests,
      beds: d.beds,
      bedrooms: d.bedrooms,
      bathrooms: d.bathrooms,
      highlights: d.highlights,
      amenities: d.amenities ? d.amenities.map((a: any) => typeof a === 'object' ? a.id : a) : undefined,
      weekly_discount_pct: d.weekly_discount_pct,
      monthly_discount_pct: d.monthly_discount_pct,
      min_nights: d.min_nights,
      city: d.city,
      address: d.address,
      property_type: d.property_type,
      place_type: d.place_type
    };
  };

  const updateDraft = (data: Partial<HostListingDraft>) => {
"""

content = content.replace("  const updateDraft = (data: Partial<HostListingDraft>) => {", sanitize_fn)

content = content.replace(
    "await hostApi.updateDraft(listingId, { ...draft, wizard_step: nextStep.id });",
    "await hostApi.updateDraft(listingId, { ...sanitizeDraftForApi(draft), wizard_step: nextStep.id });"
)

content = content.replace(
    "await hostApi.updateDraft(listingId, { ...draft, wizard_step: stepSlug });",
    "await hostApi.updateDraft(listingId, { ...sanitizeDraftForApi(draft), wizard_step: stepSlug });"
)

with open(page_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Sanitization fixed applied.")
