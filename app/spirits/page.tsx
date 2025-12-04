'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Spirit {
  id: string
  name: string
  brand?: string
  category: string
  type?: string
  price?: number
  rating?: number
  description?: string
  image_url?: string
  proof?: number
  age?: string
  origin?: string
}

// Real bourbon images from Unsplash (free to use)
const SPIRIT_IMAGES: Record<string, string> = {
  bourbon: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400',
  scotch: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400',
  whiskey: 'https://images.unsplash.com/photo-1574023081167-2e5beaa4ec20?w=400',
  wine: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
  beer: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400',
  rum: 'https://images.unsplash.com/photo-1614313511387-1436a4480ebb?w=400',
  tequila: 'https://images.unsplash.com/photo-1516535794938-6063878f08cc?w=400',
  vodka: 'https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=400',
  gin: 'https://images.unsplash.com/photo-1608885898957-a559228e8749?w=400',
  cognac: 'https://images.unsplash.com/photo-1619451050621-83cb7aada2d7?w=400',
  default: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400'
}

// Fallback featured spirits with real data
const FEATURED_SPIRITS: Spirit[] = [
  {
    id: 'bt-1',
    name: 'Buffalo Trace Kentucky Straight Bourbon',
    brand: 'Buffalo Trace',
    category: 'bourbon',
    type: 'Kentucky Straight Bourbon',
    price: 30,
    rating: 88,
    description: 'Sweet vanilla, caramel, and hints of mint with a smooth finish.',
    proof: 90,
    origin: 'Kentucky, USA'
  },
  {
    id: 'er-1',
    name: 'Eagle Rare 10 Year',
    brand: 'Eagle Rare',
    category: 'bourbon',
    type: 'Single Barrel Bourbon',
    price: 35,
    rating: 91,
    description: 'Bold, dry, with notes of toffee, orange peel, and leather.',
    proof: 90,
    age: '10 Years',
    origin: 'Kentucky, USA'
  },
  {
    id: 'bl-1',
    name: "Blanton's Single Barrel",
    brand: "Blanton's",
    category: 'bourbon',
    type: 'Single Barrel Bourbon',
    price: 65,
    rating: 93,
    description: 'Complex with citrus, honey, vanilla, and a hint of nutmeg.',
    proof: 93,
    origin: 'Kentucky, USA'
  },
  {
    id: 'mk-1',
    name: "Maker's Mark",
    brand: "Maker's Mark",
    category: 'bourbon',
    type: 'Wheated Bourbon',
    price: 28,
    rating: 86,
    description: 'Soft wheat forward with caramel and vanilla notes.',
    proof: 90,
    origin: 'Kentucky, USA'
  },
  {
    id: 'wt-1',
    name: 'Wild Turkey 101',
    brand: 'Wild Turkey',
    category: 'bourbon',
    type: 'Kentucky Straight Bourbon',
    price: 25,
    rating: 87,
    description: 'Bold, spicy, with notes of vanilla, honey, and orange peel.',
    proof: 101,
    origin: 'Kentucky, USA'
  },
  {
    id: 'wb-1',
    name: 'Woodford Reserve',
    brand: 'Woodford Reserve',
    category: 'bourbon',
    type: 'Small Batch Bourbon',
    price: 35,
    rating: 89,
    description: 'Rich dried fruit, vanilla, and toasted oak with a silky texture.',
    proof: 90.4,
    origin: 'Kentucky, USA'
  },
  {
    id: 'fr-1',
    name: 'Four Roses Single Barrel',
    brand: 'Four Roses',
    category: 'bourbon',
    type: 'Single Barrel Bourbon',
    price: 45,
    rating: 90,
    description: 'Complex with ripe plum, cherries, and a hint of cocoa.',
    proof: 100,
    origin: 'Kentucky, USA'
  },
  {
    id: 'of-1',
    name: 'Old Forester 1920 Prohibition Style',
    brand: 'Old Forester',
    category: 'bourbon',
    type: 'Barrel Proof Bourbon',
    price: 60,
    rating: 92,
    description: 'Dark caramel, chocolate, and dense oak with a long finish.',
    proof: 115,
    origin: 'Kentucky, USA'
  },
  {
    id: 'eht-1',
    name: 'E.H. Taylor Small Batch',
    brand: 'E.H. Taylor Jr.',
    category: 'bourbon',
    type: 'Bottled-in-Bond Bourbon',
    price: 45,
    rating: 91,
    description: 'Complex butterscotch, licorice, and tobacco notes.',
    proof: 100,
    origin: 'Kentucky, USA'
  },
  {
    id: 'ws-1',
    name: 'Weller Special Reserve',
    brand: 'W.L. Weller',
    category: 'bourbon',
    type: 'Wheated Bourbon',
    price: 30,
    rating: 85,
    description: 'Sweet wheated bourbon with honey and butterscotch.',
    proof: 90,
    origin: 'Kentucky, USA'
  },
  {
    id: 'mac-1',
    name: 'The Macallan 12 Year Double Cask',
    brand: 'The Macallan',
    category: 'scotch',
    type: 'Single Malt Scotch',
    price: 65,
    rating: 88,
    description: 'Rich dried fruits, ginger, and toffee with sherry influence.',
    proof: 86,
    age: '12 Years',
    origin: 'Speyside, Scotland'
  },
  {
    id: 'glen-1',
    name: 'Glenfiddich 18 Year',
    brand: 'Glenfiddich',
    category: 'scotch',
    type: 'Single Malt Scotch',
    price: 95,
    rating: 91,
    description: 'Fruity and oaky with hints of baked apple and robust oak.',
    proof: 86,
    age: '18 Years',
    origin: 'Speyside, Scotland'
  }
]

