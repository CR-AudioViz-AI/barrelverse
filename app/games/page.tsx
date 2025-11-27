'use client'

import { useState } from 'react'
import Link from 'next/link'

// Sample trivia questions from our database
const TRIVIA_QUESTIONS = {
  bourbon: [
    {
      question: "What percentage of the world's bourbon is produced in Kentucky?",
      options: ["75%", "85%", "95%", "99%"],
      correct: 2,
      explanation: "Kentucky produces approximately 95% of the world's bourbon supply."
    },
    {
      question: "What is the minimum corn content required for a whiskey to be called bourbon?",
      options: ["41%", "51%", "61%", "71%"],
      correct: 1,
      explanation: "Bourbon must be made from a grain mixture that is at least 51% corn."
    },
    {
      question: "Which Buffalo Trace bourbon is most allocated and sought after?",
      options: ["Eagle Rare", "Blanton's", "Pappy Van Winkle", "Buffalo Trace"],
      correct: 2,
      explanation: "Pappy Van Winkle is the most allocated bourbon, with secondary market prices reaching thousands of dollars."
    },
    {
      question: "What year was bourbon officially declared 'America's Native Spirit' by Congress?",
      options: ["1954", "1964", "1974", "1984"],
      correct: 1,
      explanation: "Congress declared bourbon a 'distinctive product of the United States' on May 4, 1964."
    },
    {
      question: "What type of barrel must bourbon be aged in?",
      options: ["Used oak", "New charred oak", "Sherry casks", "Any wooden barrel"],
      correct: 1,
      explanation: "Bourbon must be aged in new, charred oak barrels - this is a legal requirement."
    },
  ],
  scotch: [
    {
      question: "How many official whisky regions are there in Scotland?",
      options: ["4", "5", "6", "7"],
      correct: 1,
      explanation: "Scotland has 5 official whisky regions: Speyside, Highland, Lowland, Islay, and Campbeltown."
    },
    {
      question: "What is the minimum age for Scotch whisky?",
      options: ["2 years", "3 years", "5 years", "10 years"],
      correct: 1,
      explanation: "Scotch whisky must be aged for a minimum of 3 years in oak casks in Scotland."
    },
    {
      question: "Which region is known for heavily peated whiskies?",
      options: ["Speyside", "Lowland", "Islay", "Highland"],
      correct: 2,
      explanation: "Islay is famous for its heavily peated, smoky whiskies like Laphroaig and Ardbeg."
    },
  ],
  wine: [
    {
      question: "In what year did the famous 'Judgment of Paris' wine tasting occur?",
      options: ["1966", "1976", "1986", "1996"],
      correct: 1,
      explanation: "The 1976 Judgment of Paris shocked the wine world when California wines beat French wines in a blind tasting."
    },
    {
      question: "What grape variety is Champagne primarily made from?",
      options: ["Merlot", "Chardonnay, Pinot Noir, Pinot Meunier", "Cabernet Sauvignon", "Riesling"],
      correct: 1,
      explanation: "Traditional Champagne is made from Chardonnay, Pinot Noir, and Pinot Meunier grapes."
    },
  ],
  beer: [
    {
      question: "What is the German beer purity law called?",
      options: ["Biergesetz", "Reinheitsgebot", "Brauordnung", "Hopfenregel"],
      correct: 1,
      explanation: "The Reinheitsgebot (1516) originally permitted only water, barley, and hops in beer."
    },
    {
      question: "What style of beer originated in Pilsen, Czech Republic?",
      options: ["Porter", "Stout", "Pilsner", "Wheat beer"],
      correct: 2,
      explanation: "Pilsner was first brewed in Pilsen in 1842 and revolutionized the beer world."
    },
  ],
}

// Game types
const GAME_TYPES = [
  { id: 'trivia', name: 'Trivia Challenge', icon: '❓', description: 'Test your knowledge', reward: '10-50 $PROOF' },
  { id: 'blind', name: 'Blind Tasting', icon: '👁️', description: 'Identify by description', reward: '25-100 $PROOF' },
  { id: 'match', name: 'Match Game', icon: '🎯', description: 'Pair producers & products', reward: '15-40 $PROOF' },
  { id: 'timeline', name: 'Timeline', icon: '📅', description: 'Order historical events', reward: '20-60 $PROOF' },
  { id: 'region', name: 'Region Master', icon: '🗺️', description: 'Identify regions on map', reward: '15-50 $PROOF' },
  { id: 'price', name: 'Price is Right', icon: '💰', description: 'Guess bottle prices', reward: '10-75 $PROOF' },
]

