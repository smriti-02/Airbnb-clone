"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import qs from "query-string";
import { Flame, Waves, Tent, Home, Mountain, Trees, Tractor, Castle, Palmtree, Snowflake } from "lucide-react";

export const categories = [
  { label: "Trending", icon: Flame, property_type: "" },
  { label: "Beachfront", icon: Waves, property_type: "Beachfront" },
  { label: "Cabins", icon: Tent, property_type: "Cabin" },
  { label: "Villas", icon: Home, property_type: "Villa" },
  { label: "Amazing views", icon: Mountain, property_type: "Loft" },
  { label: "Treehouses", icon: Trees, property_type: "Treehouse" },
  { label: "Farms", icon: Tractor, property_type: "Farm" },
  { label: "Tiny homes", icon: Home, property_type: "Tiny home" },
  { label: "Castles", icon: Castle, property_type: "Castle" },
  { label: "Tropical", icon: Palmtree, property_type: "Mansion" },
  { label: "Arctic", icon: Snowflake, property_type: "Apartment" },
];

export default function Categories() {
  const router = useRouter();
  const params = useSearchParams();
  const currentCategory = params.get("property_type");

  const handleClick = useCallback((property_type: string) => {
    let currentQuery = {};
    if (params) {
      currentQuery = qs.parse(params.toString());
    }

    const updatedQuery: any = {
      ...currentQuery,
      property_type: property_type,
      page: 1
    };

    if (params?.get("property_type") === property_type || property_type === "") {
      delete updatedQuery.property_type;
    }

    const url = qs.stringifyUrl({
      url: "/",
      query: updatedQuery
    }, { skipNull: true });

    router.push(url);
  }, [params, router]);

  return (
    <div className="flex flex-row items-center overflow-x-auto gap-8 scrollbar-hide">
      {categories.map((item) => (
        <div
          key={item.label}
          onClick={() => handleClick(item.property_type)}
          className={`
            flex flex-col items-center justify-center gap-2 pb-2 border-b-2 hover:text-black transition cursor-pointer flex-shrink-0
            ${currentCategory === item.property_type || (!currentCategory && item.property_type === "") 
              ? "border-black text-black" 
              : "border-transparent text-neutral-500"}
          `}
        >
          <item.icon size={26} />
          <div className="text-xs font-medium">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
