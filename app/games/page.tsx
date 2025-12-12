'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Gamepad2, Brain, Wine, Map, Trophy, Star, 
  Lock, Crown, Sparkles, ArrowRight, Users
} from 'lucide-react';
import TriviaGame from '@/components/games/TriviaGame';
import BlindTastingGame from '@/components/games/BlindTastingGame';

type GameType = 'menu' | 'trivia' | 'blind-tasting' | 'bottle-hunt' | 'collection-challenge';

interface GameCard {
  id: GameType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  premium: boolean;
  comingSoon?: boolean;
}

const games: GameCard[] = [
  {
    id: 'trivia',
    title: 'Spirit Trivia',
    description: 'Test your knowledge of whiskey, bourbon, scotch and more with 370+ questions!',
    icon: <Brain className="w-8 h-8" />,
    color: 'from-amber-500 to-orange-500',
    difficulty: 'Easy',
    duration: '5-10 min',
    premium: false
  },
  {
    id: 'blind-tasting',
    title: 'Blind Tasting',
    description: 'Identify spirits from tasting notes alone. Train your palate like a sommelier!',
    icon: <Wine className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-500',
    difficulty: 'Medium',
    duration: '10-15 min',
    premium: false
  },
  {
    id: 'bottle-hunt',
    title: 'Bottle Hunt',
    description: 'Find rare bottles hidden in your area. Compete with other collectors!',
    icon: <Map className="w-8 h-8" />,
    color: 'from-green-500 to-teal-500',
    difficulty: 'Hard',
    duration: 'Ongoing',
    premium: true,
    comingSoon: true
  },
  {
    id: 'collection-challenge',
    title: 'Collection Challenge',
    description: 'Build the perfect collection within a budget. Strategic collecting game!',
    icon: <Trophy className="w-8 h-8" />,
    color: 'from-blue-500 to-indigo-500',
    difficulty: 'Medium',
    duration: '15-20 min',
    premium: true,
    comingSoon: true
  }
];

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState<GameType>('menu');
  const [userStats, setUserStats] = useState({
    gamesPlayed: 0,
    totalScore: 0,
    achievements: 0
  });

  const handleBack = () => setActiveGame('menu');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-b border-amber-900/50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-10 h-10 text-amber-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">CRAVBarrels Games</h1>
                <p className="text-amber-400/80 text-sm">Learn, play, and earn rewards</p>
              </div>
            </div>
            
            {activeGame !== 'menu' && (
              <button
                onClick={handleBack}
                className="text-amber-400 hover:text-amber-300 transition flex items-center gap-2"
              >
                ← Back to Games
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeGame === 'menu' && (
          <>
            {/* Stats Banner */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{userStats.gamesPlayed}</p>
                    <p className="text-sm text-gray-400">Games Played</p>
                  </div>
                  <div className="h-12 w-px bg-gray-700" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-400">{userStats.totalScore.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Total Score</p>
                  </div>
                  <div className="h-12 w-px bg-gray-700" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-400">{userStats.achievements}</p>
                    <p className="text-sm text-gray-400">Achievements</p>
                  </div>
                </div>
                
                <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white transition">
                  <Users className="w-4 h-4" />
                  Leaderboard
                </button>
              </div>
            </div>

            {/* Games Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {games.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => !game.comingSoon && setActiveGame(game.id)}
                  className={`relative bg-gray-800 rounded-xl overflow-hidden cursor-pointer group ${
                    game.comingSoon ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {/* Gradient top bar */}
                  <div className={`h-2 bg-gradient-to-r ${game.color}`} />
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${game.color} bg-opacity-20`}>
                        {game.icon}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {game.premium && (
                          <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
                            <Crown className="w-3 h-3" />
                            Premium
                          </span>
                        )}
                        {game.comingSoon && (
                          <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition">
                      {game.title}
                    </h3>
                    <p className="text-gray-400 mb-4">{game.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`px-2 py-1 rounded ${
                          game.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                          game.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {game.difficulty}
                        </span>
                        <span className="text-gray-500">{game.duration}</span>
                      </div>
                      
                      {!game.comingSoon && (
                        <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Daily Challenge */}
            <div className="mt-8 bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-xl p-6 border border-amber-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/20 rounded-xl">
                    <Sparkles className="w-8 h-8 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Daily Challenge</h3>
                    <p className="text-amber-400/80">Complete today's challenge for bonus rewards!</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-400">+100 🎖️</p>
                  <p className="text-sm text-gray-400">Proof Bonus</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Score 500+ in Spirit Trivia</p>
                    <p className="text-sm text-gray-400">0 / 500 points</p>
                  </div>
                  <button 
                    onClick={() => setActiveGame('trivia')}
                    className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg font-medium transition"
                  >
                    Play Now
                  </button>
                </div>
              </div>
            </div>

            {/* Achievements Preview */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white mb-4">Recent Achievements</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: '🎯', name: 'First Win', desc: 'Win your first game', unlocked: true },
                  { icon: '🔥', name: 'On Fire', desc: '5 correct answers in a row', unlocked: true },
                  { icon: '🏆', name: 'Champion', desc: 'Score 1000+ points', unlocked: false },
                  { icon: '🧠', name: 'Expert', desc: 'Answer 100 questions correctly', unlocked: false }
                ].map((achievement, i) => (
                  <div 
                    key={i}
                    className={`p-4 rounded-lg ${
                      achievement.unlocked ? 'bg-gray-800' : 'bg-gray-800/50 opacity-60'
                    }`}
                  >
                    <span className="text-3xl mb-2 block">{achievement.icon}</span>
                    <p className="font-medium text-white">{achievement.name}</p>
                    <p className="text-xs text-gray-400">{achievement.desc}</p>
                    {!achievement.unlocked && (
                      <Lock className="w-4 h-4 text-gray-500 mt-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Game Views */}
        {activeGame === 'trivia' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TriviaGame />
          </motion.div>
        )}

        {activeGame === 'blind-tasting' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <BlindTastingGame />
          </motion.div>
        )}
      </main>
    </div>
  );
}
