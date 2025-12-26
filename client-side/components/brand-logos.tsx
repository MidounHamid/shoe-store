export function BrandLogos() {
  const brands = [
    { name: "Nike", logo: "✓" },
    { name: "Adidas", logo: "⚡" },
    { name: "Puma", logo: "🐆" },
    { name: "New Balance", logo: "NB" },
    { name: "Jordan", logo: "🏀" },
    { name: "Reebok", logo: "R" },
  ]

  return (
    <section className="border-y border-border/40 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8 md:grid-cols-6">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex flex-col items-center justify-center gap-2 transition-all hover:scale-110"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary text-2xl">
                {brand.logo}
              </div>
              <span className="text-sm font-medium text-muted-foreground">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
