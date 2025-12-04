'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Bourbon Bingo cards - different themes
const BINGO_THEMES = {
  tasting: {
    name: 'Tasting Night Bingo',
    description: 'Perfect for bourbon club meetings',
    squares: [
      'Someone says "smooth"', 'Pappy mentioned', 'Someone checks price online',
      'Neat vs ice debate', '"This reminds me of..."', 'Age statement flex',
      'FREE SPACE', '"Better than expected"', 'Cork breaks',
      'Someone swirls their glass', 'Nosing for 5+ minutes', 'Whiskey Tribe reference',
      'Proof discussion', 'Someone adds water', '"Allocated" mentioned',
      'Single barrel debate', 'Someone takes a photo', 'Mash bill discussed',
      'Barrel entry proof', '"Better than [expensive bottle]"', 'Someone coughs',
      'Rickhouse location talk', 'Finish length debate', '"I detect [obscure note]"',
      'Someone asks about availability'
    ]
  },
  hunting: {
    name: 'Bourbon Hunting Bingo',
    description: 'For your next store run',
    squares: [
      'Buffalo Trace spotted', 'Empty allocated shelf', 'Store pick available',
      '"We just sold out"', 'Dusty find', 'Price gouging seen',
      'FREE SPACE', 'Lottery signup', 'Behind counter stash',
      'Manager relationship flex', 'Secondary price shock', 'Store exclusive',
      'Out of state plates', 'Line at opening', 'Tater spotted',
      '"My buddy got one"', 'Limited edition', 'MSRP find',
      '"Truck comes Tuesday"', 'Overpriced Blanton\'s', 'Hand-selected barrel',
      'Travel exclusive', 'Weller anything', 'Multiple store visits',
      '"Just missed it"'
    ]
  },
  distillery: {
    name: 'Distillery Tour Bingo',
    description: 'When visiting bourbon country',
    squares: [
      'Gift shop splurge', 'Barrel roll photo', 'Tasting room selfie',
      'Rick house tour', 'Grain silo picture', '"Oldest distillery" claim',
      'FREE SPACE', 'Sample tray ordered', 'Tour guide joke lands',
      'History lesson', 'Copper still closeup', 'Limited bottle purchase',
      'Angel\'s share mentioned', 'Barrel aging explained', 'Yeast culture talk',
      'Water source discussed', 'Proof explained', 'Mashbill revealed',
      'Production numbers shared', 'Comparison tasting', 'VIP tour envy',
      'Barrel pick opportunity', 'Tour group bonding', 'Staff recommendation',
      'Return visit planned'
    ]
  },
  social: {
    name: 'r/bourbon Bingo',
    description: 'For scrolling bourbon Reddit',
    squares: [
      'BT shelf post', 'First bottle post', '"Is this worth it?"',
      'Collection photo humble brag', 'Pappy Van Winkle sighting', 'Secondary market complaint',
      'FREE SPACE', 'Weller hunt story', 'Allocated rant',
      '"My store finally got..."', 'Review with spec sheet', 'Four Roses recipe debate',
      'Turkey 101 love', 'Blind tasting results', '"Hidden gem" recommendation',
      'Mellow Corn appreciation', 'Total Wine complaint', 'FOMO post',
      '"Finally found it!"', 'Bunker pic', 'State lottery results',
      'Tater accusation', '"Unpopular opinion"', 'Store relationship advice',
      '"Is my collection good?"'
    ]
  }
}

