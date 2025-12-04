'use client'

import { useState } from 'react'
import Link from 'next/link'

// Label evolution data - this would come from database
const LABEL_EVOLUTIONS = {
  'buffalo-trace': {
    brand: 'Buffalo Trace',
    category: 'Bourbon',
    founded: 1773,
    description: 'One of America\'s oldest continuously operating distilleries',
    evolutions: [
      { year: 1870, era: 'Pre-Prohibition', image: '🏺', description: 'Hand-blown glass bottles with paper labels, cork stoppers', characteristics: ['Paper label', 'Cork stopper', 'Clear glass', 'Hand-blown'], rarity: 'Extremely Rare' },
      { year: 1910, era: 'Golden Age', image: '🍶', description: 'Embossed glass bottles, more elaborate label design', characteristics: ['Embossed glass', 'Gold foil', 'Tax stamps', 'Pint size'], rarity: 'Very Rare' },
      { year: 1935, era: 'Post-Prohibition', image: '🥃', description: 'Standardized bottles, federal regulations', characteristics: ['Government warning', 'Proof statement', 'Net contents', 'Screw cap option'], rarity: 'Rare' },
      { year: 1970, era: 'Modern Era', image: '🥃', description: 'Streamlined design, focus on heritage', characteristics: ['Buffalo logo', 'Heritage messaging', 'Amber glass', 'Synthetic cork'], rarity: 'Uncommon' },
      { year: 1999, era: 'Rebranding', image: '🥃', description: 'Current label design with buffalo imagery', characteristics: ['Iconic buffalo', 'Premium positioning', 'Clear branding', 'Gift box options'], rarity: 'Current' },
      { year: 2020, era: 'Limited Editions', image: '✨', description: 'Special releases with unique packaging', characteristics: ['Collector editions', 'Numbered bottles', 'Unique shapes', 'Premium materials'], rarity: 'Limited' }
    ]
  },
  'makers-mark': {
    brand: 'Maker\'s Mark',
    category: 'Bourbon',
    founded: 1953,
    description: 'The first bourbon to be designated a National Historic Landmark',
    evolutions: [
      { year: 1958, era: 'Original', image: '🍶', description: 'First bottles with the iconic red wax dip', characteristics: ['Red wax seal', 'Square bottle', 'Hand-dipped', 'Star logo'], rarity: 'Very Rare' },
      { year: 1975, era: 'Expansion', image: '🥃', description: 'Wider distribution, refined label', characteristics: ['Updated typography', 'Clearer branding', 'Consistent wax', 'Gift packaging'], rarity: 'Rare' },
      { year: 1990, era: 'Premium Push', image: '🥃', description: 'Emphasis on handcraft and tradition', characteristics: ['Handmade messaging', 'Wheat bourbon callout', 'Gold accents', 'Heritage focus'], rarity: 'Uncommon' },
      { year: 2010, era: 'Modern Classic', image: '🥃', description: 'Current design with refined aesthetics', characteristics: ['Modern typography', 'Clean design', 'Consistent branding', 'Collector appeal'], rarity: 'Current' },
      { year: 2023, era: 'Wood Finishing Series', image: '✨', description: 'Special releases with unique wood finishes', characteristics: ['Different wax colors', 'Wood finish callouts', 'Limited quantities', 'Collector boxes'], rarity: 'Limited' }
    ]
  },
  'jack-daniels': {
    brand: 'Jack Daniel\'s',
    category: 'Tennessee Whiskey',
    founded: 1866,
    description: 'The best-selling American whiskey in the world',
    evolutions: [
      { year: 1866, era: 'Original', image: '🏺', description: 'Simple earthenware jugs and basic labels', characteristics: ['Stoneware jugs', 'Simple paper label', 'Hand-filled', 'Local distribution'], rarity: 'Museum Piece' },
      { year: 1895, era: 'First Bottles', image: '🍶', description: 'Introduction of glass bottles with distinctive shape', characteristics: ['Square bottle intro', 'Black label', 'Gold text', 'Screw top'], rarity: 'Extremely Rare' },
      { year: 1920, era: 'Prohibition', image: '🥃', description: 'Production halted, existing stock sold as medicinal', characteristics: ['Medicinal labels', 'Prescription required', 'Limited production'], rarity: 'Very Rare' },
      { year: 1950, era: 'Post-War Boom', image: '🥃', description: 'Iconic black label design established', characteristics: ['Classic black label', 'Old No. 7', 'Tennessee pride', 'National distribution'], rarity: 'Rare' },
      { year: 1980, era: 'Global Expansion', image: '🥃', description: 'International success, consistent branding', characteristics: ['Global labeling', 'Multi-language', 'Consistent design', 'Premium positioning'], rarity: 'Uncommon' },
      { year: 2011, era: 'Premiumization', image: '✨', description: 'Single Barrel and premium line launches', characteristics: ['Single Barrel Select', 'Gentleman Jack', 'Premium packaging', 'Collector editions'], rarity: 'Current' }
    ]
  },
  'macallan': {
    brand: 'The Macallan',
    category: 'Scotch Whisky',
    founded: 1824,
    description: 'One of the world\'s most valuable whisky brands',
    evolutions: [
      { year: 1900, era: 'Victorian', image: '🏺', description: 'Traditional Scottish bottle design', characteristics: ['Dark glass', 'Wax seal', 'Celtic imagery', 'Highland origin'], rarity: 'Museum Piece' },
      { year: 1950, era: 'Post-War', image: '🍶', description: 'Modernized design, broader distribution', characteristics: ['Clearer labels', 'Age statements', 'Sherry cask mention', 'Export focus'], rarity: 'Very Rare' },
      { year: 1980, era: 'Collector Era', image: '🥃', description: 'Rise as collector\'s whisky', characteristics: ['Premium positioning', 'Limited editions', 'Age-dated releases', 'Gift packaging'], rarity: 'Rare' },
      { year: 2004, era: 'Fine & Rare', image: '🥃', description: 'Ultra-premium line launched', characteristics: ['Vintage dating', 'Cask details', 'Limited numbers', 'Collector market'], rarity: 'Uncommon' },
      { year: 2018, era: 'Color Collection', image: '✨', description: 'New age-statement-free range', characteristics: ['No age statement', 'Color-based naming', 'Natural color focus', 'Modern design'], rarity: 'Current' }
    ]
  }
}