const CATEGORIES = [
  { id: 'bourbon', name: 'Bourbon', icon: '🥃' },
  { id: 'scotch', name: 'Scotch', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { id: 'wine', name: 'Wine', icon: '🍷' },
  { id: 'beer', name: 'Beer', icon: '🍺' },
  { id: 'tequila', name: 'Tequila', icon: '🌵' },
  { id: 'rum', name: 'Rum', icon: '🏝️' },
  { id: 'gin', name: 'Gin', icon: '🫒' },
  { id: 'all', name: 'All Categories', icon: '🌟' },
]

// Trivia Game Component
function TriviaGame({ category, onExit }: { category: string, onExit: () => void }) {
  const questions = category === 'all' 
    ? [...TRIVIA_QUESTIONS.bourbon, ...TRIVIA_QUESTIONS.scotch, ...TRIVIA_QUESTIONS.wine, ...TRIVIA_QUESTIONS.beer]
    : TRIVIA_QUESTIONS[category as keyof typeof TRIVIA_QUESTIONS] || TRIVIA_QUESTIONS.bourbon
  
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  
  const question = questions[currentQ]
  
  const handleAnswer = (index: number) => {
    if (selected !== null) return
    setSelected(index)
    setShowResult(true)
    if (index === question.correct) {
      setScore(score + 10)
    }
  }
  
  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setGameOver(true)
    } else {
      setCurrentQ(currentQ + 1)
      setSelected(null)
      setShowResult(false)
    }
  }
  
  if (gameOver) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold mb-2">Game Complete!</h2>
        <p className="text-xl text-gray-600 mb-4">
          You scored <span className="text-barrel-500 font-bold">{score}</span> out of {questions.length * 10} points
        </p>
        <p className="text-whiskey-500 font-bold text-2xl mb-6">
          +{score} $PROOF earned!
        </p>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => { setCurrentQ(0); setScore(0); setSelected(null); setShowResult(false); setGameOver(false); }}
            className="px-6 py-3 bg-barrel-500 text-white rounded-lg font-semibold hover:bg-barrel-600"
          >
            Play Again
          </button>
          <button 
            onClick={onExit}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Back to Games
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-gray-500">Question {currentQ + 1} of {questions.length}</span>
        <span className="text-sm font-semibold text-whiskey-500">{score} $PROOF</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-barrel-500 h-2 rounded-full transition-all"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
        />
      </div>
      
      {/* Question */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        <h3 className="text-xl font-semibold mb-6">{question.question}</h3>
        
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selected !== null}
              className={`w-full p-4 rounded-lg text-left transition-all border-2 ${
                selected === null 
                  ? 'border-gray-200 hover:border-barrel-300 hover:bg-barrel-50'
                  : index === question.correct
                    ? 'border-green-500 bg-green-50'
                    : selected === index
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 opacity-50'
              }`}
            >
              <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
            </button>
          ))}
        </div>
        
        {showResult && (
          <div className={`mt-6 p-4 rounded-lg ${selected === question.correct ? 'bg-green-100' : 'bg-amber-100'}`}>
            <p className="font-semibold mb-1">
              {selected === question.correct ? '✅ Correct!' : '❌ Not quite!'}
            </p>
            <p className="text-sm text-gray-700">{question.explanation}</p>
          </div>
        )}
      </div>
      
      {showResult && (
        <button
          onClick={nextQuestion}
          className="w-full py-3 bg-barrel-500 text-white rounded-lg font-semibold hover:bg-barrel-600 transition-colors"
        >
          {currentQ + 1 >= questions.length ? 'See Results' : 'Next Question'}
        </button>
      )}
      
      <button
        onClick={onExit}
        className="w-full mt-3 py-3 text-gray-500 hover:text-gray-700"
      >
        Exit Game
      </button>
    </div>
  )
}

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('bourbon')
  
  if (activeGame === 'trivia') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          🎯 Trivia Challenge: {CATEGORIES.find(c => c.id === selectedCategory)?.name}
        </h1>
        <TriviaGame category={selectedCategory} onExit={() => setActiveGame(null)} />
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">🎮 Games Hub</h1>
        <p className="text-xl text-gray-600">
          100+ games across all 13 spirit categories. Learn while you play!
        </p>
      </div>
      
      {/* Daily Challenge Banner */}
      <div className="bg-gradient-to-r from-barrel-500 to-barrel-700 rounded-2xl p-6 mb-10 text-white">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm uppercase tracking-wider opacity-80">Daily Challenge</span>
            <h2 className="text-2xl font-bold">Kentucky Bourbon Masters</h2>
            <p className="opacity-80">5 questions • 2x $PROOF rewards today!</p>
          </div>
          <button 
            onClick={() => { setSelectedCategory('bourbon'); setActiveGame('trivia'); }}
            className="px-6 py-3 bg-white text-barrel-700 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            Play Now
          </button>
        </div>
      </div>
      
      {/* Category Selector */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Select Category</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-barrel-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Game Types Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {GAME_TYPES.map((game) => (
          <div
            key={game.id}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100 cursor-pointer group"
            onClick={() => game.id === 'trivia' && setActiveGame('trivia')}
          >
            <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">
              {game.icon}
            </span>
            <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
            <p className="text-gray-600 mb-3">{game.description}</p>
            <span className="text-whiskey-500 font-semibold">{game.reward}</span>
            {game.id !== 'trivia' && (
              <span className="block text-xs text-gray-400 mt-2">Coming soon</span>
            )}
          </div>
        ))}
      </div>
      
      {/* Leaderboard Preview */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">🏆 Today's Leaders</h2>
          <Link href="/leaderboard" className="text-barrel-500 hover:underline">View All</Link>
        </div>
        <div className="space-y-3">
          {[
            { rank: 1, name: 'BourbonMaster', score: 2450, avatar: '🥇' },
            { rank: 2, name: 'WhiskeyWiz', score: 2280, avatar: '🥈' },
            { rank: 3, name: 'SpiritSeeker', score: 2150, avatar: '🥉' },
            { rank: 4, name: 'OakAged', score: 1890, avatar: '4️⃣' },
            { rank: 5, name: 'BarrelRider', score: 1720, avatar: '5️⃣' },
          ].map((player) => (
            <div key={player.rank} className="flex items-center justify-between bg-white rounded-lg p-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{player.avatar}</span>
                <span className="font-medium">{player.name}</span>
              </div>
              <span className="font-bold text-barrel-500">{player.score} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
