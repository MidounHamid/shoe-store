'use client'

import Image from 'next/image'

export function SocialProof() {
  const customerImages = [
    '/images/image.png',
    '/images/image.png',
    '/images/image.png',
    '/images/image.png',
    '/images/image.png',
    '/images/image.png',
  ]

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">As Seen On You</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of sneaker enthusiasts who trust SneakHub. See how our community rocks their kicks.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {customerImages.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
            >
              <Image
                src={img || "/placeholder.svg"}
                alt={`Customer ${idx + 1}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div>
                  <h3 className="text-white font-semibold text-sm">Customer Story</h3>
                  <p className="text-white/80 text-xs">@sneaker_lover_{idx + 1}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Tag us on Instagram for a chance to be featured!</p>
          <p className="text-2xl font-bold text-primary">#SneakHubFamily</p>
        </div>
      </div>
    </section>
  )
}
