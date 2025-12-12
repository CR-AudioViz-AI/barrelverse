'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, EyeOff, Wine, Check, X, Star, 
  ArrowRight, RotateCcw, Trophy, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Spirit {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  flavor_profile?: string[];
  region?: string;
  age_statement?: string;
}

interface TastingNote {
  color: string;
  nose: string[];
  palate: string[];
  finish: string;
}

interface GameRound {
  spirit: Spirit;
  hints: TastingNote;
  options: Spirit[];
  revealed: boolean;
  correct: boolean | null;
}

const COLORS = ['pale gold', 'amber', 'deep amber', 'mahogany', 'copper', 'golden', 'light straw'];
const NOSE_NOTES = [
  'vanilla', 'caramel', 'oak', 'honey', 'citrus', 'floral', 'spice', 'smoke',
  'peat', 'fruit', 'nuts', 'chocolate', 'coffee', 'leather', 'tobacco'
];
const PALATE_NOTES = [
  'sweet', 'spicy', 'oaky', 'smooth', 'bold', 'rich', 'light', 'complex',
  'balanced', 'dry', 'warming', 'creamy', 'tannic', 'mineral'
];
const FINISH_NOTES = ['short', 'medium', 'long', 'lingering', 'warming', 'smooth', 'dry', 'complex'];

