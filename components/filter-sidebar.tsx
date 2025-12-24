"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

const brands = ["Nike", "Adidas", "Puma", "New Balance", "Jordan", "Reebok"]
const sizes = ["7", "8", "9", "10", "11", "12", "13"]
const colors = ["Black", "White", "Red", "Blue", "Green", "Gray"]

export function FilterSidebar() {
  const [priceRange, setPriceRange] = useState([0, 500])

  return (
    <div className="space-y-4">
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Brand</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center gap-2">
              <Checkbox id={brand} />
              <Label htmlFor={brand} className="text-sm font-normal cursor-pointer">
                {brand}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {sizes.map((size) => (
              <Button
                key={size}
                variant="outline"
                size="sm"
                className="hover:bg-primary hover:text-primary-foreground bg-transparent"
              >
                {size}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider value={priceRange} onValueChange={setPriceRange} max={500} step={10} className="w-full" />
          <div className="flex items-center justify-between text-sm">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Color</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {colors.map((color) => (
            <div key={color} className="flex items-center gap-2">
              <Checkbox id={color} />
              <Label htmlFor={color} className="text-sm font-normal cursor-pointer">
                {color}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button className="w-full bg-transparent" variant="outline">
        Reset Filters
      </Button>
    </div>
  )
}
