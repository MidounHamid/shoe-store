'use client'

import { Truck, CheckCircle, RotateCcw } from 'lucide-react'

export function ValueProps() {
  const props = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On orders over $100'
    },
    {
      icon: CheckCircle,
      title: 'Authenticity Guaranteed',
      description: '100% genuine products'
    },
    {
      icon: RotateCcw,
      title: '30-Day Returns',
      description: 'Easy returns & exchanges'
    },
  ]

  return (
    <section className="py-12 bg-card/30 backdrop-blur-sm border-y border-border/40">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {props.map((prop, idx) => {
            const Icon = prop.icon
            return (
              <div key={idx} className="flex items-center gap-4 group hover:bg-primary/5 p-4 rounded-xl transition-colors">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{prop.title}</h3>
                  <p className="text-sm text-muted-foreground">{prop.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
