"use client";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/UI";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import toast from "react-hot-toast";
import { Trash2, Plus } from "lucide-react";

// Matches backend AMENITIES list roughly
const AMENITY_OPTIONS = [
  "Wifi", "Kitchen", "Pool", "Air conditioning", "Washer", 
  "Free parking", "Hot tub", "TV", "Heating", "Dedicated workspace",
  "Gym", "BBQ grill", "Fire pit", "Indoor fireplace", "Breakfast"
];

const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000),
  property_type: z.string().min(1, "Required"),
  city: z.string().min(2, "Required"),
  state: z.string().min(2, "Required"),
  country: z.string().min(2, "Required"),
  address: z.string().min(5, "Required"),
  price_per_night: z.number().min(10, "Minimum $10"),
  cleaning_fee: z.number().min(0),
  max_guests: z.number().min(1).max(16),
  bedrooms: z.number().min(1),
  beds: z.number().min(1),
  bathrooms: z.number().min(1),
  amenity_names: z.array(z.string()),
  photos: z.array(z.object({
    url: z.string().url("Must be a valid URL")
  })).min(1, "At least 1 photo is required").max(10, "Max 10 photos")
});

type ListingFormData = z.infer<typeof listingSchema>;

export default function ListingFormClient({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const defaultValues: ListingFormData = initialData ? {
    title: initialData.title,
    description: initialData.description,
    property_type: initialData.property_type,
    city: initialData.city,
    state: initialData.state,
    country: initialData.country,
    address: initialData.address,
    price_per_night: initialData.price_per_night,
    cleaning_fee: initialData.cleaning_fee,
    max_guests: initialData.max_guests,
    bedrooms: initialData.bedrooms,
    beds: initialData.beds,
    bathrooms: initialData.bathrooms,
    amenity_names: initialData.amenities?.map((a: any) => a.name) || [],
    photos: initialData.photos?.map((p: any) => ({ url: p.url })) || [{ url: "" }]
  } : {
    title: "", description: "", property_type: "Apartment",
    city: "", state: "", country: "", address: "",
    price_per_night: 100, cleaning_fee: 30,
    max_guests: 2, bedrooms: 1, beds: 1, bathrooms: 1,
    amenity_names: [], photos: [{ url: "" }]
  };

  const { register, control, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues
  });

  const { fields: photoFields, append: appendPhoto, remove: removePhoto } = useFieldArray({
    control,
    name: "photos"
  });

  const validateStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ['title', 'description', 'property_type', 'address', 'city', 'state', 'country'];
    if (step === 2) fieldsToValidate = ['max_guests', 'bedrooms', 'beds', 'bathrooms', 'price_per_night', 'cleaning_fee'];
    if (step === 4) fieldsToValidate = ['photos'];

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate as any);
      if (!isValid) return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (await validateStep()) {
      setStep(s => s + 1);
    }
  };

  const onSubmit = async (data: ListingFormData) => {
    setSubmitting(true);
    try {
      if (initialData) {
        await apiFetch(`/host/listings/${initialData.id}`, {
          method: "PUT",
          body: JSON.stringify(data)
        });
        toast.success("Listing updated successfully!");
      } else {
        await apiFetch(`/host/listings`, {
          method: "POST",
          body: JSON.stringify(data)
        });
        toast.success("Listing created successfully!");
      }
      router.push("/host");
    } catch (e: any) {
      toast.error(e.message || "Failed to save listing");
      setSubmitting(false);
    }
  };

  const currentAmenities = watch("amenity_names");

  const toggleAmenity = (name: string) => {
    if (currentAmenities.includes(name)) {
      setValue("amenity_names", currentAmenities.filter(a => a !== name));
    } else {
      setValue("amenity_names", [...currentAmenities, name]);
    }
  };

  const inputClass = "w-full border border-[color:var(--color-airbnb-border)] rounded-lg p-3 outline-none focus:border-black transition";
  const errClass = "text-red-500 text-xs mt-1 font-semibold";

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-[var(--shadow-airbnb)] border border-[color:var(--color-airbnb-border)] mb-20">
      <h1 className="text-3xl font-bold mb-2 text-[color:var(--color-airbnb-text)]">{initialData ? "Edit Listing" : "Create a new Listing"}</h1>
      <p className="text-neutral-500 mb-8">Step {step} of 4</p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basics & Location */}
        {step === 1 && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div>
              <label className="font-semibold block mb-2">Title</label>
              <input {...register("title")} className={inputClass} placeholder="Cozy Beachfront Villa" />
              {errors.title && <p className={errClass}>{errors.title.message}</p>}
            </div>
            <div>
              <label className="font-semibold block mb-2">Description</label>
              <textarea {...register("description")} className={`${inputClass} h-32`} placeholder="Tell guests about your space..." />
              {errors.description && <p className={errClass}>{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-2">Property Type</label>
                <select {...register("property_type")} className={inputClass}>
                  <option>Apartment</option>
                  <option>Villa</option>
                  <option>Cabin</option>
                  <option>Treehouse</option>
                  <option>Tiny home</option>
                  <option>Loft</option>
                </select>
                {errors.property_type && <p className={errClass}>{errors.property_type.message}</p>}
              </div>
              <div>
                <label className="font-semibold block mb-2">Address</label>
                <input {...register("address")} className={inputClass} />
                {errors.address && <p className={errClass}>{errors.address.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold block mb-2">City</label>
                <input {...register("city")} className={inputClass} />
                {errors.city && <p className={errClass}>{errors.city.message}</p>}
              </div>
              <div>
                <label className="font-semibold block mb-2">State</label>
                <input {...register("state")} className={inputClass} />
                {errors.state && <p className={errClass}>{errors.state.message}</p>}
              </div>
              <div>
                <label className="font-semibold block mb-2">Country</label>
                <input {...register("country")} className={inputClass} />
                {errors.country && <p className={errClass}>{errors.country.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Details & Pricing */}
        {step === 2 && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label className="font-semibold block mb-2">Max Guests</label>
                <input type="number" {...register("max_guests", { valueAsNumber: true })} className={inputClass} />
                {errors.max_guests && <p className={errClass}>{errors.max_guests.message}</p>}
              </div>
              <div>
                <label className="font-semibold block mb-2">Bedrooms</label>
                <input type="number" {...register("bedrooms", { valueAsNumber: true })} className={inputClass} />
                {errors.bedrooms && <p className={errClass}>{errors.bedrooms.message}</p>}
              </div>
              <div>
                <label className="font-semibold block mb-2">Beds</label>
                <input type="number" {...register("beds", { valueAsNumber: true })} className={inputClass} />
                {errors.beds && <p className={errClass}>{errors.beds.message}</p>}
              </div>
              <div>
                <label className="font-semibold block mb-2">Bathrooms</label>
                <input type="number" step="0.5" {...register("bathrooms", { valueAsNumber: true })} className={inputClass} />
                {errors.bathrooms && <p className={errClass}>{errors.bathrooms.message}</p>}
              </div>
            </div>

            <hr className="my-4 border-[color:var(--color-airbnb-border)]" />

            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="font-semibold block mb-2">Price per night ($)</label>
                <input type="number" {...register("price_per_night", { valueAsNumber: true })} className={inputClass} />
                {errors.price_per_night && <p className={errClass}>{errors.price_per_night.message}</p>}
              </div>
              <div>
                <label className="font-semibold block mb-2">Cleaning fee ($)</label>
                <input type="number" {...register("cleaning_fee", { valueAsNumber: true })} className={inputClass} />
                {errors.cleaning_fee && <p className={errClass}>{errors.cleaning_fee.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Amenities */}
        {step === 3 && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold mb-2">Select your amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {AMENITY_OPTIONS.map((amenity) => (
                <div 
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`border p-4 rounded-xl cursor-pointer transition flex items-center gap-3 ${currentAmenities.includes(amenity) ? 'border-black bg-neutral-50 shadow-inner' : 'border-[color:var(--color-airbnb-border)] hover:border-black'}`}
                >
                  <div className={`w-4 h-4 border rounded-sm flex items-center justify-center ${currentAmenities.includes(amenity) ? 'bg-black border-black text-white' : 'border-neutral-400'}`}>
                    {currentAmenities.includes(amenity) && <span className="text-[10px]">✓</span>}
                  </div>
                  <div className="font-semibold text-sm">{amenity}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Photos */}
        {step === 4 && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold">Add Photos</h2>
            <p className="text-neutral-500 -mt-4 mb-2">Provide Unsplash or direct image URLs.</p>
            {errors.photos?.root && <p className={errClass}>{errors.photos.root.message}</p>}
            
            <div className="flex flex-col gap-4">
              {photoFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-4">
                  <div className="flex-1">
                    <input 
                      {...register(`photos.${index}.url`)} 
                      placeholder="https://..." 
                      className={inputClass} 
                    />
                    {errors.photos?.[index]?.url && <p className={errClass}>{errors.photos[index].url?.message}</p>}
                  </div>
                  <button type="button" onClick={() => removePhoto(index)} className="p-3 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition mt-1">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
            
            <Button type="button" onClick={() => appendPhoto({ url: "" })} className="w-max flex items-center gap-2 mt-2">
              <Plus size={16} /> Add another photo
            </Button>
          </div>
        )}

        <div className="mt-10 border-t border-[color:var(--color-airbnb-border)] pt-6 flex justify-between">
          {step > 1 ? (
             <button type="button" onClick={() => setStep(s => s - 1)} className="font-semibold underline hover:text-neutral-600">Back</button>
          ) : <div />}
          
          {step < 4 ? (
             <Button type="button" primary onClick={handleNext}>Next</Button>
          ) : (
             <Button primary type="submit" disabled={submitting}>
               {submitting ? "Saving..." : (initialData ? "Save changes" : "Create listing")}
             </Button>
          )}
        </div>
      </form>
    </div>
  );
}