const ALL_BRANDS = [
  { id: 'buffalo-trace', name: 'Buffalo Trace', category: 'Bourbon', logo: '🦬' },
  { id: 'makers-mark', name: 'Maker\'s Mark', category: 'Bourbon', logo: '⭐' },
  { id: 'jack-daniels', name: 'Jack Daniel\'s', category: 'Tennessee', logo: '🎸' },
  { id: 'macallan', name: 'The Macallan', category: 'Scotch', logo: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { id: 'johnnie-walker', name: 'Johnnie Walker', category: 'Scotch', logo: '🚶' },
  { id: 'jameson', name: 'Jameson', category: 'Irish', logo: '🍀' },
  { id: 'patron', name: 'Patrón', category: 'Tequila', logo: '🐝' },
  { id: 'bacardi', name: 'Bacardi', category: 'Rum', logo: '🦇' },
  { id: 'hennessy', name: 'Hennessy', category: 'Cognac', logo: '💪' },
  { id: 'dom-perignon', name: 'Dom Pérignon', category: 'Champagne', logo: '🍾' }
]

export default function LabelGalleryPage() {
  const [selectedBrand, setSelectedBrand] = useState<string>('buffalo-trace')
  const [selectedEra, setSelectedEra] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'timeline' | 'compare'>('timeline')

  const currentBrand = LABEL_EVOLUTIONS[selectedBrand as keyof typeof LABEL_EVOLUTIONS]

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-amber-950/20 to-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-4">
            <Link href="/museum" className="hover:text-amber-400 transition-colors">Museum</Link>
            <Link href="/history" className="hover:text-amber-400 transition-colors">History</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-amber-600 to-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold mb-4">
            🏷️ LABEL GALLERY
          </div>
          <h1 className="text-5xl font-bold mb-4">
            The Evolution of <span className="text-amber-400">Iconic Labels</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explore how your favorite spirits brands have evolved over decades. 
            See the bottles, labels, and packaging that defined each era.
          </p>
        </div>

        {/* Brand Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">Select a Brand</h2>
          <div className="flex flex-wrap gap-3">
            {ALL_BRANDS.map(brand => (
              <button
                key={brand.id}
                onClick={() => {
                  if (LABEL_EVOLUTIONS[brand.id as keyof typeof LABEL_EVOLUTIONS]) {
                    setSelectedBrand(brand.id)
                    setSelectedEra(null)
                  }
                }}
                disabled={!LABEL_EVOLUTIONS[brand.id as keyof typeof LABEL_EVOLUTIONS]}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  selectedBrand === brand.id
                    ? 'bg-amber-600 scale-105'
                    : LABEL_EVOLUTIONS[brand.id as keyof typeof LABEL_EVOLUTIONS]
                      ? 'bg-stone-800 hover:bg-stone-700'
                      : 'bg-stone-900 text-gray-600 cursor-not-allowed'
                }`}
              >
                <span>{brand.logo}</span>
                <span>{brand.name}</span>
                {!LABEL_EVOLUTIONS[brand.id as keyof typeof LABEL_EVOLUTIONS] && (
                  <span className="text-xs text-gray-500">(Coming Soon)</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {currentBrand && (
          <>
            {/* Brand Header */}
            <div className="bg-gradient-to-br from-amber-900/40 to-stone-800/40 rounded-2xl p-8 mb-8 border border-amber-500/30">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-4xl font-bold mb-2">{currentBrand.brand}</h2>
                  <div className="flex items-center gap-4 text-gray-400">
                    <span className="bg-amber-900/50 px-3 py-1 rounded-full text-sm">{currentBrand.category}</span>
                    <span>Est. {currentBrand.founded}</span>
                  </div>
                  <p className="mt-4 text-gray-300 max-w-2xl">{currentBrand.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('timeline')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'timeline' ? 'bg-amber-600' : 'bg-stone-700'
                    }`}
                  >
                    Timeline
                  </button>
                  <button
                    onClick={() => setViewMode('compare')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'compare' ? 'bg-amber-600' : 'bg-stone-700'
                    }`}
                  >
                    Compare
                  </button>
                </div>
              </div>
            </div>

            {/* Timeline View */}
            {viewMode === 'timeline' && (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-amber-900/50 transform -translate-x-1/2" />
                
                <div className="space-y-12">
                  {currentBrand.evolutions.map((evolution, i) => (
                    <div
                      key={evolution.year}
                      className={`relative flex items-center gap-8 ${
                        i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                      }`}
                    >
                      {/* Content Card */}
                      <div
                        className={`w-5/12 bg-stone-800/50 rounded-2xl p-6 border border-stone-700/50 hover:border-amber-500/50 transition-all cursor-pointer ${
                          selectedEra === i ? 'ring-2 ring-amber-500' : ''
                        }`}
                        onClick={() => setSelectedEra(selectedEra === i ? null : i)}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-4xl">{evolution.image}</span>
                          <div>
                            <h3 className="text-xl font-bold">{evolution.year}</h3>
                            <span className="text-amber-400 text-sm">{evolution.era}</span>
                          </div>
                        </div>
                        <p className="text-gray-300 mb-4">{evolution.description}</p>
                        
                        {/* Characteristics */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {evolution.characteristics.map((char, j) => (
                            <span key={j} className="bg-stone-700/50 px-2 py-1 rounded text-xs text-gray-400">
                              {char}
                            </span>
                          ))}
                        </div>
                        
                        {/* Rarity */}
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          evolution.rarity === 'Museum Piece' ? 'bg-purple-600' :
                          evolution.rarity === 'Extremely Rare' ? 'bg-red-600' :
                          evolution.rarity === 'Very Rare' ? 'bg-orange-600' :
                          evolution.rarity === 'Rare' ? 'bg-yellow-600' :
                          evolution.rarity === 'Uncommon' ? 'bg-blue-600' :
                          evolution.rarity === 'Limited' ? 'bg-pink-600' :
                          'bg-green-600'
                        }`}>
                          {evolution.rarity}
                        </div>
                      </div>

                      {/* Timeline Node */}
                      <div className="w-2/12 flex justify-center">
                        <div className={`w-6 h-6 rounded-full border-4 transition-all ${
                          selectedEra === i 
                            ? 'bg-amber-500 border-amber-400 scale-125' 
                            : 'bg-stone-800 border-amber-600'
                        }`} />
                      </div>

                      {/* Year Label (opposite side) */}
                      <div className="w-5/12 flex items-center justify-center">
                        <span className="text-6xl font-bold text-amber-900/30">{evolution.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compare View */}
            {viewMode === 'compare' && (
              <div>
                <h3 className="text-xl font-bold mb-6">Side-by-Side Comparison</h3>
                <div className="overflow-x-auto">
                  <div className="flex gap-4 min-w-max pb-4">
                    {currentBrand.evolutions.map((evolution, i) => (
                      <div
                        key={evolution.year}
                        className="w-64 bg-stone-800/50 rounded-xl p-4 border border-stone-700/50 flex-shrink-0"
                      >
                        {/* Bottle Display */}
                        <div className="aspect-square bg-gradient-to-br from-amber-900/30 to-stone-800 rounded-lg flex items-center justify-center mb-4">
                          <span className="text-8xl">{evolution.image}</span>
                        </div>
                        
                        <h4 className="text-lg font-bold">{evolution.year}</h4>
                        <p className="text-amber-400 text-sm mb-2">{evolution.era}</p>
                        <p className="text-gray-400 text-sm mb-3">{evolution.description}</p>
                        
                        {/* Characteristics List */}
                        <ul className="text-xs text-gray-500 space-y-1">
                          {evolution.characteristics.map((char, j) => (
                            <li key={j} className="flex items-center gap-2">
                              <span className="text-amber-500">•</span> {char}
                            </li>
                          ))}
                        </ul>
                        
                        <div className={`mt-4 text-center py-1 rounded text-xs font-bold ${
                          evolution.rarity === 'Museum Piece' ? 'bg-purple-900/50 text-purple-400' :
                          evolution.rarity === 'Extremely Rare' ? 'bg-red-900/50 text-red-400' :
                          evolution.rarity === 'Very Rare' ? 'bg-orange-900/50 text-orange-400' :
                          evolution.rarity === 'Rare' ? 'bg-yellow-900/50 text-yellow-400' :
                          evolution.rarity === 'Uncommon' ? 'bg-blue-900/50 text-blue-400' :
                          evolution.rarity === 'Limited' ? 'bg-pink-900/50 text-pink-400' :
                          'bg-green-900/50 text-green-400'
                        }`}>
                          {evolution.rarity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Did You Know */}
        <div className="mt-12 bg-gradient-to-br from-amber-900/30 to-stone-800/30 rounded-2xl p-8 border border-amber-500/30">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>💡</span> Did You Know?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Tax Stamps', fact: 'Before 1985, all US spirits had to carry federal tax stamps - a practice dating back to the whiskey tax of 1791.' },
              { title: 'Bottle Shapes', fact: 'The distinctive square bottle design was patented by various distillers to prevent counterfeiting and improve shipping.' },
              { title: 'Wax Seals', fact: 'Maker\'s Mark\'s red wax dip was originally added because Bill Samuels Sr.\'s wife thought the bottles looked "too plain."' }
            ].map((item, i) => (
              <div key={i} className="bg-black/30 rounded-xl p-4">
                <h3 className="font-bold text-amber-400 mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.fact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Want to see more historical artifacts?</p>
          <div className="flex justify-center gap-4">
            <Link href="/museum" className="bg-amber-600 hover:bg-amber-500 px-6 py-3 rounded-lg font-semibold transition-colors">
              🏛️ Visit the Museum
            </Link>
            <Link href="/today" className="bg-stone-700 hover:bg-stone-600 px-6 py-3 rounded-lg font-semibold transition-colors">
              📅 Today in History
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
