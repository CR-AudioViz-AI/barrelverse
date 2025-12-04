'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Barrel {
  id: string
  name: string
  distillery: string
  spiritType: 'bourbon' | 'rye' | 'scotch' | 'rum' | 'tequila' | 'other'
  barrelType: string
  charLevel?: string
  size: number // gallons
  fillDate: string
  targetDate: string
  currentAge: number // days
  location: string
  rickhouse?: string
  floorLevel?: number
  temperature?: number
  humidity?: number
  angelShare: number // percentage lost
  estimatedYield: number // bottles
  purchasePrice: number
  estimatedValue: number
  status: 'aging' | 'ready' | 'bottled' | 'sold'
  updates: BarrelUpdate[]
  photos: BarrelPhoto[]
  tastingNotes: BarrelTasting[]
  isPublic: boolean
  followers: number
}

interface BarrelUpdate {
  id: string
  date: string
  type: 'check' | 'sample' | 'photo' | 'milestone' | 'weather' | 'move'
  title: string
  description: string
  data?: {
    temperature?: number
    humidity?: number
    angelShare?: number
    color?: string
  }
}

interface BarrelPhoto {
  id: string
  url: string
  caption: string
  date: string
}

interface BarrelTasting {
  id: string
  date: string
  age: number
  rating: number
  nose: string[]
  palate: string[]
  finish: string[]
  notes: string
  readyToBow: boolean
}

const sampleBarrels: Barrel[] = [
  {
    id: '1',
    name: 'Henderson Family Reserve #1',
    distillery: 'Buffalo Trace',
    spiritType: 'bourbon',
    barrelType: 'New American Oak',
    charLevel: '#4 Alligator Char',
    size: 53,
    fillDate: '2020-06-15',
    targetDate: '2028-06-15',
    currentAge: 1267,
    location: 'Warehouse H',
    rickhouse: 'Rickhouse H',
    floorLevel: 4,
    temperature: 72,
    humidity: 65,
    angelShare: 12.5,
    estimatedYield: 185,
    purchasePrice: 12500,
    estimatedValue: 45000,
    status: 'aging',
    isPublic: true,
    followers: 47,
    updates: [
      { id: '1', date: '2024-11-15', type: 'sample', title: 'Fall Sample Pull', description: 'Pulled 2oz sample for tasting. Color is developing beautifully - deep amber with copper highlights.', data: { temperature: 68, humidity: 62 } },
      { id: '2', date: '2024-09-01', type: 'weather', title: 'Heat Wave Impact', description: 'Kentucky experienced record temperatures. Barrel expansion should accelerate aging.', data: { temperature: 95 } },
      { id: '3', date: '2024-06-15', type: 'milestone', title: '4 Year Anniversary', description: 'Barrel has officially reached 4 years of age. Planning sample pull for evaluation.', data: { angelShare: 12.5 } },
    ],
    photos: [
      { id: '1', url: '', caption: 'Barrel #1 in Rickhouse H', date: '2024-06-15' },
      { id: '2', url: '', caption: 'Sample pull - beautiful color', date: '2024-11-15' },
    ],
    tastingNotes: [
      { id: '1', date: '2024-11-15', age: 1614, rating: 88, nose: ['Caramel', 'Vanilla', 'Oak', 'Cherry'], palate: ['Honey', 'Baking Spices', 'Toffee'], finish: ['Long', 'Warm', 'Oak'], notes: 'Developing nicely. Another 2-3 years should bring out more complexity.', readyToBow: false },
    ],
  },
  {
    id: '2',
    name: 'Single Barrel Pick #42',
    distillery: 'Four Roses',
    spiritType: 'bourbon',
    barrelType: 'New American Oak',
    charLevel: '#3 Char',
    size: 53,
    fillDate: '2017-03-22',
    targetDate: '2024-12-15',
    currentAge: 2813,
    location: 'Warehouse W',
    rickhouse: 'Warehouse W',
    floorLevel: 6,
    temperature: 70,
    humidity: 60,
    angelShare: 18.2,
    estimatedYield: 162,
    purchasePrice: 9800,
    estimatedValue: 28000,
    status: 'ready',
    isPublic: true,
    followers: 89,
    updates: [
      { id: '1', date: '2024-12-01', type: 'milestone', title: 'Ready for Bottling!', description: 'After 7+ years, this barrel is ready. Scheduling bottling for mid-December.', data: {} },
    ],
    photos: [],
    tastingNotes: [
      { id: '1', date: '2024-12-01', age: 2810, rating: 94, nose: ['Rich Oak', 'Dark Fruit', 'Leather', 'Tobacco'], palate: ['Complex Spices', 'Dark Chocolate', 'Dried Cherry'], finish: ['Very Long', 'Warming', 'Lingering Spice'], notes: 'This is exceptional. Time to bottle before we lose more to the angels.', readyToBow: true },
    ],
  },
]