const CATEGORIES = [
  { id: 'all', name: 'All Spirits', icon: '🥃', color: 'amber' },
  { id: 'bourbon', name: 'Bourbon', icon: '🥃', color: 'amber' },
  { id: 'scotch', name: 'Scotch', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: 'amber' },
  { id: 'wine', name: 'Wine', icon: '🍷', color: 'red' },
  { id: 'beer', name: 'Beer', icon: '🍺', color: 'yellow' },
  { id: 'rum', name: 'Rum', icon: '🏝️', color: 'amber' },
  { id: 'tequila', name: 'Tequila', icon: '🌵', color: 'green' },
  { id: 'vodka', name: 'Vodka', icon: '❄️', color: 'blue' },
  { id: 'gin', name: 'Gin', icon: '🍸', color: 'green' },
  { id: 'cognac', name: 'Cognac', icon: '🍇', color: 'purple' },
]

export default function SpiritsPage() {
  const [spirits, setSpirits] = useState<Spirit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedSpirit, setSelectedSpirit] = useState<Spirit | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const ITEMS_PER_PAGE = 20

  const fetchSpirits = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/spirits?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch spirits')
      }

      const data = await response.json()
      
      if (data.spirits && data.spirits.length > 0) {
        setSpirits(data.spirits)
        setTotalCount(data.total)
        setCategoryCounts(data.categoryCounts || {})
      } else {
        // Use fallback data if API returns empty
        const filtered = FEATURED_SPIRITS.filter(s => 
          selectedCategory === 'all' || s.category === selectedCategory
        ).filter(s =>
          !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setSpirits(filtered)
        setTotalCount(filtered.length)
        
        // Calculate category counts from fallback
        const counts: Record<string, number> = {}
        FEATURED_SPIRITS.forEach(s => {
          counts[s.category] = (counts[s.category] || 0) + 1
        })
        setCategoryCounts(counts)
      }
    } catch (err) {
      console.error('Fetch error:', err)
      // Use fallback data on error
      const filtered = FEATURED_SPIRITS.filter(s => 
        selectedCategory === 'all' || s.category === selectedCategory
      )
      setSpirits(filtered)
      setTotalCount(filtered.length)
      
      const counts: Record<string, number> = {}
      FEATURED_SPIRITS.forEach(s => {
        counts[s.category] = (counts[s.category] || 0) + 1
      })
      setCategoryCounts(counts)
    } finally {
      setLoading(false)
    }
  }, [page, selectedCategory, searchQuery])

  useEffect(() => {
    fetchSpirits()
  }, [fetchSpirits])

  const getImageUrl = (spirit: Spirit) => {
    if (spirit.image_url) return spirit.image_url
    return SPIRIT_IMAGES[spirit.category] || SPIRIT_IMAGES.default
  }

  const sortedSpirits = [...spirits].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
    if (sortBy === 'price_low') return (a.price || 0) - (b.price || 0)
    if (sortBy === 'price_high') return (b.price || 0) - (a.price || 0)
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-amber-950/10 to-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-4">
            <Link href="/collection" className="hover:text-amber-400 transition-colors">My Collection</Link>
            <Link href="/stores" className="hover:text-amber-400 transition-colors">Find Stores</Link>
            <Link href="/auth/login" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg">Sign In</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 px-4 text-center border-b border-stone-800/50">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
            Explore Our Spirit Collection
          </span>
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          {totalCount > 0 ? `${totalCount.toLocaleString()} spirits` : 'Discover premium spirits'} from around the world
        </p>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, brand, or style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-800/70 border border-stone-700 rounded-xl px-6 py-4 pl-12 text-lg focus:outline-none focus:border-amber-500"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 px-4 border-b border-stone-800/50 bg-black/30 overflow-x-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 min-w-max">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id)
                  setPage(1)
                }}
                className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-800 hover:bg-stone-700 text-gray-300'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                {categoryCounts[cat.id] && (
                  <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full">
                    {categoryCounts[cat.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sort & Filters */}
      <section className="py-4 px-4 border-b border-stone-800/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-gray-400">
            {loading ? 'Loading...' : `Showing ${sortedSpirits.length} spirits`}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-stone-800 rounded-lg px-4 py-2 text-sm"
          >
            <option value="rating">Highest Rated</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </section>

      {/* Spirits Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-stone-800/50 rounded-xl animate-pulse">
                <div className="aspect-square bg-stone-700/50 rounded-t-xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-stone-700/50 rounded w-3/4" />
                  <div className="h-3 bg-stone-700/50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedSpirits.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">🔍</span>
            <h3 className="text-xl font-semibold mb-2">No spirits found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sortedSpirits.map(spirit => (
              <div
                key={spirit.id}
                onClick={() => {
                  setSelectedSpirit(spirit)
                  setShowModal(true)
                }}
                className="bg-stone-800/50 rounded-xl overflow-hidden border border-stone-700/50 hover:border-amber-500/50 transition-all cursor-pointer group"
              >
                {/* Image */}
                <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-amber-900/20 to-stone-800">
                  <img
                    src={getImageUrl(spirit)}
                    alt={spirit.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = SPIRIT_IMAGES.default
                    }}
                  />
                  {spirit.rating && spirit.rating >= 90 && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                      ⭐ Top Rated
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-amber-400 transition-colors">
                    {spirit.name}
                  </h3>
                  <p className="text-xs text-gray-400 mb-2">{spirit.brand || spirit.type}</p>
                  
                  <div className="flex items-center justify-between">
                    {spirit.price && (
                      <span className="text-amber-400 font-semibold">${spirit.price}</span>
                    )}
                    {spirit.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-yellow-400">★</span>
                        <span>{spirit.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalCount > ITEMS_PER_PAGE && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-stone-800 rounded-lg disabled:opacity-50"
            >
              ← Previous
            </button>
            <span className="px-4 py-2 text-gray-400">
              Page {page} of {Math.ceil(totalCount / ITEMS_PER_PAGE)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(totalCount / ITEMS_PER_PAGE)}
              className="px-4 py-2 bg-stone-800 rounded-lg disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {/* Spirit Detail Modal */}
      {showModal && selectedSpirit && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-stone-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Image */}
            <div className="aspect-video relative">
              <img
                src={getImageUrl(selectedSpirit)}
                alt={selectedSpirit.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/80"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedSpirit.name}</h2>
                  <p className="text-gray-400">{selectedSpirit.brand}</p>
                </div>
                {selectedSpirit.rating && (
                  <div className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-lg font-bold">
                    ★ {selectedSpirit.rating}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {selectedSpirit.price && (
                  <div className="bg-stone-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400">Price</div>
                    <div className="text-lg font-semibold text-amber-400">${selectedSpirit.price}</div>
                  </div>
                )}
                {selectedSpirit.proof && (
                  <div className="bg-stone-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400">Proof</div>
                    <div className="text-lg font-semibold">{selectedSpirit.proof}°</div>
                  </div>
                )}
                {selectedSpirit.age && (
                  <div className="bg-stone-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400">Age</div>
                    <div className="text-lg font-semibold">{selectedSpirit.age}</div>
                  </div>
                )}
                {selectedSpirit.origin && (
                  <div className="bg-stone-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400">Origin</div>
                    <div className="text-lg font-semibold truncate">{selectedSpirit.origin}</div>
                  </div>
                )}
              </div>

              {selectedSpirit.description && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Tasting Notes</h3>
                  <p className="text-gray-300">{selectedSpirit.description}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button className="flex-1 bg-amber-600 hover:bg-amber-500 py-3 rounded-lg font-semibold transition-colors">
                  Add to Collection
                </button>
                <button className="bg-stone-700 hover:bg-stone-600 px-6 py-3 rounded-lg font-semibold transition-colors">
                  ♡ Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