export default function BlindTastingGame() {
  const [spirits, setSpirits] = useState<Spirit[]>([]);
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [roundNumber, setRoundNumber] = useState(0);
  const [score, setScore] = useState(0);
  const [totalRounds] = useState(5);
  const [gameStatus, setGameStatus] = useState<'loading' | 'ready' | 'playing' | 'revealed' | 'finished'>('loading');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  
  const supabase = createClient();

  useEffect(() => {
    loadSpirits();
  }, []);

  const loadSpirits = async () => {
    try {
      const { data, error } = await supabase
        .from('bv_spirits')
        .select('id, name, brand, category, subcategory, region, age_statement')
        .in('category', ['bourbon', 'scotch', 'rye', 'irish', 'japanese'])
        .limit(100);
      
      if (error) throw error;
      setSpirits(data || []);
      setGameStatus('ready');
    } catch (error) {
      console.error('Error loading spirits:', error);
    }
  };

  const generateTastingNotes = (spirit: Spirit): TastingNote => {
    // Generate pseudo-random but consistent notes based on category
    const categoryNotes: Record<string, { nose: string[], palate: string[], finish: string }> = {
      bourbon: {
        nose: ['vanilla', 'caramel', 'oak', 'honey'],
        palate: ['sweet', 'oaky', 'warming', 'rich'],
        finish: 'medium to long, warming'
      },
      scotch: {
        nose: ['smoke', 'peat', 'honey', 'fruit'],
        palate: ['complex', 'smooth', 'spicy', 'dry'],
        finish: 'long, lingering'
      },
      rye: {
        nose: ['spice', 'fruit', 'oak', 'floral'],
        palate: ['spicy', 'bold', 'dry', 'complex'],
        finish: 'medium, spicy'
      },
      irish: {
        nose: ['honey', 'vanilla', 'fruit', 'floral'],
        palate: ['smooth', 'light', 'sweet', 'balanced'],
        finish: 'short to medium, smooth'
      },
      japanese: {
        nose: ['floral', 'fruit', 'honey', 'oak'],
        palate: ['balanced', 'smooth', 'complex', 'light'],
        finish: 'medium, elegant'
      }
    };

    const notes = categoryNotes[spirit.category] || categoryNotes.bourbon;
    
    return {
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      nose: notes.nose.slice(0, 3),
      palate: notes.palate.slice(0, 3),
      finish: notes.finish
    };
  };

  const startGame = () => {
    setScore(0);
    setRoundNumber(0);
    nextRound();
  };

  const nextRound = () => {
    if (roundNumber >= totalRounds) {
      finishGame();
      return;
    }

    // Select random spirit
    const availableSpirits = spirits.filter(s => s.category);
    const targetSpirit = availableSpirits[Math.floor(Math.random() * availableSpirits.length)];
    
    // Generate options (3 wrong + 1 correct)
    const sameCategory = availableSpirits.filter(s => 
      s.category === targetSpirit.category && s.id !== targetSpirit.id
    );
    const wrongOptions = sameCategory
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [...wrongOptions, targetSpirit].sort(() => Math.random() - 0.5);
    
    setCurrentRound({
      spirit: targetSpirit,
      hints: generateTastingNotes(targetSpirit),
      options,
      revealed: false,
      correct: null
    });
    
    setRoundNumber(prev => prev + 1);
    setHintsRevealed(0);
    setSelectedAnswer(null);
    setGameStatus('playing');
  };

  const revealHint = () => {
    setHintsRevealed(prev => Math.min(prev + 1, 4));
  };

  const makeGuess = (spiritId: string) => {
    if (!currentRound || gameStatus !== 'playing') return;
    
    setSelectedAnswer(spiritId);
    const isCorrect = spiritId === currentRound.spirit.id;
    
    // Calculate points (more hints = fewer points)
    const basePoints = 100;
    const hintPenalty = hintsRevealed * 15;
    const points = isCorrect ? Math.max(basePoints - hintPenalty, 25) : 0;
    
    if (isCorrect) {
      setScore(prev => prev + points);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
    
    setCurrentRound(prev => prev ? { ...prev, revealed: true, correct: isCorrect } : null);
    setGameStatus('revealed');
    
    // Auto-advance after delay
    setTimeout(() => {
      if (roundNumber >= totalRounds) {
        finishGame();
      } else {
        nextRound();
      }
    }, 3000);
  };

  const finishGame = async () => {
    setGameStatus('finished');
    
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    
    // Save score
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('bv_game_sessions').insert({
          user_id: user.id,
          game_type: 'blind_tasting',
          score,
          questions_answered: totalRounds,
          correct_answers: Math.floor(score / 50), // Approximate
          duration_seconds: totalRounds * 60
        });
      }
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Wine className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Blind Tasting</h2>
              <p className="text-purple-300 text-sm">Identify the spirit from tasting notes</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-purple-400 text-xs uppercase">Score</p>
            <p className="text-2xl font-bold text-white">{score}</p>
          </div>
        </div>
        
        {gameStatus === 'playing' && (
          <div className="mt-3 flex gap-1">
            {Array.from({ length: totalRounds }).map((_, i) => (
              <div 
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i < roundNumber - 1 ? 'bg-purple-500' :
                  i === roundNumber - 1 ? 'bg-purple-400 animate-pulse' :
                  'bg-gray-700'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Ready State */}
        {gameStatus === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gray-800 rounded-xl p-8 text-center"
          >
            <EyeOff className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Ready to Test Your Palate?</h3>
            <p className="text-gray-400 mb-6">
              You'll receive tasting notes for a mystery spirit. Use the hints to identify it!
              The fewer hints you use, the more points you earn.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-left">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <p className="text-purple-400 font-medium mb-1">🎯 {totalRounds} Rounds</p>
                <p className="text-sm text-gray-400">Identify {totalRounds} different spirits</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <p className="text-purple-400 font-medium mb-1">💡 4 Hints Per Round</p>
                <p className="text-sm text-gray-400">Color, nose, palate, finish</p>
              </div>
            </div>
            
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition"
            >
              Start Tasting
            </button>
          </motion.div>
        )}

        {/* Playing State */}
        {(gameStatus === 'playing' || gameStatus === 'revealed') && currentRound && (
          <motion.div
            key={`round-${roundNumber}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            {/* Tasting Notes Card */}
            <div className="bg-gray-800 rounded-xl p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Tasting Notes</h3>
                <span className="text-purple-400 text-sm">Round {roundNumber}/{totalRounds}</span>
              </div>
              
              <div className="space-y-4">
                {/* Color - Always shown */}
                <div className={`transition-all ${hintsRevealed >= 0 ? 'opacity-100' : 'opacity-30'}`}>
                  <p className="text-sm text-gray-400 mb-1">Color</p>
                  <p className="text-white font-medium capitalize">{currentRound.hints.color}</p>
                </div>
                
                {/* Nose */}
                <div className={`transition-all ${hintsRevealed >= 1 ? 'opacity-100' : 'opacity-30 blur-sm'}`}>
                  <p className="text-sm text-gray-400 mb-1">Nose</p>
                  {hintsRevealed >= 1 ? (
                    <p className="text-white font-medium capitalize">{currentRound.hints.nose.join(', ')}</p>
                  ) : (
                    <p className="text-gray-500">Click "Reveal Hint" to see</p>
                  )}
                </div>
                
                {/* Palate */}
                <div className={`transition-all ${hintsRevealed >= 2 ? 'opacity-100' : 'opacity-30 blur-sm'}`}>
                  <p className="text-sm text-gray-400 mb-1">Palate</p>
                  {hintsRevealed >= 2 ? (
                    <p className="text-white font-medium capitalize">{currentRound.hints.palate.join(', ')}</p>
                  ) : (
                    <p className="text-gray-500">Click "Reveal Hint" to see</p>
                  )}
                </div>
                
                {/* Finish */}
                <div className={`transition-all ${hintsRevealed >= 3 ? 'opacity-100' : 'opacity-30 blur-sm'}`}>
                  <p className="text-sm text-gray-400 mb-1">Finish</p>
                  {hintsRevealed >= 3 ? (
                    <p className="text-white font-medium capitalize">{currentRound.hints.finish}</p>
                  ) : (
                    <p className="text-gray-500">Click "Reveal Hint" to see</p>
                  )}
                </div>
              </div>
              
              {gameStatus === 'playing' && hintsRevealed < 3 && (
                <button
                  onClick={revealHint}
                  className="mt-4 flex items-center gap-2 text-purple-400 hover:text-purple-300 transition"
                >
                  <Eye className="w-4 h-4" />
                  Reveal Next Hint (-15 points)
                </button>
              )}
            </div>
            
            {/* Answer Options */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h4 className="text-sm text-gray-400 mb-3">What spirit is this?</h4>
              <div className="grid grid-cols-2 gap-3">
                {currentRound.options.map((option) => {
                  const isSelected = selectedAnswer === option.id;
                  const isCorrect = option.id === currentRound.spirit.id;
                  const showResult = gameStatus === 'revealed';
                  
                  let buttonClass = 'bg-gray-700 hover:bg-gray-600 border-gray-600';
                  if (showResult) {
                    if (isCorrect) {
                      buttonClass = 'bg-green-500/20 border-green-500';
                    } else if (isSelected) {
                      buttonClass = 'bg-red-500/20 border-red-500';
                    }
                  }
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => makeGuess(option.id)}
                      disabled={gameStatus !== 'playing'}
                      className={`p-4 rounded-lg border-2 text-left transition ${buttonClass} disabled:cursor-not-allowed`}
                    >
                      <p className="font-medium text-white">{option.name}</p>
                      <p className="text-sm text-gray-400">{option.brand}</p>
                      {showResult && isCorrect && (
                        <Check className="w-5 h-5 text-green-400 mt-2" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <X className="w-5 h-5 text-red-400 mt-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Finished State */}
        {gameStatus === 'finished' && (
          <motion.div
            key="finished"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-8 text-center"
          >
            <Trophy className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Tasting Complete!</h2>
            
            <div className="text-5xl font-bold text-purple-400 my-6">{score}</div>
            
            <div className="mb-6">
              {score >= 400 ? (
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <Sparkles className="w-5 h-5" />
                  <span>Master Sommelier Level!</span>
                </div>
              ) : score >= 250 ? (
                <p className="text-green-400">Excellent palate!</p>
              ) : score >= 100 ? (
                <p className="text-blue-400">Good tasting skills!</p>
              ) : (
                <p className="text-gray-400">Keep practicing!</p>
              )}
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => { setGameStatus('ready'); setScore(0); setRoundNumber(0); }}
                className="flex items-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
              <button
                onClick={() => window.location.href = '/games'}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
              >
                More Games
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