const spiritThemes = {
  bourbon: { bg: 'from-amber-950 via-amber-900 to-stone-900', accent: 'amber', icon: '🥃' },
  rye: { bg: 'from-orange-950 via-orange-900 to-stone-900', accent: 'orange', icon: '🌾' },
  scotch: { bg: 'from-stone-900 via-slate-800 to-stone-900', accent: 'slate', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  rum: { bg: 'from-amber-900 via-yellow-900 to-stone-900', accent: 'yellow', icon: '🍹' },
  tequila: { bg: 'from-lime-950 via-green-900 to-stone-900', accent: 'lime', icon: '🌵' },
  other: { bg: 'from-purple-950 via-purple-900 to-stone-900', accent: 'purple', icon: '🍶' },
}

export default function BarrelTrackerPage() {
  const [barrels, setBarrels] = useState<Barrel[]>(sampleBarrels)
  const [selectedBarrel, setSelectedBarrel] = useState<Barrel | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'tastings' | 'photos'>('overview')
  const [isAddingUpdate, setIsAddingUpdate] = useState(false)
  const [newUpdate, setNewUpdate] = useState({ type: 'check' as const, title: '', description: '' })

  const calculateProgress = (barrel: Barrel) => {
    const start = new Date(barrel.fillDate).getTime()
    const target = new Date(barrel.targetDate).getTime()
    const now = Date.now()
    return Math.min(100, Math.max(0, ((now - start) / (target - start)) * 100))
  }

  const formatAge = (days: number) => {
    const years = Math.floor(days / 365)
    const months = Math.floor((days % 365) / 30)
    const remainingDays = days % 30
    if (years > 0) return `${years}y ${months}m ${remainingDays}d`
    if (months > 0) return `${months}m ${remainingDays}d`
    return `${remainingDays} days`
  }

  const addUpdate = (barrelId: string) => {
    if (!newUpdate.title || !newUpdate.description) return
    setBarrels(barrels.map(b => 
      b.id === barrelId 
        ? { 
            ...b, 
            updates: [{
              id: Date.now().toString(),
              date: new Date().toISOString().split('T')[0],
              type: newUpdate.type,
              title: newUpdate.title,
              description: newUpdate.description,
            }, ...b.updates]
          }
        : b
    ))
    setNewUpdate({ type: 'check', title: '', description: '' })
    setIsAddingUpdate(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-black text-white">
      <header className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-6">
            <Link href="/collection" className="hover:text-amber-400 transition-colors">Collection</Link>
            <Link href="/profile" className="hover:text-amber-400 transition-colors">Profile</Link>
            <Link href="/community" className="hover:text-amber-400 transition-colors">Community</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">🛢️ Barrel Tracker</h1>
            <p className="text-gray-400">Track your barrels as they age, document the journey, share with followers</p>
          </div>
          <button className="bg-amber-600 hover:bg-amber-500 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
            <span>➕</span> Add Barrel
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-stone-800/50 rounded-xl p-4 text-center border border-amber-900/20">
            <div className="text-3xl font-bold text-amber-400">{barrels.length}</div>
            <div className="text-sm text-gray-400">Active Barrels</div>
          </div>
          <div className="bg-stone-800/50 rounded-xl p-4 text-center border border-amber-900/20">
            <div className="text-3xl font-bold text-green-400">{barrels.filter(b => b.status === 'ready').length}</div>
            <div className="text-sm text-gray-400">Ready to Bottle</div>
          </div>
          <div className="bg-stone-800/50 rounded-xl p-4 text-center border border-amber-900/20">
            <div className="text-3xl font-bold text-blue-400">{barrels.reduce((a, b) => a + b.estimatedYield, 0)}</div>
            <div className="text-sm text-gray-400">Est. Bottles</div>
          </div>
          <div className="bg-stone-800/50 rounded-xl p-4 text-center border border-amber-900/20">
            <div className="text-3xl font-bold text-purple-400">${(barrels.reduce((a, b) => a + b.estimatedValue, 0) / 1000).toFixed(0)}k</div>
            <div className="text-sm text-gray-400">Est. Value</div>
          </div>
          <div className="bg-stone-800/50 rounded-xl p-4 text-center border border-amber-900/20">
            <div className="text-3xl font-bold text-red-400">{(barrels.reduce((a, b) => a + b.angelShare, 0) / barrels.length).toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Avg Angel Share</div>
          </div>
        </div>

        {/* Barrel Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {barrels.map((barrel) => {
            const theme = spiritThemes[barrel.spiritType]
            const progress = calculateProgress(barrel)
            
            return (
              <div
                key={barrel.id}
                onClick={() => setSelectedBarrel(barrel)}
                className={`bg-gradient-to-br ${theme.bg} rounded-2xl p-6 border border-${theme.accent}-900/30 hover:border-${theme.accent}-600/50 transition-all cursor-pointer group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{theme.icon}</span>
                      <h3 className="text-xl font-bold group-hover:text-amber-400 transition-colors">{barrel.name}</h3>
                    </div>
                    <p className="text-gray-400">{barrel.distillery} • {barrel.barrelType}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    barrel.status === 'aging' ? 'bg-blue-900/50 text-blue-400' :
                    barrel.status === 'ready' ? 'bg-green-900/50 text-green-400' :
                    barrel.status === 'bottled' ? 'bg-purple-900/50 text-purple-400' :
                    'bg-gray-900/50 text-gray-400'
                  }`}>
                    {barrel.status === 'aging' ? '🕐 Aging' : barrel.status === 'ready' ? '✅ Ready' : barrel.status === 'bottled' ? '🍾 Bottled' : '💰 Sold'}
                  </span>
                </div>

                {/* Age Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Age: {formatAge(barrel.currentAge)}</span>
                    <span className="text-amber-400">{progress.toFixed(0)}% to target</span>
                  </div>
                  <div className="h-3 bg-stone-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Filled: {new Date(barrel.fillDate).toLocaleDateString()}</span>
                    <span>Target: {new Date(barrel.targetDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="bg-black/30 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-amber-400">{barrel.size}gal</div>
                    <div className="text-xs text-gray-500">Size</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-red-400">{barrel.angelShare}%</div>
                    <div className="text-xs text-gray-500">Lost</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-green-400">~{barrel.estimatedYield}</div>
                    <div className="text-xs text-gray-500">Bottles</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-purple-400">${(barrel.estimatedValue / 1000).toFixed(0)}k</div>
                    <div className="text-xs text-gray-500">Value</div>
                  </div>
                </div>

                {/* Location & Conditions */}
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span>📍 {barrel.location}</span>
                  {barrel.floorLevel && <span>🏗️ Floor {barrel.floorLevel}</span>}
                  {barrel.temperature && <span>🌡️ {barrel.temperature}°F</span>}
                </div>

                {/* Recent Update */}
                {barrel.updates[0] && (
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">{barrel.updates[0].date}</span>
                      <span className="text-xs bg-amber-900/50 px-2 py-0.5 rounded">{barrel.updates[0].type}</span>
                    </div>
                    <p className="text-sm font-semibold">{barrel.updates[0].title}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{barrel.updates[0].description}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-amber-900/30">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>👥 {barrel.followers} followers</span>
                    {barrel.isPublic && <span className="text-green-400">🌍 Public</span>}
                  </div>
                  <span className="text-amber-400 text-sm">View Details →</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Barrel CTA */}
        <div className="mt-6">
          <button className="w-full py-6 border-2 border-dashed border-amber-900/30 rounded-2xl text-amber-400 hover:border-amber-600 hover:bg-amber-900/10 transition-colors text-lg">
            🛢️ Add New Barrel
          </button>
        </div>

        {/* Barrel Detail Modal */}
        {selectedBarrel && (
          <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-4 py-8">
              <div className="bg-stone-900 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className={`bg-gradient-to-r ${spiritThemes[selectedBarrel.spiritType].bg} p-6`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">{spiritThemes[selectedBarrel.spiritType].icon}</span>
                        <div>
                          <h2 className="text-2xl font-bold">{selectedBarrel.name}</h2>
                          <p className="text-gray-300">{selectedBarrel.distillery}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="bg-black/30 px-3 py-1 rounded-full">{selectedBarrel.barrelType}</span>
                        {selectedBarrel.charLevel && <span className="bg-black/30 px-3 py-1 rounded-full">{selectedBarrel.charLevel}</span>}
                        <span className="bg-black/30 px-3 py-1 rounded-full">{selectedBarrel.size} gal</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedBarrel(null)} className="text-gray-400 hover:text-white text-3xl">×</button>
                  </div>

                  {/* Age Display */}
                  <div className="mt-6 text-center">
                    <div className="text-5xl font-bold text-amber-400 mb-2">{formatAge(selectedBarrel.currentAge)}</div>
                    <div className="text-gray-400">Age</div>
                    <div className="mt-4 h-4 bg-black/30 rounded-full overflow-hidden max-w-md mx-auto">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                        style={{ width: `${calculateProgress(selectedBarrel)}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                      {calculateProgress(selectedBarrel).toFixed(0)}% to target age
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-amber-900/30">
                  {(['overview', 'timeline', 'tastings', 'photos'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-4 font-semibold capitalize transition-colors ${
                        activeTab === tab ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab === 'overview' ? '📊' : tab === 'timeline' ? '📅' : tab === 'tastings' ? '🥃' : '📸'} {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-bold text-lg mb-3">Barrel Details</h3>
                        <div className="bg-stone-800/50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Location</span>
                            <span>{selectedBarrel.location}</span>
                          </div>
                          {selectedBarrel.rickhouse && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Rickhouse</span>
                              <span>{selectedBarrel.rickhouse}</span>
                            </div>
                          )}
                          {selectedBarrel.floorLevel && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Floor Level</span>
                              <span>Level {selectedBarrel.floorLevel}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-400">Fill Date</span>
                            <span>{new Date(selectedBarrel.fillDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Target Date</span>
                            <span>{new Date(selectedBarrel.targetDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-bold text-lg mb-3">Current Conditions</h3>
                        <div className="bg-stone-800/50 rounded-lg p-4 space-y-3">
                          {selectedBarrel.temperature && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Temperature</span>
                              <span className="text-amber-400">{selectedBarrel.temperature}°F</span>
                            </div>
                          )}
                          {selectedBarrel.humidity && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Humidity</span>
                              <span className="text-blue-400">{selectedBarrel.humidity}%</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-400">Angel's Share</span>
                            <span className="text-red-400">{selectedBarrel.angelShare}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Est. Yield</span>
                            <span className="text-green-400">~{selectedBarrel.estimatedYield} bottles</span>
                          </div>
                        </div>

                        <h3 className="font-bold text-lg mb-3">Value</h3>
                        <div className="bg-stone-800/50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Purchase Price</span>
                            <span>${selectedBarrel.purchasePrice.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Est. Value</span>
                            <span className="text-green-400 font-bold">${selectedBarrel.estimatedValue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">ROI</span>
                            <span className="text-green-400">+{(((selectedBarrel.estimatedValue - selectedBarrel.purchasePrice) / selectedBarrel.purchasePrice) * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'timeline' && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">Updates Timeline</h3>
                        <button 
                          onClick={() => setIsAddingUpdate(true)}
                          className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                          + Add Update
                        </button>
                      </div>

                      {isAddingUpdate && (
                        <div className="bg-stone-800/50 rounded-lg p-4 mb-6">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <select
                              value={newUpdate.type}
                              onChange={(e) => setNewUpdate({ ...newUpdate, type: e.target.value as any })}
                              className="bg-stone-700 rounded-lg px-3 py-2"
                            >
                              <option value="check">🔍 Check</option>
                              <option value="sample">🥃 Sample</option>
                              <option value="photo">📸 Photo</option>
                              <option value="milestone">🎉 Milestone</option>
                              <option value="weather">🌡️ Weather</option>
                              <option value="move">🚚 Move</option>
                            </select>
                            <input
                              type="text"
                              value={newUpdate.title}
                              onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                              placeholder="Update title"
                              className="bg-stone-700 rounded-lg px-3 py-2"
                            />
                          </div>
                          <textarea
                            value={newUpdate.description}
                            onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
                            placeholder="Describe what happened..."
                            rows={3}
                            className="w-full bg-stone-700 rounded-lg px-3 py-2 mb-4"
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={() => addUpdate(selectedBarrel.id)}
                              className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg font-semibold"
                            >
                              Save Update
                            </button>
                            <button 
                              onClick={() => setIsAddingUpdate(false)}
                              className="bg-stone-700 px-4 py-2 rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {selectedBarrel.updates.map((update, i) => (
                          <div key={update.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-10 h-10 rounded-full bg-amber-900/50 flex items-center justify-center">
                                {update.type === 'check' ? '🔍' : update.type === 'sample' ? '🥃' : update.type === 'photo' ? '📸' : update.type === 'milestone' ? '🎉' : update.type === 'weather' ? '🌡️' : '🚚'}
                              </div>
                              {i < selectedBarrel.updates.length - 1 && (
                                <div className="w-0.5 flex-1 bg-amber-900/30 my-2" />
                              )}
                            </div>
                            <div className="flex-1 pb-6">
                              <div className="text-sm text-gray-500 mb-1">{update.date}</div>
                              <h4 className="font-semibold">{update.title}</h4>
                              <p className="text-gray-400 text-sm">{update.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'tastings' && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">Tasting Notes</h3>
                        <button className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-semibold">
                          + Add Tasting
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {selectedBarrel.tastingNotes.map((tasting) => (
                          <div key={tasting.id} className="bg-stone-800/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <span className="text-gray-400">{tasting.date}</span>
                                <span className="mx-2">•</span>
                                <span>Age: {formatAge(tasting.age)}</span>
                              </div>
                              <div className="text-2xl font-bold text-amber-400">{tasting.rating}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-3 mb-3">
                              <div>
                                <div className="text-sm text-gray-400 mb-1">Nose</div>
                                <div className="flex flex-wrap gap-1">
                                  {tasting.nose.map(n => (
                                    <span key={n} className="bg-amber-900/30 px-2 py-0.5 rounded text-xs">{n}</span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-400 mb-1">Palate</div>
                                <div className="flex flex-wrap gap-1">
                                  {tasting.palate.map(p => (
                                    <span key={p} className="bg-amber-900/30 px-2 py-0.5 rounded text-xs">{p}</span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-400 mb-1">Finish</div>
                                <div className="flex flex-wrap gap-1">
                                  {tasting.finish.map(f => (
                                    <span key={f} className="bg-amber-900/30 px-2 py-0.5 rounded text-xs">{f}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-300">{tasting.notes}</p>
                            {tasting.readyToBow && (
                              <div className="mt-3 bg-green-900/30 text-green-400 px-3 py-2 rounded-lg text-sm">
                                ✅ Recommended for bottling
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'photos' && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">Photo Gallery</h3>
                        <button className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-semibold">
                          📸 Upload Photo
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedBarrel.photos.map((photo) => (
                          <div key={photo.id} className="aspect-square bg-stone-800 rounded-lg flex items-center justify-center text-6xl">
                            🛢️
                          </div>
                        ))}
                        <button className="aspect-square border-2 border-dashed border-amber-900/30 rounded-lg flex flex-col items-center justify-center text-amber-400 hover:border-amber-600 hover:bg-amber-900/10 transition-colors">
                          <span className="text-4xl mb-2">📷</span>
                          <span>Add Photo</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-amber-900/30 flex gap-4">
                  <button className="flex-1 bg-amber-600 hover:bg-amber-500 py-3 rounded-lg font-semibold">
                    📤 Share Barrel
                  </button>
                  <button className="flex-1 bg-stone-700 hover:bg-stone-600 py-3 rounded-lg font-semibold">
                    ✏️ Edit Details
                  </button>
                  {selectedBarrel.status === 'ready' && (
                    <button className="flex-1 bg-green-600 hover:bg-green-500 py-3 rounded-lg font-semibold">
                      🍾 Schedule Bottling
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
