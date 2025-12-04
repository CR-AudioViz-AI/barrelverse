'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

// Museum Wings - Each alcohol type has its own wing
const MUSEUM_WINGS = {
  bourbon: {
    name: 'The Bourbon Heritage Wing',
    icon: '🥃',
    color: 'amber',
    gradient: 'from-amber-950 via-amber-900 to-stone-900',
    description: 'Journey through 200+ years of American whiskey history',
    atmosphere: 'Rich oak panels, copper stills, Kentucky limestone',
    exhibits: [
      {
        id: 'origins',
        name: 'Origins of Bourbon',
        era: '1780-1820',
        description: 'How Kentucky farmers turned surplus corn into liquid gold',
        artifacts: [
          { type: 'image', title: 'Early Pot Still', year: 1789, description: 'Replica of a colonial-era copper pot still' },
          { type: 'document', title: 'First Bourbon Receipt', year: 1821, description: 'Earliest known use of the term "Bourbon Whiskey"' },
          { type: 'bottle', title: 'Clay Jug Replica', year: 1800, description: 'How bourbon was originally sold' }
        ],
        story: 'In the late 1700s, settlers in Kentucky discovered that the limestone-filtered water and abundant corn made for exceptional whiskey. Baptist minister Elijah Craig is often credited with aging whiskey in charred oak barrels, though historians debate this claim...'
      },
      {
        id: 'golden-age',
        name: 'The Golden Age',
        era: '1870-1919',
        description: 'When bourbon became America\'s spirit',
        artifacts: [
          { type: 'bottle', title: 'Pre-Prohibition Old Forester', year: 1910, description: 'One of the few brands to survive Prohibition' },
          { type: 'photo', title: 'Louisville Whiskey Row', year: 1905, description: 'Historic photograph of Main Street distilleries' },
          { type: 'label', title: 'Bottled in Bond Seal', year: 1897, description: 'The first consumer protection law for spirits' }
        ],
        story: 'By 1900, Kentucky had over 300 distilleries producing millions of gallons annually. The Bottled-in-Bond Act of 1897 established quality standards that still exist today...'
      },
      {
        id: 'prohibition',
        name: 'Surviving Prohibition',
        era: '1920-1933',
        description: 'The dark years that nearly destroyed bourbon',
        artifacts: [
          { type: 'document', title: 'Medicinal Whiskey Prescription', year: 1925, description: 'How some distilleries legally survived' },
          { type: 'photo', title: 'Agents Destroying Barrels', year: 1922, description: 'Federal agents destroying illegal whiskey' },
          { type: 'bottle', title: 'Brown-Forman Medicinal', year: 1928, description: 'Legal medicinal whiskey bottle' }
        ],
        story: 'When Prohibition began in 1920, over 300 Kentucky distilleries were forced to close. Only six received permits to sell "medicinal whiskey" - and their survival shaped the modern bourbon industry...'
      },
      {
        id: 'renaissance',
        name: 'The Modern Renaissance',
        era: '1990-Present',
        description: 'From forgotten spirit to global phenomenon',
        artifacts: [
          { type: 'bottle', title: 'First Pappy Van Winkle 23', year: 1994, description: 'The bottle that started the bourbon craze' },
          { type: 'photo', title: 'Craft Distillery Boom', year: 2015, description: 'New distilleries opening across America' },
          { type: 'award', title: 'World Whisky of the Year', year: 2023, description: 'Bourbon\'s global recognition' }
        ],
        story: 'In 1990, bourbon was considered your grandfather\'s drink. Then something changed. Small batch releases, limited editions, and a new appreciation for craft transformed bourbon into the most sought-after spirit in the world...'
      }
    ]
  },
  scotch: {
    name: 'The Scotch Whisky Gallery',
    icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    color: 'slate',
    gradient: 'from-slate-900 via-stone-800 to-slate-950',
    description: 'Five centuries of Scotland\'s water of life',
    atmosphere: 'Stone walls, peat smoke, Highland mist',
    exhibits: [
      {
        id: 'ancient',
        name: 'The Ancient Art',
        era: '1494-1700',
        description: 'From monastic medicine to Scottish tradition',
        artifacts: [
          { type: 'document', title: 'Exchequer Rolls of 1494', year: 1494, description: 'First written record of Scotch whisky' },
          { type: 'image', title: 'Monastery Still', year: 1500, description: 'How monks distilled aqua vitae' }
        ],
        story: 'The first written record of Scotch whisky appears in 1494: "Eight bolls of malt to Friar John Cor wherewith to make aqua vitae." The monks had been distilling for medicinal purposes for centuries before...'
      },
      {
        id: 'regions',
        name: 'The Five Regions',
        era: 'Timeless',
        description: 'How geography shapes flavor',
        artifacts: [
          { type: 'map', title: 'Scotch Whisky Regions', year: 2000, description: 'Interactive map of whisky regions' },
          { type: 'sample', title: 'Peat from Islay', year: 2023, description: 'Touch actual Islay peat' },
          { type: 'water', title: 'Highland Spring Water', year: 2023, description: 'Taste the difference' }
        ],
        story: 'Speyside\'s sweet fruit notes, Islay\'s peat smoke, Highland\'s heather honey, Lowland\'s gentle grass, and Campbeltown\'s maritime salt - each region tells a different story...'
      }
    ]
  },
  rum: {
    name: 'The Caribbean Rum Pavilion',
    icon: '🏝️',
    color: 'yellow',
    gradient: 'from-amber-900 via-yellow-900 to-stone-900',
    description: 'Sugar, slavery, and the spirit of the islands',
    atmosphere: 'Tropical breeze, sugar cane, ocean air',
    exhibits: [
      {
        id: 'triangle',
        name: 'The Triangle Trade',
        era: '1650-1800',
        description: 'Rum\'s dark origins in the slave trade',
        artifacts: [
          { type: 'map', title: 'Triangle Trade Routes', year: 1750, description: 'How rum fueled the Atlantic economy' },
          { type: 'document', title: 'Plantation Records', year: 1780, description: 'Early rum production logs' }
        ],
        story: 'Rum\'s history is inseparable from the tragedy of slavery. Sugar plantations in the Caribbean produced molasses, which was distilled into rum, which was traded for enslaved people in Africa...'
      },
      {
        id: 'navy',
        name: 'Navy Rum & Pirates',
        era: '1655-1970',
        description: 'From ship rations to pirate lore',
        artifacts: [
          { type: 'bottle', title: 'Navy Tot Bottle', year: 1965, description: 'Original Royal Navy rum ration' },
          { type: 'image', title: 'HMS Victory Rum Cask', year: 1805, description: 'Where Admiral Nelson was preserved' }
        ],
        story: 'In 1655, the British Navy replaced beer rations with rum. For over 300 years, sailors received a daily "tot" of rum - a tradition that only ended on July 31, 1970, known as Black Tot Day...'
      }
    ]
  },
  tequila: {
    name: 'The Agave Spirit Hall',
    icon: '🌵',
    color: 'lime',
    gradient: 'from-lime-950 via-green-900 to-stone-900',
    description: 'From ancient pulque to modern tequila',
    atmosphere: 'Desert sun, blue agave fields, volcanic soil',
    exhibits: [
      {
        id: 'aztec',
        name: 'Sacred Agave',
        era: 'Pre-Columbian',
        description: 'The Aztec goddess and her gift',
        artifacts: [
          { type: 'statue', title: 'Mayahuel Goddess', year: 1400, description: 'Aztec goddess of agave' },
          { type: 'vessel', title: 'Pulque Vessel', year: 1300, description: 'How ancients drank fermented agave' }
        ],
        story: 'Long before tequila, the Aztecs worshipped Mayahuel, goddess of the agave plant. They fermented the sap into pulque, a sacred drink used in religious ceremonies...'
      }
    ]
  },
  wine: {
    name: 'The Wine Cellar',
    icon: '🍷',
    color: 'rose',
    gradient: 'from-rose-950 via-red-900 to-stone-900',
    description: '8,000 years of civilization in a glass',
    atmosphere: 'Stone cellars, oak barrels, candlelight',
    exhibits: [
      {
        id: 'ancient-wine',
        name: 'Wine of the Ancients',
        era: '6000 BC - 500 AD',
        description: 'From Georgia to Rome',
        artifacts: [
          { type: 'amphora', title: 'Georgian Qvevri', year: -5000, description: 'The oldest winemaking vessels' },
          { type: 'mosaic', title: 'Roman Wine God', year: 100, description: 'Bacchus/Dionysus mosaic' }
        ],
        story: 'The oldest evidence of wine production comes from Georgia around 6000 BC. By the time of the Roman Empire, wine had become central to civilization...'
      }
    ]
  },
  beer: {
    name: 'The Brewmaster\'s Hall',
    icon: '🍺',
    color: 'yellow',
    gradient: 'from-yellow-900 via-amber-800 to-stone-900',
    description: 'The oldest alcoholic beverage in human history',
    atmosphere: 'Hop vines, copper kettles, brewery steam',
    exhibits: [
      {
        id: 'ancient-beer',
        name: 'Liquid Bread',
        era: '4000 BC - 1500 AD',
        description: 'Beer built civilization',
        artifacts: [
          { type: 'tablet', title: 'Hymn to Ninkasi', year: -1800, description: 'Sumerian beer recipe in song' },
          { type: 'vessel', title: 'Egyptian Beer Jar', year: -2500, description: 'Workers were paid in beer' }
        ],
        story: 'Beer may be why humans settled down. The need to grow grain for brewing may have sparked agriculture itself. In ancient Egypt, workers building the pyramids were paid in beer...'
      }
    ]
  }
}

