// app/games/page.tsx
// BarrelVerse Games Page - REAL Database Integration

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTrivia, CATEGORY_INFO, DIFFICULTY_INFO } from '@/lib/hooks/use-trivia'
import { useAuth } from '@/lib/hooks/use-auth'
import type { TriviaCategory, Difficulty } from '@/lib/types/database'

// Game modes configuration
const GAME_MODES = [
  {
    id: 'quick_pour',
    name: 'Quick Pour',
    description: '10 random questions across all categories',
    icon: '⚡',
    questionCount: 10,
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'masters_challenge',
    name: "Master's Challenge",
    description: '20 expert-level questions for true connoisseurs',
    icon: '👑',
    questionCount: 20,
    difficulty: 'expert' as Difficulty,
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'daily_dram',
    name: 'Daily Dram',
    description: 'New questions every day with bonus $PROOF',
    icon: '📅',
    questionCount: 5,
    color: 'from-green-500 to-teal-600',
  },
  {
    id: 'speed_round',
    name: 'Speed Round',
    description: 'Answer as fast as you can - 15 seconds per question',
    icon: '⏱️',
    questionCount: 15,
    color: 'from-red-500 to-rose-600',
  },
]

export default function GamesPage() {
  const { user, profile, isAuthenticated } = useAuth()
  const trivia = useTrivia()
  
  const [view, setView] = useState<'menu' | 'category' | 'playing' | 'results'>('menu')
  const [selectedCategory, setSelectedCategory] = useState<TriviaCategory | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null)
  const [selectedMode, setSelectedMode] = useState<typeof GAME_MODES[0] | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean
    correctAnswer: string
    explanation: string | null
    proofEarned: number
  } | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number>(0)

  // Timer for speed round
  useEffect(() => {
    if (view !== 'playing' || selectedMode?.id !== 'speed_round') return
    
    setTimeRemaining(15)
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          handleTimeUp()
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [view, trivia.currentIndex, selectedMode])

  const handleTimeUp = () => {
    if (trivia.currentQuestion) {
      handleAnswerSubmit(trivia.currentQuestion.correct_answer, true)
    }
  }

  // Start a game with selected mode
  const startGame = async (mode: typeof GAME_MODES[0], category?: TriviaCategory, difficulty?: Difficulty) => {
    setSelectedMode(mode)
    setSelectedCategory(category || null)
    setSelectedDifficulty(difficulty || mode.difficulty || null)
    
    const result = await trivia.startGame(
      mode.id as 'quick_pour' | 'masters_challenge' | 'daily_dram' | 'blind_tasting' | 'speed_round',
      category,
      difficulty || mode.difficulty,
      mode.questionCount
    )

    if (result.success) {
      setView('playing')
      setStartTime(Date.now())
    }
  }

  // Handle answer submission
  const handleAnswerSubmit = (answer: string, timedOut: boolean = false) => {
    if (selectedAnswer !== null) return
    
    const timeMs = Date.now() - startTime
    setSelectedAnswer(answer)
    
    const result = trivia.submitAnswer(answer, timeMs)
    if (result) {
      setLastResult(result)
      setShowExplanation(true)

      // Auto-advance after showing result
      setTimeout(() => {
        if (result.isComplete) {
          setView('results')
          // Save game session
          trivia.saveGameSession(user?.id)
        } else {
          setSelectedAnswer(null)
          setShowExplanation(false)
          setLastResult(null)
          setStartTime(Date.now())
        }
      }, timedOut ? 1500 : 2500)
    }
  }

  // Render game menu
  const renderMenu = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">🎮 BarrelVerse Games</h1>
        <p className="text-gray-400">Test your spirits knowledge and earn $PROOF tokens!</p>
        {profile && (
          <p className="text-amber-400 mt-2">
            Your Balance: {profile.proof_balance.toLocaleString()} $PROOF
          </p>
        )}
      </div>

      {/* Game Modes */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {GAME_MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => {
              if (mode.id === 'quick_pour') {
                startGame(mode)
              } else if (mode.id === 'masters_challenge' || mode.id === 'speed_round') {
                startGame(mode)
              } else {
                setSelectedMode(mode)
                setView('category')
              }
            }}
            className={`p-6 rounded-xl bg-gradient-to-br ${mode.color} text-white text-left transform hover:scale-105 transition-all shadow-lg`}
          >
            <span className="text-4xl mb-3 block">{mode.icon}</span>
            <h3 className="text-xl font-bold mb-1">{mode.name}</h3>
            <p className="text-sm opacity-90">{mode.description}</p>
            <p className="text-xs mt-2 opacity-75">{mode.questionCount} questions</p>
          </button>
        ))}
      </div>

      {/* Category Selection */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">🏷️ Play by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {(Object.keys(CATEGORY_INFO) as TriviaCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat)
                setView('category')
              }}
              className="p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-center"
            >
              <span className="text-2xl block mb-1">{CATEGORY_INFO[cat].icon}</span>
              <span className="text-sm text-gray-300">{CATEGORY_INFO[cat].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      {profile && (
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📊 Your Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">{profile.games_played}</p>
              <p className="text-sm text-gray-400">Games Played</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{profile.correct_answers}</p>
              <p className="text-sm text-gray-400">Correct Answers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {profile.games_played > 0 
                  ? Math.round((profile.correct_answers / (profile.games_played * 10)) * 100) 
                  : 0}%
              </p>
              <p className="text-sm text-gray-400">Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">{profile.total_proof_earned.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Total $PROOF Earned</p>
            </div>
          </div>
        </div>
      )}

      {!isAuthenticated && (
        <div className="mt-8 bg-gradient-to-r from-amber-900/50 to-orange-900/50 rounded-xl p-6 text-center">
          <p className="text-gray-300 mb-3">
            Sign in to save your progress and earn $PROOF rewards!
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-white font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  )

  // Render category/difficulty selection
  const renderCategorySelection = () => (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => {
          setView('menu')
          setSelectedCategory(null)
          setSelectedDifficulty(null)
          setSelectedMode(null)
        }}
        className="mb-6 text-gray-400 hover:text-white transition-colors"
      >
        ← Back to Menu
      </button>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white">
          {selectedCategory ? CATEGORY_INFO[selectedCategory].icon : '🎯'} 
          {' '}
          {selectedCategory ? CATEGORY_INFO[selectedCategory].label : 'Select Category'}
        </h2>
      </div>

      {!selectedCategory && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {(Object.keys(CATEGORY_INFO) as TriviaCategory[]).slice(0, 12).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="p-6 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors text-center"
            >
              <span className="text-4xl block mb-2">{CATEGORY_INFO[cat].icon}</span>
              <span className="text-white font-medium">{CATEGORY_INFO[cat].label}</span>
            </button>
          ))}
        </div>
      )}

      {selectedCategory && (
        <>
          <p className="text-center text-gray-400 mb-6">Select Difficulty</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.keys(DIFFICULTY_INFO) as Difficulty[]).map(diff => (
              <button
                key={diff}
                onClick={() => startGame(selectedMode || GAME_MODES[0], selectedCategory, diff)}
                className={`p-6 rounded-xl transition-all text-center ${
                  diff === 'easy' ? 'bg-green-600 hover:bg-green-700' :
                  diff === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700' :
                  diff === 'hard' ? 'bg-orange-600 hover:bg-orange-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}
              >
                <span className="text-2xl font-bold text-white block">
                  {DIFFICULTY_INFO[diff].label}
                </span>
                <span className="text-sm text-white/80">
                  {DIFFICULTY_INFO[diff].multiplier}x $PROOF
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )

  // Render game play
  const renderPlaying = () => {
    const question = trivia.currentQuestion
    if (!question) return <div className="text-center p-10 text-white">Loading...</div>

    return (
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-400">
            Question {question.questionNumber} of {question.totalQuestions}
          </div>
          <div className="flex items-center gap-4">
            {timeRemaining !== null && (
              <div className={`text-xl font-bold ${timeRemaining <= 5 ? 'text-red-500' : 'text-white'}`}>
                ⏱️ {timeRemaining}s
              </div>
            )}
            <div className="text-amber-400 font-medium">
              💰 {trivia.proofEarned} $PROOF
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
          <div
            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${trivia.progress.percentage}%` }}
          />
        </div>

        {/* Category & Difficulty badge */}
        <div className="flex gap-2 mb-4">
          <span className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
            {CATEGORY_INFO[question.category as TriviaCategory]?.icon} {CATEGORY_INFO[question.category as TriviaCategory]?.label}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            question.difficulty === 'easy' ? 'bg-green-600/50 text-green-300' :
            question.difficulty === 'medium' ? 'bg-yellow-600/50 text-yellow-300' :
            question.difficulty === 'hard' ? 'bg-orange-600/50 text-orange-300' :
            'bg-red-600/50 text-red-300'
          }`}>
            {DIFFICULTY_INFO[question.difficulty as Difficulty]?.label}
          </span>
        </div>

        {/* Question */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl md:text-2xl font-medium text-white leading-relaxed">
            {question.question}
          </h2>
        </div>

        {/* Answers */}
        <div className="space-y-3">
          {question.shuffledAnswers.map((answer, index) => {
            const isSelected = selectedAnswer === answer
            const isCorrect = answer === question.correct_answer
            const showResult = showExplanation

            let buttonClass = 'w-full p-4 rounded-xl text-left transition-all '
            if (showResult) {
              if (isCorrect) {
                buttonClass += 'bg-green-600 text-white'
              } else if (isSelected && !isCorrect) {
                buttonClass += 'bg-red-600 text-white'
              } else {
                buttonClass += 'bg-gray-700 text-gray-400'
              }
            } else {
              buttonClass += 'bg-gray-700 hover:bg-gray-600 text-white'
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSubmit(answer)}
                disabled={selectedAnswer !== null}
                className={buttonClass}
              >
                <span className="mr-3 font-bold text-lg">
                  {String.fromCharCode(65 + index)}
                </span>
                {answer}
                {showResult && isCorrect && <span className="float-right">✓</span>}
                {showResult && isSelected && !isCorrect && <span className="float-right">✗</span>}
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {showExplanation && lastResult && (
          <div className={`mt-6 p-4 rounded-xl ${lastResult.isCorrect ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
            <p className={`font-medium ${lastResult.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {lastResult.isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
              {lastResult.proofEarned > 0 && ` +${lastResult.proofEarned} $PROOF`}
            </p>
            {lastResult.explanation && (
              <p className="text-gray-300 mt-2 text-sm">{lastResult.explanation}</p>
            )}
          </div>
        )}
      </div>
    )
  }

  // Render results
  const renderResults = () => {
    const stats = trivia.getGameStats()
    
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="mb-8">
          <span className="text-6xl mb-4 block">
            {stats.accuracy >= 80 ? '🏆' : stats.accuracy >= 60 ? '🎉' : stats.accuracy >= 40 ? '👍' : '📚'}
          </span>
          <h2 className="text-3xl font-bold text-white mb-2">
            {stats.accuracy >= 80 ? 'Outstanding!' : 
             stats.accuracy >= 60 ? 'Great Job!' : 
             stats.accuracy >= 40 ? 'Good Effort!' : 
             'Keep Learning!'}
          </h2>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-4xl font-bold text-white">{stats.score}/{stats.total}</p>
              <p className="text-gray-400">Correct Answers</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-400">{stats.accuracy}%</p>
              <p className="text-gray-400">Accuracy</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-amber-400">{stats.proofEarned}</p>
              <p className="text-gray-400">$PROOF Earned</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-400">
                {Math.round(stats.averageTimeMs / 1000)}s
              </p>
              <p className="text-gray-400">Avg Time</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              trivia.resetGame()
              setView('menu')
              setSelectedAnswer(null)
              setShowExplanation(false)
              setLastResult(null)
            }}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-medium transition-colors"
          >
            Back to Menu
          </button>
          <button
            onClick={() => {
              trivia.resetGame()
              if (selectedMode) {
                startGame(selectedMode, selectedCategory || undefined, selectedDifficulty || undefined)
              } else {
                setView('menu')
              }
              setSelectedAnswer(null)
              setShowExplanation(false)
              setLastResult(null)
            }}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-xl text-white font-medium transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8">
      {view === 'menu' && renderMenu()}
      {view === 'category' && renderCategorySelection()}
      {view === 'playing' && renderPlaying()}
      {view === 'results' && renderResults()}
    </main>
  )
}
