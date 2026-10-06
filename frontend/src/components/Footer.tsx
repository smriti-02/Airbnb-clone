export default function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-airbnb-border)] bg-neutral-50 mt-12 py-8">
      <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 flex flex-col md:flex-row justify-between items-center text-sm text-[color:var(--color-airbnb-secondary)]">
        <div>© 2026 Airbnb Clone, Inc. · Privacy · Terms · Sitemap</div>
        <div className="flex gap-4 mt-4 md:mt-0 font-semibold text-[color:var(--color-airbnb-text)]">
          <span className="cursor-pointer hover:underline">English (US)</span>
          <span className="cursor-pointer hover:underline">$ USD</span>
          <span className="cursor-pointer hover:underline">Support & resources</span>
        </div>
      </div>
    </footer>
  );
}
