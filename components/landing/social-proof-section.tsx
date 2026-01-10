export function SocialProofSection() {
  // Placeholder for "As seen in" or "Trusted by" logos
  const brands = ['TechCrunch', 'Product Hunt', 'Forbes', 'Mashable'];

  return (
    <section className='py-10 border-t border-border'>
      <div className='mx-auto max-w-6xl px-4 sm:px-6'>
        <p className='text-center text-xs uppercase tracking-widest text-muted-foreground mb-6'>
          Trusted by creators featured in
        </p>
        <div className='flex items-center justify-center gap-8 sm:gap-12 flex-wrap opacity-50'>
          {brands.map((brand, i) => (
            <div
              key={i}
              className='text-lg font-semibold text-muted-foreground'
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
