import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 cursor-pointer">
      <img 
        src="/custom-logo.png" 
        alt="Logo" 
        className="h-8 md:h-10 w-auto object-contain"
      />
      <span className="hidden lg:block font-bold text-xl tracking-tight text-[#FF385C]">airbnb</span>
    </Link>
  );
}
