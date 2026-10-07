"use client";

import { useRouter, usePathname } from "next/navigation";
import { User } from "@/contexts/UserContext";
import toast from "react-hot-toast";

export function useUserSwitchRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = (u: User | null) => {
    if (!u) {
      if (pathname.startsWith("/host")) {
        router.push("/");
      }
      router.refresh();
      return;
    }

    if (u.is_host) {
      router.push("/host");
      toast.success(`Hosting as ${u.name}`);
    } else {
      if (pathname.startsWith("/host") || pathname.startsWith("/become-a-host")) {
        router.push("/");
      }
      toast.success(`Switched to ${u.name}`);
    }
    router.refresh();
  };

  return { handleSwitch };
}