// Bottle Evolution Data
const BOTTLE_EVOLUTIONS = {
  bourbon: [
    { era: '1800s', image: '🏺', name: 'Clay Jugs', description: 'Whiskey sold in ceramic containers' },
    { era: '1870s', image: '🍶', name: 'Glass Flasks', description: 'First glass bottles appear' },
    { era: '1897', image: '🥃', name: 'Bottled in Bond', description: 'Standardized 750ml bottles' },
    { era: '1950s', image: '🍾', name: 'Modern Era', description: 'Iconic bottle shapes emerge' },
    { era: '2010s', image: '✨', name: 'Craft Revolution', description: 'Unique artisan bottles' }
  ]
}

export default function MuseumPage() {
  const [currentWing, setCurrentWing] = useState<string | null>(null)
  const [currentExhibit, setCurrentExhibit] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'lobby' | 'wing' | 'exhibit'>('lobby')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)

  const enterWing = (wingId: string) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentWing(wingId)
      setViewMode('wing')
      setIsTransitioning(false)
    }, 800)
  }

  const enterExhibit = (exhibitId: string) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentExhibit(exhibitId)
      setViewMode('exhibit')
      setIsTransitioning(false)
    }, 600)
  }

  const goBack = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      if (viewMode === 'exhibit') {
        setCurrentExhibit(null)
        setViewMode('wing')
      } else if (viewMode === 'wing') {
        setCurrentWing(null)
        setViewMode('lobby')
      }
      setIsTransitioning(false)
    }, 600)
  }

  const wing = currentWing ? MUSEUM_WINGS[currentWing as keyof typeof MUSEUM_WINGS] : null
  const exhibit = wing?.exhibits.find(e => e.id === currentExhibit)

  return (
    <div className={`min-h-screen transition-all duration-1000 ${
      wing ? `bg-gradient-to-b ${wing.gradient}` : 'bg-gradient-to-b from-stone-950 via-stone-900 to-black'
    } text-white overflow-hidden`}>
      
      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center animate-pulse">
          <div className="text-4xl">🚶</div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {viewMode !== 'lobby' && (
              <button onClick={goBack} className="text-amber-400 hover:text-amber-300 transition-colors">
                ← Back
              </button>
            )}
            <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-2 rounded-full ${audioEnabled ? 'bg-amber-600' : 'bg-stone-700'}`}
              title={audioEnabled ? 'Mute narration' : 'Enable narration'}
            >
              {audioEnabled ? '🔊' : '🔇'}
            </button>
            <Link href="/spirits" className="hover:text-amber-400 transition-colors">Spirits</Link>
          </div>
        </div>
      </header>

      {/* LOBBY VIEW */}
      {viewMode === 'lobby' && (
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Grand Entrance */}
          <div className="text-center mb-16">
            <div className="text-8xl mb-6 animate-float">🏛️</div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 text-transparent bg-clip-text">
              The Virtual Spirits Museum
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Walk through centuries of history. Explore the stories, artifacts, and evolution 
              of the world's greatest spirits. An immersive journey awaits.
            </p>
          </div>

          {/* Museum Map - Wing Selection */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">Choose Your Wing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(MUSEUM_WINGS).map(([id, wing]) => (
                <button
                  key={id}
                  onClick={() => enterWing(id)}
                  className={`group relative bg-gradient-to-br ${wing.gradient} rounded-2xl p-8 text-left transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-${wing.color}-500/20 border border-white/10`}
                >
                  {/* Ambient glow */}
                  <div className={`absolute inset-0 rounded-2xl bg-${wing.color}-500/10 opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="relative z-10">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{wing.icon}</div>
                    <h3 className="text-2xl font-bold mb-2">{wing.name}</h3>
                    <p className="text-gray-400 mb-4">{wing.description}</p>
                    <p className="text-sm text-gray-500 italic">"{wing.atmosphere}"</p>
                    <div className="mt-4 flex items-center text-amber-400 group-hover:text-amber-300">
                      Enter Wing <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                    </div>
                  </div>

                  {/* Exhibit count */}
                  <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full text-sm">
                    {wing.exhibits.length} exhibits
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Featured Artifact */}
          <div className="bg-stone-800/30 rounded-2xl p-8 border border-amber-900/30">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⭐</span>
              <h2 className="text-xl font-bold">Featured Artifact</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="aspect-video bg-gradient-to-br from-amber-900/50 to-stone-800 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4">🍾</div>
                  <p className="text-sm text-gray-400">Pre-Prohibition Old Forester Bottle, 1910</p>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">Surviving Prohibition</h3>
                <p className="text-gray-400 mb-4">
                  This rare bottle represents one of only six distilleries granted "medicinal whiskey" 
                  permits during Prohibition. Old Forester, produced by Brown-Forman, has been 
                  continuously produced since 1870 - the only bourbon to survive every challenge 
                  of American history.
                </p>
                <button
                  onClick={() => enterWing('bourbon')}
                  className="bg-amber-600 hover:bg-amber-500 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  View in Bourbon Wing →
                </button>
              </div>
            </div>
          </div>

          {/* Bottle Evolution Timeline */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8">📜 Bourbon Bottle Evolution</h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-amber-900/50 -translate-y-1/2" />
              
              <div className="relative flex justify-between">
                {BOTTLE_EVOLUTIONS.bourbon.map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-800 to-amber-950 rounded-full flex items-center justify-center text-4xl border-4 border-amber-600 z-10 hover:scale-110 transition-transform cursor-pointer">
                      {item.image}
                    </div>
                    <div className="mt-4 text-center">
                      <p className="font-bold text-amber-400">{item.era}</p>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-gray-500 max-w-24">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Museum Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🏛️', value: '6', label: 'Museum Wings' },
              { icon: '🖼️', value: '50+', label: 'Exhibits' },
              { icon: '📜', value: '200+', label: 'Artifacts' },
              { icon: '📖', value: '500+', label: 'Years of History' }
            ].map((stat, i) => (
              <div key={i} className="text-center bg-stone-800/30 rounded-xl p-6">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-amber-400">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* WING VIEW */}
      {viewMode === 'wing' && wing && (
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Wing Header */}
          <div className="text-center mb-12">
            <div className="text-8xl mb-4 animate-float">{wing.icon}</div>
            <h1 className="text-4xl font-bold mb-2">{wing.name}</h1>
            <p className="text-xl text-gray-400">{wing.description}</p>
            <p className="text-sm text-gray-500 italic mt-2">"{wing.atmosphere}"</p>
          </div>

          {/* Exhibit Cards */}
          <div className="space-y-8">
            {wing.exhibits.map((exhibit, i) => (
              <div
                key={exhibit.id}
                className="group bg-black/30 rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all cursor-pointer"
                onClick={() => enterExhibit(exhibit.id)}
              >
                <div className="md:flex">
                  {/* Exhibit Preview */}
                  <div className="md:w-1/3 aspect-video md:aspect-auto bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center relative overflow-hidden">
                    <div className="text-6xl group-hover:scale-110 transition-transform">{wing.icon}</div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-amber-600 px-3 py-1 rounded-full text-sm font-semibold">{exhibit.era}</span>
                    </div>
                  </div>
                  
                  {/* Exhibit Info */}
                  <div className="md:w-2/3 p-6">
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-amber-400 transition-colors">{exhibit.name}</h3>
                    <p className="text-gray-400 mb-4">{exhibit.description}</p>
                    
                    {/* Artifact Preview */}
                    <div className="flex gap-4 mb-4">
                      {exhibit.artifacts.slice(0, 3).map((artifact, j) => (
                        <div key={j} className="flex items-center gap-2 bg-stone-800/50 px-3 py-2 rounded-lg text-sm">
                          <span>{artifact.type === 'bottle' ? '🍾' : artifact.type === 'photo' ? '📸' : artifact.type === 'document' ? '📜' : '🖼️'}</span>
                          <span className="text-gray-400">{artifact.title}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button className="text-amber-400 group-hover:text-amber-300 font-semibold flex items-center gap-2">
                      Enter Exhibit <span className="group-hover:translate-x-2 transition-transform">→</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Wing Navigation */}
          <div className="mt-12 flex justify-center gap-4">
            {Object.entries(MUSEUM_WINGS).map(([id, w]) => (
              <button
                key={id}
                onClick={() => enterWing(id)}
                className={`p-3 rounded-full transition-all ${
                  id === currentWing 
                    ? 'bg-amber-600 scale-110' 
                    : 'bg-stone-800 hover:bg-stone-700'
                }`}
                title={w.name}
              >
                {w.icon}
              </button>
            ))}
          </div>
        </main>
      )}

      {/* EXHIBIT VIEW */}
      {viewMode === 'exhibit' && wing && exhibit && (
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Exhibit Header */}
          <div className="text-center mb-12">
            <span className="bg-amber-600 px-4 py-2 rounded-full text-sm font-semibold">{exhibit.era}</span>
            <h1 className="text-4xl font-bold mt-4 mb-2">{exhibit.name}</h1>
            <p className="text-xl text-gray-400">{exhibit.description}</p>
          </div>

          {/* The Story */}
          <div className="bg-stone-800/30 rounded-2xl p-8 mb-12 border border-amber-900/30">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>📖</span> The Story
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">{exhibit.story}</p>
            {audioEnabled && (
              <button className="mt-4 bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                <span>🔊</span> Listen to Narration
              </button>
            )}
          </div>

          {/* Artifacts Gallery */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>🖼️</span> Artifacts in This Exhibit
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {exhibit.artifacts.map((artifact, i) => (
                <div key={i} className="group bg-black/30 rounded-xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all">
                  {/* Artifact Display */}
                  <div className="aspect-square bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center relative">
                    <div className="text-7xl group-hover:scale-110 transition-transform">
                      {artifact.type === 'bottle' ? '🍾' : 
                       artifact.type === 'photo' ? '📸' : 
                       artifact.type === 'document' ? '📜' : 
                       artifact.type === 'label' ? '🏷️' :
                       artifact.type === 'map' ? '🗺️' :
                       artifact.type === 'award' ? '🏆' : '🖼️'}
                    </div>
                    <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded text-xs">
                      {artifact.year > 0 ? artifact.year : `${Math.abs(artifact.year)} BC`}
                    </div>
                  </div>
                  
                  {/* Artifact Info */}
                  <div className="p-4">
                    <h3 className="font-bold mb-1">{artifact.title}</h3>
                    <p className="text-sm text-gray-400">{artifact.description}</p>
                    <button className="mt-3 text-amber-400 text-sm hover:text-amber-300">
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Exhibits */}
          <div className="bg-stone-800/30 rounded-2xl p-6 border border-amber-900/30">
            <h3 className="font-bold mb-4">Continue Your Journey</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {wing.exhibits.filter(e => e.id !== exhibit.id).map((e, i) => (
                <button
                  key={e.id}
                  onClick={() => enterExhibit(e.id)}
                  className="flex-shrink-0 bg-stone-700/50 hover:bg-stone-600/50 rounded-lg p-4 text-left transition-colors"
                >
                  <span className="text-xs text-amber-400">{e.era}</span>
                  <h4 className="font-semibold">{e.name}</h4>
                </button>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* Floating Museum Guide */}
      <div className="fixed bottom-6 right-6 z-30">
        <button className="w-14 h-14 bg-amber-600 hover:bg-amber-500 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-amber-600/30 transition-all hover:scale-110">
          🎧
        </button>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
