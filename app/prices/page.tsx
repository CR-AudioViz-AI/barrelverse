'use client'

import { useState } from 'react'
import Link from 'next/link'

// Mock price data
const PRICE_DATA = [
  {
    id: 1,
    name: 'Blanton\'s Original',
    category: 'Bourbon',
    msrp: 65,
    avgPrice: 115,
    lowestRecent: 89,
    highestRecent: 175,
    trend: 'stable',
    trendPercent: 2,
    availability: 'Allocated',
    deals: [
      { store: 'Total Wine (Louisville)', price: 89, date: '2 hours ago', distance: '12 mi', verified: true },
      { store: 'Liquor Barn (Lexington)', price: 99, date: '5 hours ago', distance: '45 mi', verified: true },
      { store: 'Online - Caskers', price: 149, date: '1 day ago', distance: 'Ships', verified: false }
    ]
  },
  {
    id: 2,
    name: 'Buffalo Trace',
    category: 'Bourbon',
    msrp: 28,
    avgPrice: 32,
    lowestRecent: 26,
    highestRecent: 45,
    trend: 'up',
    trendPercent: 5,
    availability: 'Moderate',
    deals: [
      { store: 'Costco (Nationwide)', price: 26, date: '3 hours ago', distance: 'Various', verified: true },
      { store: 'Kroger (Cincinnati)', price: 28, date: '1 day ago', distance: '95 mi', verified: true }
    ]
  },
  {
    id: 3,
    name: 'Pappy Van Winkle 15 Year',
    category: 'Bourbon',
    msrp: 119,
    avgPrice: 1850,
    lowestRecent: 1200,
    highestRecent: 2500,
    trend: 'up',
    trendPercent: 12,
    availability: 'Unicorn',
    deals: [
      { store: 'Secondary Market', price: 1450, date: '1 week ago', distance: 'N/A', verified: false }
    ]
  },
  {
    id: 4,
    name: 'Eagle Rare 10 Year',
    category: 'Bourbon',
    msrp: 35,
    avgPrice: 48,
    lowestRecent: 35,
    highestRecent: 75,
    trend: 'stable',
    trendPercent: 0,
    availability: 'Allocated',
    deals: [
      { store: 'ABC Fine Wine (FL)', price: 35, date: '4 hours ago', distance: '8 mi', verified: true },
      { store: 'Total Wine (Tampa)', price: 45, date: '6 hours ago', distance: '22 mi', verified: true }
    ]
  },
  {
    id: 5,
    name: 'Weller Special Reserve',
    category: 'Bourbon',
    msrp: 30,
    avgPrice: 55,
    lowestRecent: 30,
    highestRecent: 85,
    trend: 'up',
    trendPercent: 8,
    availability: 'Allocated',
    deals: [
      { store: 'Ohio State Stores', price: 30, date: '2 days ago', distance: '180 mi', verified: true }
    ]
  }
]

const PRICE_ALERTS = [
  { spirit: 'Blanton\'s Original', targetPrice: 75, currentBest: 89, status: 'close' },
  { spirit: 'E.H. Taylor Small Batch', targetPrice: 45, currentBest: 65, status: 'watching' },
  { spirit: 'Weller 12 Year', targetPrice: 40, currentBest: 120, status: 'far' }
]

const RECENT_DROPS = [
  { spirit: 'Buffalo Trace', store: 'Costco', price: 26, time: '2h ago' },
  { spirit: 'Blanton\'s', store: 'Total Wine Louisville', price: 89, time: '3h ago' },
  { spirit: 'Eagle Rare', store: 'ABC Fine Wine', price: 35, time: '4h ago' },
  { spirit: 'Weller SR', store: 'Ohio State', price: 30, time: '2d ago' }
]