// Party games
const DRINKING_GAMES = [
  {
    id: 'bourbon-roulette',
    name: 'Bourbon Roulette',
    icon: '🎰',
    players: '3-8',
    difficulty: 'Easy',
    description: 'Spin the wheel, taste the pour, guess the bourbon!',
    rules: [
      'One person (the dealer) pours samples of 4-6 different bourbons',
      'Each player spins the wheel to determine which sample they taste',
      'Blindfolded, they must identify the bourbon',
      'Correct guess = others drink. Wrong = you drink.',
      'First to 3 correct guesses wins!'
    ],
    equipment: ['4-6 different bourbons', 'Tasting glasses', 'Blindfold', 'Spin wheel (or app)']
  },
  {
    id: 'proof-ladder',
    name: 'Proof Ladder',
    icon: '📈',
    players: '2-6',
    difficulty: 'Medium',
    description: 'Climb the proof ladder from 80 to barrel strength!',
    rules: [
      'Line up bourbons from lowest to highest proof',
      'Start at the bottom (80 proof)',
      'Each round, answer a trivia question correctly to move up',
      'Wrong answer = stay and take another sip at current level',
      'First to reach the top (barrel proof) wins!',
      'Bonus: Identify the bourbon at each level for extra moves'
    ],
    equipment: ['5+ bourbons of varying proofs', 'Trivia cards', 'Shot glasses']
  },
  {
    id: 'blind-bracket',
    name: 'Blind Bracket Challenge',
    icon: '🏆',
    players: '4+',
    difficulty: 'Medium',
    description: 'March Madness meets bourbon tasting!',
    rules: [
      'Set up a tournament bracket with 8 bourbons',
      'Each round, two bourbons face off blind',
      'Everyone votes for their favorite',
      'Losers drink the losing bourbon',
      'Winner advances to next round',
      'Final winner is crowned the champion!'
    ],
    equipment: ['8 bourbons', 'Bracket sheet', 'Tasting glasses', 'Blindfolds']
  },
  {
    id: 'flavor-wheel-game',
    name: 'Flavor Wheel Roulette',
    icon: '🎯',
    players: '3-6',
    difficulty: 'Hard',
    description: 'Spin, taste, and identify specific flavor notes!',
    rules: [
      'Spin the flavor wheel to get a category (fruity, spicy, etc.)',
      'Taste the mystery bourbon',
      'You must identify a specific note from that category',
      'Correct identification = pass to next player',
      'Wrong or can\'t find it = drink!',
      'Three strikes and you\'re out!'
    ],
    equipment: ['Various bourbons', 'Flavor wheel spinner', 'Tasting glasses']
  },
  {
    id: 'price-is-right',
    name: 'Price is Right: Bourbon Edition',
    icon: '💰',
    players: '3-8',
    difficulty: 'Easy',
    description: 'Guess the price without going over!',
    rules: [
      'Show a bottle (or describe its specs)',
      'Each player bids on the retail price',
      'Closest without going over wins!',
      'Winner picks who drinks',
      'Going over = you drink double',
      'Exact price = everyone else drinks!'
    ],
    equipment: ['Bourbon bottles (or pictures)', 'Paper for bids', 'Glasses']
  },
  {
    id: 'never-have-i-ever',
    name: 'Never Have I Ever: Bourbon Edition',
    icon: '🙈',
    players: '4+',
    difficulty: 'Easy',
    description: 'Confess your bourbon sins!',
    rules: [
      '"Never have I ever paid secondary for a bottle"',
      '"Never have I ever camped for a release"',
      '"Never have I ever added ice to barrel proof"',
      'If you\'ve done it, you drink!',
      'Bonus: Share the story for +1 drink everyone else'
    ],
    equipment: ['Any bourbon', 'Glasses', 'Good bourbon stories'],
    examples: [
      'Paid over $100 for Blanton\'s',
      'Called a store every day looking for an allocation',
      'Bought a "backup bottle"',
      'Said a $30 bottle was "just as good" as Pappy',
      'Started a collection just for the bottles',
      'Drove more than 2 hours for a bourbon',
      'Lied about how much a bottle cost'
    ]
  }
]

