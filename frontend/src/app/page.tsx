import { Skeleton } from "@/components/UI";

export default function Home() {
  return (
    <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {[...Array(18)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2 cursor-pointer group">
            <Skeleton className="w-full aspect-square rounded-xl" />
            <div className="mt-2 flex justify-between items-start">
              <Skeleton className="w-3/4 h-4 rounded" />
              <Skeleton className="w-8 h-4 rounded" />
            </div>
            <Skeleton className="w-1/2 h-4 rounded" />
            <Skeleton className="w-1/3 h-4 mt-1 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
