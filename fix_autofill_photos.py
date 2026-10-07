import os

page_path = r'c:\Users\91639\OneDrive\Desktop\4th year\College work\Airbnb clone\frontend\src\app\become-a-host\[id]\[step]\page.tsx'

with open(page_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_autofill = """  const handleAutofill = () => {
    updateDraft({
      property_type: "Villa",
      place_type: "entire",
      country: "India",
      address: "123 Palm Grove, Baga 403516",
      city: "Goa",
      state: "Goa",
      max_guests: 6,
      bedrooms: 3,
      beds: 3,
      bathrooms: 2,
      amenities: [{"id":1},{"id":2},{"id":3},{"id":5},{"id":7}] as any,
      photos: [
        { id: 9991, url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", position: 1 },
        { id: 9992, url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80", position: 2 },
        { id: 9993, url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80", position: 3 },
        { id: 9994, url: "https://images.unsplash.com/photo-1600607687644-aac4c15cecb1?auto=format&fit=crop&w=1200&q=80", position: 4 },
        { id: 9995, url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80", position: 5 }
      ],
      title: "Luxury Palm Villa in Baga",
      description: "Welcome to our beautiful luxury villa, perfectly situated just 5 minutes from Baga beach. Enjoy the private pool and lush gardens.",
      price_per_night: 8500,
      cleaning_fee: 1200,
      instant_book: true
    });
    toast.success("Demo data filled!");
  };"""

new_autofill = """  const handleAutofill = async () => {
    toast.loading("Filling demo data...", { id: "autofill" });
    try {
      if (!draft.photos || draft.photos.length < 5) {
        const demoPhotos = [
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1600607687644-aac4c15cecb1?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80"
        ];
        for (const url of demoPhotos) {
          try { await hostApi.addPhotoUrl(listingId, url); } catch (e) {}
        }
      }
      const updated = await hostApi.getDraft(listingId);
      updateDraft({
        photos: updated.photos,
        property_type: "Villa",
        place_type: "entire",
        country: "India",
        address: "123 Palm Grove, Baga 403516",
        city: "Goa",
        state: "Goa",
        max_guests: 6,
        bedrooms: 3,
        beds: 3,
        bathrooms: 2,
        amenities: [{"id":1},{"id":2},{"id":3},{"id":5},{"id":7}] as any,
        title: "Luxury Palm Villa in Baga",
        description: "Welcome to our beautiful luxury villa, perfectly situated just 5 minutes from Baga beach. Enjoy the private pool and lush gardens.",
        price_per_night: 8500,
        cleaning_fee: 1200,
        instant_book: true
      });
      toast.success("Demo data filled!", { id: "autofill" });
    } catch(err) {
      toast.error("Failed to fill demo data", { id: "autofill" });
    }
  };"""

if old_autofill in content:
    content = content.replace(old_autofill, new_autofill)
    with open(page_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("handleAutofill updated.")
else:
    print("Could not find old autofill function to replace!")
