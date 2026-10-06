"use client";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/UI";
import { useRouter } from "next/navigation";

export default function HostLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const router = useRouter();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-bold">Please log in</h2>
        <Button primary onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  if (!user.is_host) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 max-w-md mx-auto text-center px-4">
        <h2 className="text-3xl font-bold mb-2">Switch to hosting</h2>
        <p className="text-neutral-500 mb-6">You are currently using a Guest account. To access the Host Dashboard, you need to either switch to a Host account from the top right menu, or upgrade your account to become a Host.</p>
        <Button primary onClick={() => router.push("/")}>Back to exploring</Button>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen pb-20">
      <div className="max-w-[1120px] mx-auto xl:px-0 px-4 pt-10">
        {children}
      </div>
    </div>
  );
}
