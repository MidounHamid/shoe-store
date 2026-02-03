'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function FeaturedCategories() {
  const categories = [
    {
      name: 'Basketball',
      icon: '🏀',
      color: 'from-orange-500 to-red-500',
      description: 'Performance court shoes'
    },
    {
      name: 'Running',
      icon: '🏃',
      color: 'from-blue-500 to-cyan-500',
      description: 'Speed and endurance'
    },
    {
      name: 'Lifestyle',
      icon: '👟',
      color: 'from-purple-500 to-pink-500',
      description: 'Everyday style'
    },
    {
      name: 'Trail',
      icon: '⛰️',
      color: 'from-green-500 to-emerald-500',
      description: 'Off-road adventure'
    },
  ]

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.name} href={`/products?category=${category.name}`}>
              <div className={`relative group cursor-pointer rounded-2xl overflow-hidden h-64 bg-gradient-to-br ${category.color} p-6 flex flex-col justify-between transition-all duration-300 hover:scale-105 hover:shadow-2xl`}>
                <div className="relative z-10">
                  <div className="text-5xl mb-4">{category.icon}</div>
                  <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                  <p className="text-white/80 text-sm mt-2">{category.description}</p>
                </div>
                <Button variant="ghost" className="text-white hover:bg-white/20 self-start">
                  Explore →
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