export default function PriceTrackerPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'deal' | 'price' | 'name'>('deal')
  const [selectedSpirit, setSelectedSpirit] = useState<typeof PRICE_DATA[0] | null>(null)
  const [showAlertModal, setShowAlertModal] = useState(false)

  const filteredData = PRICE_DATA.filter(spirit =>
    spirit.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'deal') {
      // Best deal = lowest price relative to MSRP
      return (a.lowestRecent / a.msrp) - (b.lowestRecent / b.msrp)
    }
    if (sortBy === 'price') return a.lowestRecent - b.lowestRecent
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-blue-950/20 to-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-blue-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-4">
            <Link href="/collection" className="hover:text-amber-400 transition-colors">Collection</Link>
            <Link href="/spirits" className="hover:text-amber-400 transition-colors">Spirits</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-4">
            💰 DEAL FINDER
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Find the Best <span className="text-blue-400">Prices</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Track prices, get alerts on deals, and never overpay for your favorite spirits again.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search spirits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'deal' | 'price' | 'name')}
            className="bg-stone-800 rounded-lg px-4 py-3"
          >
            <option value="deal">Best Deal %</option>
            <option value="price">Lowest Price</option>
            <option value="name">Name A-Z</option>
          </select>
          <button
            onClick={() => setShowAlertModal(true)}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            🔔 My Alerts
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Price List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredData.map((spirit) => {
              const dealPercent = Math.round(((spirit.avgPrice - spirit.lowestRecent) / spirit.avgPrice) * 100)
              const vsmsrp = Math.round(((spirit.lowestRecent - spirit.msrp) / spirit.msrp) * 100)
              
              return (
                <div
                  key={spirit.id}
                  className={`bg-stone-800/50 rounded-xl border transition-all cursor-pointer ${
                    selectedSpirit?.id === spirit.id
                      ? 'border-blue-500 ring-2 ring-blue-500/30'
                      : 'border-stone-700/50 hover:border-blue-500/50'
                  }`}
                  onClick={() => setSelectedSpirit(selectedSpirit?.id === spirit.id ? null : spirit)}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-900/50 to-stone-800 rounded-lg flex items-center justify-center text-3xl">
                        🥃
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{spirit.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            spirit.availability === 'Unicorn' ? 'bg-purple-600' :
                            spirit.availability === 'Allocated' ? 'bg-amber-600' :
                            spirit.availability === 'Moderate' ? 'bg-blue-600' : 'bg-green-600'
                          }`}>
                            {spirit.availability}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          MSRP: ${spirit.msrp} • Avg: ${spirit.avgPrice} • 
                          <span className={spirit.trend === 'up' ? 'text-green-400' : spirit.trend === 'down' ? 'text-red-400' : 'text-gray-400'}>
                            {' '}{spirit.trend === 'up' ? '↑' : spirit.trend === 'down' ? '↓' : '→'} {spirit.trendPercent}%
                          </span>
                        </p>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {dealPercent > 10 && (
                            <span className="bg-green-600 text-xs px-2 py-1 rounded font-bold animate-pulse">
                              {dealPercent}% OFF
                            </span>
                          )}
                          <p className="text-2xl font-bold text-blue-400">${spirit.lowestRecent}</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {vsmsrp > 0 ? `+${vsmsrp}% vs MSRP` : `${vsmsrp}% vs MSRP`}
                        </p>
                        <p className="text-xs text-gray-400">{spirit.deals.length} deals found</p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Deals */}
                  {selectedSpirit?.id === spirit.id && (
                    <div className="border-t border-stone-700/50 p-4 bg-black/30">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <span>📍</span> Where to Buy
                      </h4>
                      <div className="space-y-2">
                        {spirit.deals.map((deal, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between bg-stone-800/50 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-3">
                              {deal.verified && (
                                <span className="text-green-400" title="Verified">✓</span>
                              )}
                              <div>
                                <p className="font-medium">{deal.store}</p>
                                <p className="text-xs text-gray-500">{deal.distance} • {deal.date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-green-400">${deal.price}</p>
                              {deal.price <= spirit.msrp && (
                                <span className="text-xs text-green-400">AT MSRP!</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button className="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded-lg text-sm font-semibold transition-colors">
                          🔔 Set Alert
                        </button>
                        <button className="flex-1 bg-stone-700 hover:bg-stone-600 py-2 rounded-lg text-sm font-semibold transition-colors">
                          📊 Price History
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Drops */}
            <div className="bg-gradient-to-br from-green-900/30 to-stone-800/30 rounded-xl p-6 border border-green-500/30">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="animate-pulse">🔥</span> Recent Drops
              </h3>
              <div className="space-y-3">
                {RECENT_DROPS.map((drop, i) => (
                  <div key={i} className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                    <div>
                      <p className="font-medium text-sm">{drop.spirit}</p>
                      <p className="text-xs text-gray-500">{drop.store}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">${drop.price}</p>
                      <p className="text-xs text-gray-500">{drop.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Alerts */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span>🔔</span> My Alerts
              </h3>
              <div className="space-y-3">
                {PRICE_ALERTS.map((alert, i) => (
                  <div key={i} className="flex items-center justify-between bg-stone-700/30 rounded-lg p-3">
                    <div>
                      <p className="font-medium text-sm">{alert.spirit}</p>
                      <p className="text-xs text-gray-500">Target: ${alert.targetPrice}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        alert.status === 'close' ? 'text-yellow-400' :
                        alert.status === 'watching' ? 'text-blue-400' : 'text-gray-500'
                      }`}>
                        ${alert.currentBest}
                      </p>
                      <span className={`text-xs ${
                        alert.status === 'close' ? 'text-yellow-400' :
                        alert.status === 'watching' ? 'text-blue-400' : 'text-gray-500'
                      }`}>
                        {alert.status === 'close' ? '🔥 Close!' : alert.status === 'watching' ? '👀 Watching' : '⏳ Far'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowAlertModal(true)}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-500 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                + Add Alert
              </button>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-amber-900/30 to-stone-800/30 rounded-xl p-6 border border-amber-500/30">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span>💡</span> Hunting Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Check Costco for Buffalo Trace products at MSRP</li>
                <li>• Ohio state stores get Weller allocations monthly</li>
                <li>• Total Wine restocks Blanton's on Tuesdays</li>
                <li>• Call stores 2 weeks before Christmas for BTAC drops</li>
                <li>• Build relationships with local store managers</li>
              </ul>
            </div>

            {/* Store Locator */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50 text-center">
              <p className="text-3xl mb-2">🗺️</p>
              <h3 className="font-bold mb-2">Store Locator</h3>
              <p className="text-sm text-gray-400 mb-4">
                Find stores near you with allocated bottles in stock
              </p>
              <Link
                href="/stores"
                className="block bg-amber-600 hover:bg-amber-500 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Find Stores
              </Link>
            </div>
          </div>
        </div>

        {/* Price Comparison Chart */}
        <div className="mt-12 bg-stone-800/50 rounded-2xl p-6 border border-stone-700/50">
          <h2 className="text-xl font-bold mb-6">📊 Market Price Trends</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {PRICE_DATA.slice(0, 5).map((spirit) => (
              <div key={spirit.id} className="text-center">
                <p className="font-medium text-sm mb-2">{spirit.name.split(' ')[0]}</p>
                <div className="h-32 flex items-end justify-center gap-1">
                  <div className="w-6 bg-stone-600 rounded-t" style={{ height: `${(spirit.msrp / spirit.avgPrice) * 100}%` }} title="MSRP" />
                  <div className="w-6 bg-blue-600 rounded-t" style={{ height: `${(spirit.lowestRecent / spirit.avgPrice) * 100}%` }} title="Best Price" />
                  <div className="w-6 bg-amber-600 rounded-t" style={{ height: '100%' }} title="Avg" />
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <span className="inline-block w-3 h-3 bg-stone-600 mr-1" />MSRP
                  <span className="inline-block w-3 h-3 bg-blue-600 mx-1" />Best
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-stone-800 rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">🔔 Set Price Alert</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Spirit</label>
                <select className="w-full bg-stone-700 rounded-lg px-4 py-3">
                  {PRICE_DATA.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Target Price</label>
                <input
                  type="number"
                  placeholder="$50"
                  className="w-full bg-stone-700 rounded-lg px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Notify via</label>
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 py-2 rounded-lg text-sm">Email</button>
                  <button className="flex-1 bg-stone-700 py-2 rounded-lg text-sm">Push</button>
                  <button className="flex-1 bg-stone-700 py-2 rounded-lg text-sm">SMS</button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAlertModal(false)}
                className="flex-1 bg-stone-700 hover:bg-stone-600 py-3 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAlertModal(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-semibold"
              >
                Create Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
