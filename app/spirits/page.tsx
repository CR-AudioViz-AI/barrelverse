'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// ============================================
// TYPES
// ============================================
type Spirit = {
  id: string
  name: string
  brand: string
  category: string
  subcategory: string | null
  country: string | null
  region: string | null
  distillery: string | null
  abv: number | null
  proof: number | null
  msrp: number | null
  rarity: string
  description: string | null
  is_allocated: boolean
  is_discontinued: boolean
  image_url: string | null
}

// ============================================
// CONSTANTS
// ============================================
const CATEGORIES = [
  { id: 'all', name: 'All Spirits', icon: '🥃', color: 'from-amber-500 to-amber-700' },
  { id: 'bourbon', name: 'Bourbon', icon: '🥃', color: 'from-amber-600 to-amber-800' },
  { id: 'scotch', name: 'Scotch', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: 'from-amber-700 to-amber-900' },
  { id: 'irish', name: 'Irish', icon: '☘️', color: 'from-green-500 to-green-700' },
  { id: 'japanese', name: 'Japanese', icon: '🇯🇵', color: 'from-red-500 to-red-700' },
  { id: 'rye', name: 'Rye', icon: '🌾', color: 'from-yellow-600 to-yellow-800' },
  { id: 'tequila', name: 'Tequila', icon: '🌵', color: 'from-lime-500 to-lime-700' },
  { id: 'mezcal', name: 'Mezcal', icon: '🔥', color: 'from-orange-500 to-orange-700' },
  { id: 'rum', name: 'Rum', icon: '🏝️', color: 'from-orange-600 to-orange-800' },
  { id: 'gin', name: 'Gin', icon: '🫒', color: 'from-teal-500 to-teal-700' },
  { id: 'vodka', name: 'Vodka', icon: '🧊', color: 'from-blue-400 to-blue-600' },
  { id: 'cognac', name: 'Cognac', icon: '🍇', color: 'from-purple-500 to-purple-700' },
  { id: 'wine', name: 'Wine', icon: '🍷', color: 'from-red-600 to-red-800' },
  { id: 'beer', name: 'Beer', icon: '🍺', color: 'from-yellow-500 to-yellow-700' },
  { id: 'sake', name: 'Sake', icon: '🍶', color: 'from-pink-400 to-pink-600' },
]

const RARITY_COLORS: Record<string, string> = {
  common: 'bg-gray-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  very_rare: 'bg-purple-500',
  ultra_rare: 'bg-orange-500',
  legendary: 'bg-yellow-500',
}

const SORT_OPTIONS = [
  { value: 'name', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'msrp', label: 'Price Low-High' },
  { value: 'msrp_desc', label: 'Price High-Low' },
  { value: 'rarity', label: 'Rarity' },
  { value: 'brand', label: 'Brand' },
]

