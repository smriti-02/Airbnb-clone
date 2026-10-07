import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 cursor-pointer text-[#FF385C]">
      <svg 
        viewBox="0 0 1000 1000" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="60" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="w-8 h-8 md:w-9 md:h-9"
      >
        <path d="M499.3 736.7c-51-64-81-120.1-91-168.1-10-39-6-70 11-93 18-27 45-40 80-40s62 13 80 40c17 23 21 54 11 93-11 49-41 105-91 168.1zm362.2 43c-7 47-39 86-83 105-85 37-169.1-22-241.1-102 119.1-149.1 141.1-265.1 90-340.2-30-43-73-64-128.1-64-55 0-98 21-128.1 64-51 75.1-29 191.1 90 340.2-72 80-156.1 139-241.1 102-44-19-76-58-83-105-9-58 14-118 72-177.1 27.1-28.1 62.1-59.1 103.1-91.1 25.1-20.1 53.1-39.1 84.1-55.1 24-12 51-24 81-34 9-3 19-6 29-9l34-9c17-4 35-7 55-9 11-1 22-2 34-2 12 0 23 1 34 2 20 2 38 5 55 9l34 9c10 3 20 6 29 9 30 10 57 22 81 34 31 16 59 35 84.1 55.1 41 32 76 63 103.1 91.1 58 59.1 81 119.1 72 177.1z"></path>
      </svg>
      <span className="hidden lg:block font-bold text-xl tracking-tight">airbnb</span>
    </Link>
  );
}