export default function BourbonGamesPage() {
  const [activeTheme, setActiveTheme] = useState<keyof typeof BINGO_THEMES>('tasting')
  const [bingoCard, setBingoCard] = useState<string[]>([])
  const [marked, setMarked] = useState<boolean[]>(Array(25).fill(false))
  const [selectedGame, setSelectedGame] = useState<typeof DRINKING_GAMES[0] | null>(null)
  const [showBingo, setShowBingo] = useState(true)

  // Generate shuffled bingo card
  const generateCard = () => {
    const theme = BINGO_THEMES[activeTheme]
    const shuffled = [...theme.squares].sort(() => Math.random() - 0.5)
    setBingoCard(shuffled.slice(0, 25))
    setMarked(Array(25).fill(false))
    // Mark free space
    setMarked(prev => {
      const newMarked = [...prev]
      newMarked[12] = true // Center is free space
      return newMarked
    })
  }

  useEffect(() => {
    generateCard()
  }, [activeTheme])

  const toggleSquare = (index: number) => {
    if (index === 12) return // Free space always marked
    setMarked(prev => {
      const newMarked = [...prev]
      newMarked[index] = !newMarked[index]
      return newMarked
    })
  }

  // Check for bingo
  const checkBingo = (): boolean => {
    // Rows
    for (let row = 0; row < 5; row++) {
      if ([0,1,2,3,4].every(col => marked[row * 5 + col])) return true
    }
    // Columns
    for (let col = 0; col < 5; col++) {
      if ([0,1,2,3,4].every(row => marked[row * 5 + col])) return true
    }
    // Diagonals
    if ([0,6,12,18,24].every(i => marked[i])) return true
    if ([4,8,12,16,20].every(i => marked[i])) return true
    return false
  }

  const hasBingo = checkBingo()

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-fuchsia-950/20 to-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-fuchsia-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-4">
            <Link href="/games" className="hover:text-amber-400 transition-colors">All Games</Link>
            <Link href="/trivia" className="hover:text-amber-400 transition-colors">Trivia</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-4">
            🎮 PARTY GAMES
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Bourbon <span className="text-fuchsia-400">Party Games</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Shareable bingo cards and drinking games perfect for tasting parties, 
            bourbon clubs, or a night with friends.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setShowBingo(true)}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              showBingo ? 'bg-fuchsia-600' : 'bg-stone-800'
            }`}
          >
            🎴 Bourbon Bingo
          </button>
          <button
            onClick={() => setShowBingo(false)}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              !showBingo ? 'bg-fuchsia-600' : 'bg-stone-800'
            }`}
          >
            🎲 Drinking Games
          </button>
        </div>

        {/* Bingo Section */}
        {showBingo && (
          <div className="max-w-3xl mx-auto">
            {/* Theme Selection */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {Object.entries(BINGO_THEMES).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => setActiveTheme(key as keyof typeof BINGO_THEMES)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTheme === key
                      ? 'bg-fuchsia-600'
                      : 'bg-stone-800 hover:bg-stone-700'
                  }`}
                >
                  {theme.name}
                </button>
              ))}
            </div>

            <p className="text-center text-gray-400 mb-6">
              {BINGO_THEMES[activeTheme].description}
            </p>

            {/* Bingo Card */}
            <div className={`bg-stone-800/50 rounded-2xl p-4 border-2 ${
              hasBingo ? 'border-yellow-500 animate-pulse' : 'border-fuchsia-500/30'
            }`}>
              {hasBingo && (
                <div className="text-center py-4 mb-4 bg-yellow-500 text-black rounded-xl font-bold text-2xl animate-bounce">
                  🎉 BINGO! 🎉
                </div>
              )}
              
              {/* Header Row */}
              <div className="grid grid-cols-5 gap-2 mb-2">
                {['B', 'I', 'N', 'G', 'O'].map((letter) => (
                  <div key={letter} className="text-center font-bold text-2xl text-fuchsia-400">
                    {letter}
                  </div>
                ))}
              </div>

              {/* Bingo Grid */}
              <div className="grid grid-cols-5 gap-2">
                {bingoCard.map((square, index) => (
                  <button
                    key={index}
                    onClick={() => toggleSquare(index)}
                    className={`aspect-square p-2 rounded-xl text-center flex items-center justify-center transition-all ${
                      marked[index]
                        ? 'bg-fuchsia-600 text-white'
                        : 'bg-stone-700 hover:bg-stone-600'
                    } ${index === 12 ? 'bg-yellow-500 text-black font-bold' : ''}`}
                  >
                    <span className="text-xs leading-tight">
                      {index === 12 ? '⭐ FREE' : square}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={generateCard}
                className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-500 py-3 rounded-xl font-semibold transition-colors"
              >
                🔄 New Card
              </button>
              <button
                onClick={() => setMarked(Array(25).fill(false).map((_, i) => i === 12))}
                className="flex-1 bg-stone-700 hover:bg-stone-600 py-3 rounded-xl font-semibold transition-colors"
              >
                🗑️ Reset
              </button>
              <button
                className="flex-1 bg-stone-700 hover:bg-stone-600 py-3 rounded-xl font-semibold transition-colors"
              >
                📤 Share
              </button>
            </div>

            {/* Viral sharing prompt */}
            <div className="mt-8 bg-gradient-to-r from-fuchsia-900/30 to-pink-900/30 rounded-xl p-6 border border-fuchsia-500/30 text-center">
              <h3 className="font-bold mb-2">🔥 Perfect for Bourbon Facebook Groups!</h3>
              <p className="text-gray-400 text-sm mb-4">
                Share your bingo card in bourbon groups before your next tasting. 
                Watch the comments explode!
              </p>
              <div className="flex justify-center gap-2">
                <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-semibold">
                  📘 Share to Facebook
                </button>
                <button className="bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-lg text-sm font-semibold">
                  🤖 Post to Reddit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Drinking Games Section */}
        {!showBingo && (
          <div>
            {!selectedGame ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DRINKING_GAMES.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => setSelectedGame(game)}
                    className="bg-stone-800/50 rounded-2xl p-6 border border-stone-700/50 hover:border-fuchsia-500/50 cursor-pointer transition-all group"
                  >
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                      {game.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{game.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="bg-stone-700 px-2 py-1 rounded">
                        👥 {game.players}
                      </span>
                      <span className={`px-2 py-1 rounded ${
                        game.difficulty === 'Easy' ? 'bg-green-900 text-green-400' :
                        game.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-400' :
                        'bg-red-900 text-red-400'
                      }`}>
                        {game.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Selected Game Detail */
              <div className="max-w-3xl mx-auto">
                <button
                  onClick={() => setSelectedGame(null)}
                  className="text-fuchsia-400 hover:text-fuchsia-300 mb-6"
                >
                  ← Back to games
                </button>

                <div className="bg-stone-800/50 rounded-2xl overflow-hidden border border-stone-700/50">
                  <div className="bg-gradient-to-r from-fuchsia-900/50 to-stone-800 p-8 text-center">
                    <span className="text-8xl">{selectedGame.icon}</span>
                    <h1 className="text-4xl font-bold mt-4">{selectedGame.name}</h1>
                    <p className="text-gray-400 mt-2">{selectedGame.description}</p>
                    <div className="flex justify-center gap-4 mt-4">
                      <span className="bg-black/30 px-4 py-2 rounded-full">
                        👥 {selectedGame.players} players
                      </span>
                      <span className={`px-4 py-2 rounded-full ${
                        selectedGame.difficulty === 'Easy' ? 'bg-green-900/50 text-green-400' :
                        selectedGame.difficulty === 'Medium' ? 'bg-yellow-900/50 text-yellow-400' :
                        'bg-red-900/50 text-red-400'
                      }`}>
                        {selectedGame.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="p-8">
                    <h2 className="text-xl font-bold mb-4">📋 Rules</h2>
                    <div className="space-y-3 mb-8">
                      {selectedGame.rules.map((rule, i) => (
                        <div key={i} className="flex gap-4 bg-black/30 rounded-lg p-4">
                          <span className="w-8 h-8 bg-fuchsia-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                            {i + 1}
                          </span>
                          <p className="text-gray-300 pt-1">{rule}</p>
                        </div>
                      ))}
                    </div>

                    <h2 className="text-xl font-bold mb-4">🛠️ What You Need</h2>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {selectedGame.equipment.map((item, i) => (
                        <span key={i} className="bg-stone-700 px-3 py-1 rounded-full text-sm">
                          {item}
                        </span>
                      ))}
                    </div>

                    {selectedGame.examples && (
                      <>
                        <h2 className="text-xl font-bold mb-4">💬 Example Prompts</h2>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedGame.examples.map((example, i) => (
                            <div key={i} className="bg-black/30 rounded-lg p-3 text-sm text-gray-400">
                              "Never have I ever {example.toLowerCase()}"
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-8 border-t border-stone-700/50 flex gap-4">
                    <button className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-500 py-3 rounded-xl font-semibold transition-colors">
                      📤 Share Game
                    </button>
                    <button className="flex-1 bg-stone-700 hover:bg-stone-600 py-3 rounded-xl font-semibold transition-colors">
                      🎲 Start Playing
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