// ============================================
// COMPONENT
// ============================================
export default function SpiritsPage() {
  const [spirits, setSpirits] = useState<Spirit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedSpirit, setSelectedSpirit] = useState<Spirit | null>(null)
  const [showModal, setShowModal] = useState(false)
  
  const ITEMS_PER_PAGE = 24

  // Fetch spirits from database
  const fetchSpirits = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      
      // Build query
      let query = supabase
        .from('bv_spirits')
        .select('*', { count: 'exact' })
      
      // Filter by category
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }
      
      // Search filter
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,distillery.ilike.%${searchQuery}%`)
      }
      
      // Sorting
      const [sortField, sortOrder] = sortBy.includes('_desc') 
        ? [sortBy.replace('_desc', ''), false] 
        : [sortBy, true]
      
      query = query.order(sortField, { ascending: sortOrder })
      
      // Pagination
      const from = (page - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)
      
      const { data, error: queryError, count } = await query
      
      if (queryError) {
        console.error('Supabase error:', queryError)
        setError(`Failed to load spirits: ${queryError.message}`)
        return
      }
      
      setSpirits(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to connect to database')
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, searchQuery, sortBy, page])

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchSpirits()
  }, [fetchSpirits])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [selectedCategory, searchQuery, sortBy])

  // Get category counts
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  
  useEffect(() => {
    async function fetchCounts() {
      const supabase = createClient()
      const { data } = await supabase
        .from('bv_spirits')
        .select('category')
      
      if (data) {
        const counts: Record<string, number> = { all: data.length }
        data.forEach(s => {
          counts[s.category] = (counts[s.category] || 0) + 1
        })
        setCategoryCounts(counts)
      }
    }
    fetchCounts()
  }, [])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  // Add to collection handler
  const addToCollection = async (spirit: Spirit) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('Please sign in to add spirits to your collection')
      return
    }

    // Get or create collection
    let { data: collection } = await supabase
      .from('bv_collections')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', 'My Collection')
      .single()

    if (!collection) {
      const { data: newCollection } = await supabase
        .from('bv_collections')
        .insert({ user_id: user.id, name: 'My Collection', is_public: false })
        .select('id')
        .single()
      collection = newCollection
    }

    if (collection) {
      const { error } = await supabase
        .from('bv_collection_items')
        .insert({
          collection_id: collection.id,
          spirit_id: spirit.id,
          quantity: 1,
          purchase_price: spirit.msrp,
        })

      if (error) {
        if (error.code === '23505') {
          alert('This spirit is already in your collection!')
        } else {
          alert('Error adding to collection')
        }
      } else {
        alert(`Added ${spirit.name} to your collection!`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900">
      {/* Header */}
      <div className="bg-stone-900/80 border-b border-amber-600/30 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-amber-300 hover:text-amber-200 flex items-center gap-2">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-white">🥃 Browse Spirits</h1>
            <Link href="/collection" className="text-amber-300 hover:text-amber-200">
              My Collection
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Category Pills - Horizontal Scroll */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
                {categoryCounts[cat.id] !== undefined && (
                  <span className="ml-2 text-xs opacity-75">
                    ({categoryCounts[cat.id]})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Sort Row */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, brand, or distillery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-stone-800 border border-amber-600/30 rounded-xl text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-stone-800 border border-amber-600/30 rounded-xl text-white focus:outline-none focus:border-amber-500"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-stone-400">
          Showing {spirits.length} of {totalCount} spirits
          {selectedCategory !== 'all' && ` in ${CATEGORIES.find(c => c.id === selectedCategory)?.name}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin text-5xl mb-4">🥃</div>
            <p className="text-stone-400">Loading spirits...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-xl p-6 text-center">
            <p className="text-red-300 mb-4">{error}</p>
            <button 
              onClick={fetchSpirits}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && spirits.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">😔</div>
            <p className="text-xl text-stone-400">No spirits found</p>
            <p className="text-stone-500 mt-2">Try a different search or category</p>
          </div>
        )}

        {/* Spirits Grid */}
        {!loading && !error && spirits.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {spirits.map((spirit) => (
              <div
                key={spirit.id}
                className="bg-stone-800/50 border border-amber-600/20 rounded-xl overflow-hidden hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer group"
                onClick={() => {
                  setSelectedSpirit(spirit)
                  setShowModal(true)
                }}
              >
                {/* Image Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-stone-700 to-stone-800 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">
                  {spirit.image_url ? (
                    <img src={spirit.image_url} alt={spirit.name} className="w-full h-full object-cover" />
                  ) : (
                    '🥃'
                  )}
                </div>
                
                {/* Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                    {spirit.name}
                  </h3>
                  <p className="text-stone-400 text-xs mb-2">{spirit.brand}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-xs ${RARITY_COLORS[spirit.rarity] || 'bg-gray-500'}`}>
                      {spirit.rarity?.replace('_', ' ')}
                    </span>
                    {spirit.msrp && (
                      <span className="text-amber-400 text-sm font-semibold">
                        ${spirit.msrp}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-stone-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-700"
            >
              ← Prev
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg ${
                      page === pageNum
                        ? 'bg-amber-600 text-white'
                        : 'bg-stone-800 hover:bg-stone-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-stone-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-700"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Spirit Detail Modal */}
      {showModal && selectedSpirit && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-stone-900 border border-amber-600/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedSpirit.name}</h2>
                  <p className="text-amber-400">{selectedSpirit.brand}</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-stone-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Image */}
              <div className="aspect-video bg-stone-800 rounded-xl mb-6 flex items-center justify-center text-8xl">
                {selectedSpirit.image_url ? (
                  <img src={selectedSpirit.image_url} alt={selectedSpirit.name} className="w-full h-full object-contain" />
                ) : (
                  '🥃'
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-stone-800 rounded-lg p-3">
                  <p className="text-stone-400 text-xs">Category</p>
                  <p className="text-white font-semibold capitalize">{selectedSpirit.category}</p>
                </div>
                <div className="bg-stone-800 rounded-lg p-3">
                  <p className="text-stone-400 text-xs">Subcategory</p>
                  <p className="text-white font-semibold">{selectedSpirit.subcategory || '-'}</p>
                </div>
                <div className="bg-stone-800 rounded-lg p-3">
                  <p className="text-stone-400 text-xs">ABV / Proof</p>
                  <p className="text-white font-semibold">
                    {selectedSpirit.abv ? `${selectedSpirit.abv}% / ${selectedSpirit.proof}°` : '-'}
                  </p>
                </div>
                <div className="bg-stone-800 rounded-lg p-3">
                  <p className="text-stone-400 text-xs">MSRP</p>
                  <p className="text-amber-400 font-bold text-xl">
                    {selectedSpirit.msrp ? `$${selectedSpirit.msrp}` : '-'}
                  </p>
                </div>
                <div className="bg-stone-800 rounded-lg p-3">
                  <p className="text-stone-400 text-xs">Country / Region</p>
                  <p className="text-white font-semibold">
                    {selectedSpirit.country || '-'} {selectedSpirit.region ? `/ ${selectedSpirit.region}` : ''}
                  </p>
                </div>
                <div className="bg-stone-800 rounded-lg p-3">
                  <p className="text-stone-400 text-xs">Distillery</p>
                  <p className="text-white font-semibold">{selectedSpirit.distillery || '-'}</p>
                </div>
              </div>

              {/* Rarity & Status */}
              <div className="flex gap-2 mb-6">
                <span className={`px-3 py-1 rounded-full ${RARITY_COLORS[selectedSpirit.rarity] || 'bg-gray-500'}`}>
                  {selectedSpirit.rarity?.replace('_', ' ')}
                </span>
                {selectedSpirit.is_allocated && (
                  <span className="px-3 py-1 rounded-full bg-red-600">
                    Allocated
                  </span>
                )}
                {selectedSpirit.is_discontinued && (
                  <span className="px-3 py-1 rounded-full bg-stone-600">
                    Discontinued
                  </span>
                )}
              </div>

              {/* Description */}
              {selectedSpirit.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-stone-300">{selectedSpirit.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => addToCollection(selectedSpirit)}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 px-6 py-3 rounded-xl font-semibold"
                >
                  ➕ Add to Collection
                </button>
                <button
                  className="flex-1 bg-stone-700 hover:bg-stone-600 px-6 py-3 rounded-xl font-semibold"
                >
                  ❤️ Add to Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
