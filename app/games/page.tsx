'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Trophy, 
  Brain, 
  Clock, 
  Zap, 
  Star, 
  Award,
  Target,
  Flame,
  ChevronRight,
  CheckCircle,
  XCircle,
  Timer,
  Gift,
  Crown,
  Medal,
  Sparkles
} from 'lucide-react';

// Trivia questions database
const triviaQuestions = [
  // Bourbon Questions
  {
    id: 1,
    category: 'bourbon',
    difficulty: 'easy',
    question: 'What grain must make up at least 51% of the mash bill for a whiskey to be called bourbon?',
    correct_answer: 'Corn',
    wrong_answers: ['Wheat', 'Rye', 'Barley'],
    explanation: 'By law, bourbon must be made from a grain mixture that is at least 51% corn.',
    proof_reward: 10,
  },
  {
    id: 2,
    category: 'bourbon',
    difficulty: 'medium',
    question: 'In what country must bourbon be produced?',
    correct_answer: 'United States',
    wrong_answers: ['Scotland', 'Ireland', 'Canada'],
    explanation: 'Bourbon is a distinctly American spirit and must be produced in the United States.',
    proof_reward: 15,
  },
  {
    id: 3,
    category: 'bourbon',
    difficulty: 'hard',
    question: 'What is the maximum proof at which bourbon can enter the barrel for aging?',
    correct_answer: '125 proof',
    wrong_answers: ['100 proof', '140 proof', '160 proof'],
    explanation: 'Bourbon must enter the barrel at no more than 125 proof (62.5% ABV).',
    proof_reward: 25,
  },
  {
    id: 4,
    category: 'bourbon',
    difficulty: 'easy',
    question: 'What type of barrel must bourbon be aged in?',
    correct_answer: 'New charred oak',
    wrong_answers: ['Used wine barrels', 'Stainless steel', 'Any oak barrel'],
    explanation: 'Bourbon must be aged in new, charred oak containers.',
    proof_reward: 10,
  },
  {
    id: 5,
    category: 'bourbon',
    difficulty: 'medium',
    question: 'Which Kentucky county is known as the "Bourbon Capital of the World"?',
    correct_answer: 'Bourbon County',
    wrong_answers: ['Jefferson County', 'Fayette County', 'Nelson County'],
    explanation: 'Bourbon County, Kentucky gave the spirit its name.',
    proof_reward: 15,
  },
  // Scotch Questions
  {
    id: 6,
    category: 'scotch',
    difficulty: 'easy',
    question: 'What is the minimum aging requirement for Scotch whisky?',
    correct_answer: '3 years',
    wrong_answers: ['1 year', '5 years', '10 years'],
    explanation: 'Scotch must be aged in oak casks for a minimum of 3 years.',
    proof_reward: 10,
  },
  {
    id: 7,
    category: 'scotch',
    difficulty: 'medium',
    question: 'Which region of Scotland is known for heavily peated whiskies?',
    correct_answer: 'Islay',
    wrong_answers: ['Speyside', 'Highland', 'Lowland'],
    explanation: 'Islay is famous for its smoky, peated single malts like Laphroaig and Ardbeg.',
    proof_reward: 15,
  },
  {
    id: 8,
    category: 'scotch',
    difficulty: 'hard',
    question: 'What does "cask strength" mean for Scotch whisky?',
    correct_answer: 'Bottled without water dilution',
    wrong_answers: ['Aged in special casks', 'Double distilled', 'Blended from multiple casks'],
    explanation: 'Cask strength whisky is bottled directly from the cask without adding water.',
    proof_reward: 25,
  },
  // Wine Questions
  {
    id: 9,
    category: 'wine',
    difficulty: 'easy',
    question: 'What grape variety is Champagne traditionally made from?',
    correct_answer: 'Chardonnay, Pinot Noir, Pinot Meunier',
    wrong_answers: ['Cabernet Sauvignon only', 'Merlot only', 'Riesling only'],
    explanation: 'Traditional Champagne uses a blend of these three grape varieties.',
    proof_reward: 10,
  },
  {
    id: 10,
    category: 'wine',
    difficulty: 'medium',
    question: 'What region produces Bordeaux wine?',
    correct_answer: 'France',
    wrong_answers: ['Italy', 'Spain', 'California'],
    explanation: 'Bordeaux is a prestigious wine region in southwestern France.',
    proof_reward: 15,
  },
  // Beer Questions
  {
    id: 11,
    category: 'beer',
    difficulty: 'easy',
    question: 'What are the four main ingredients in beer?',
    correct_answer: 'Water, malt, hops, yeast',
    wrong_answers: ['Water, corn, sugar, yeast', 'Wheat, barley, rice, hops', 'Water, grains, fruit, sugar'],
    explanation: 'The German Reinheitsgebot (purity law) established these as the core ingredients.',
    proof_reward: 10,
  },
  {
    id: 12,
    category: 'beer',
    difficulty: 'medium',
    question: 'What style of beer originated in the Czech city of Plzeň?',
    correct_answer: 'Pilsner',
    wrong_answers: ['Stout', 'IPA', 'Porter'],
    explanation: 'Pilsner was first brewed in Plzeň (Pilsen) in 1842.',
    proof_reward: 15,
  },
  // Rum Questions
  {
    id: 13,
    category: 'rum',
    difficulty: 'easy',
    question: 'What is rum primarily made from?',
    correct_answer: 'Sugarcane or molasses',
    wrong_answers: ['Corn', 'Grapes', 'Potatoes'],
    explanation: 'Rum is distilled from sugarcane juice or molasses.',
    proof_reward: 10,
  },
  {
    id: 14,
    category: 'rum',
    difficulty: 'hard',
    question: 'What Caribbean island is famous for its rhum agricole?',
    correct_answer: 'Martinique',
    wrong_answers: ['Jamaica', 'Barbados', 'Cuba'],
    explanation: 'Martinique\'s rhum agricole is made from fresh sugarcane juice and has AOC status.',
    proof_reward: 25,
  },
  // Tequila Questions
  {
    id: 15,
    category: 'tequila',
    difficulty: 'easy',
    question: 'What plant is tequila made from?',
    correct_answer: 'Blue agave',
    wrong_answers: ['Cactus', 'Aloe vera', 'Corn'],
    explanation: 'Tequila must be made from blue Weber agave grown in designated Mexican regions.',
    proof_reward: 10,
  },
  {
    id: 16,
    category: 'tequila',
    difficulty: 'medium',
    question: 'What does "Añejo" mean for tequila aging?',
    correct_answer: 'Aged 1-3 years',
    wrong_answers: ['Unaged', 'Aged 2 months', 'Aged over 3 years'],
    explanation: 'Añejo tequila is aged in oak barrels for 1-3 years.',
    proof_reward: 15,
  },
  // General Questions
  {
    id: 17,
    category: 'general',
    difficulty: 'medium',
    question: 'What is the "angel\'s share" in whiskey production?',
    correct_answer: 'Alcohol lost to evaporation',
    wrong_answers: ['First pour from the barrel', 'Premium reserve bottles', 'Master distiller\'s portion'],
    explanation: 'The angel\'s share is the portion of whiskey that evaporates during barrel aging.',
    proof_reward: 15,
  },
  {
    id: 18,
    category: 'general',
    difficulty: 'hard',
    question: 'What does ABV stand for?',
    correct_answer: 'Alcohol By Volume',
    wrong_answers: ['American Bourbon Variety', 'Aged Barrel Value', 'Absolute Beverage Verification'],
    explanation: 'ABV measures the percentage of alcohol in a beverage.',
    proof_reward: 10,
  },
  {
    id: 19,
    category: 'bourbon',
    difficulty: 'hard',
    question: 'What famous bourbon brand features a horse and jockey on its stopper?',
    correct_answer: "Blanton's",
    wrong_answers: ["Maker's Mark", 'Woodford Reserve', 'Wild Turkey'],
    explanation: "Blanton's features collectible horse and jockey stoppers spelling B-L-A-N-T-O-N-S.",
    proof_reward: 25,
  },
  {
    id: 20,
    category: 'bourbon',
    difficulty: 'medium',
    question: 'What is "bottled-in-bond" bourbon?',
    correct_answer: 'Aged 4+ years, 100 proof, single distillery/season',
    wrong_answers: ['Any premium bourbon', 'Bourbon aged in bonded warehouses', 'Export-only bourbon'],
    explanation: 'The Bottled-in-Bond Act of 1897 established strict quality standards.',
    proof_reward: 20,
  },
];

// Game modes
const gameModes = [
  {
    id: 'quick_play',
    name: 'Quick Play',
    description: '10 random questions, no time limit',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    questions: 10,
    timeLimit: null,
    proofMultiplier: 1,
  },
  {
    id: 'time_attack',
    name: 'Time Attack',
    description: '15 questions in 3 minutes',
    icon: Clock,
    color: 'from-red-500 to-pink-600',
    questions: 15,
    timeLimit: 180,
    proofMultiplier: 1.5,
  },
  {
    id: 'expert_challenge',
    name: 'Expert Challenge',
    description: 'Hard questions only, double rewards',
    icon: Brain,
    color: 'from-purple-500 to-indigo-600',
    questions: 10,
    timeLimit: null,
    proofMultiplier: 2,
    difficulty: 'hard',
  },
  {
    id: 'daily_challenge',
    name: 'Daily Challenge',
    description: 'New challenge every day, bonus rewards',
    icon: Star,
    color: 'from-yellow-500 to-amber-600',
    questions: 5,
    timeLimit: null,
    proofMultiplier: 3,
    daily: true,
  },
];

// Leaderboard data (mock)
const leaderboardData = [
  { rank: 1, username: 'BourbonMaster', score: 15420, streak: 45, avatar: '🥃' },
  { rank: 2, username: 'WhiskeyWizard', score: 14200, streak: 38, avatar: '🧙' },
  { rank: 3, username: 'SpiritSeeker', score: 13800, streak: 32, avatar: '🔮' },
  { rank: 4, username: 'BarrelBaron', score: 12500, streak: 28, avatar: '🛢️' },
  { rank: 5, username: 'ProofPro', score: 11900, streak: 25, avatar: '📊' },
  { rank: 6, username: 'MaltMaven', score: 10800, streak: 22, avatar: '🌾' },
  { rank: 7, username: 'CaskKing', score: 9500, streak: 19, avatar: '👑' },
  { rank: 8, username: 'DistilleryDiva', score: 8900, streak: 17, avatar: '💃' },
  { rank: 9, username: 'OakObsessed', score: 8200, streak: 15, avatar: '🌳' },
  { rank: 10, username: 'TastingTitan', score: 7800, streak: 12, avatar: '🏆' },
];

export default function GamesPage() {
  const [selectedMode, setSelectedMode] = useState<typeof gameModes[0] | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [proofEarned, setProofEarned] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean; question: typeof triviaQuestions[0] }[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<typeof triviaQuestions>([]);
  const [streak, setStreak] = useState(0);

  // Shuffle and select questions based on game mode
  const initializeGame = useCallback((mode: typeof gameModes[0]) => {
    let questions = [...triviaQuestions];
    
    // Filter by difficulty if specified
    if (mode.difficulty) {
      questions = questions.filter(q => q.difficulty === mode.difficulty);
    }
    
    // Shuffle questions
    questions = questions.sort(() => Math.random() - 0.5);
    
    // Take required number of questions
    questions = questions.slice(0, mode.questions);
    
    // Shuffle answers for each question
    questions = questions.map(q => ({
      ...q,
      shuffledAnswers: [q.correct_answer, ...q.wrong_answers].sort(() => Math.random() - 0.5),
    }));
    
    setShuffledQuestions(questions as typeof triviaQuestions);
    setCurrentQuestion(0);
    setScore(0);
    setProofEarned(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimeLeft(mode.timeLimit || null);
    setGameState('playing');
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState !== 'playing' || timeLeft === null) return;
    
    if (timeLeft <= 0) {
      setGameState('results');
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    
    const question = shuffledQuestions[currentQuestion];
    const isCorrect = answer === question.correct_answer;
    
    setSelectedAnswer(answer);
    setShowExplanation(true);
    
    if (isCorrect) {
      const multiplier = selectedMode?.proofMultiplier || 1;
      const points = question.proof_reward * multiplier;
      setScore(prev => prev + 100);
      setProofEarned(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
    
    setAnswers(prev => [...prev, { correct: isCorrect, question }]);
  };

  const nextQuestion = () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setGameState('results');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Menu View
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900">
        {/* Header */}
        <header className="border-b border-amber-700/50 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-amber-400">🥃 BarrelVerse</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-amber-100 font-medium">2,450 PROOF</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Brain className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Spirit Trivia
            </h1>
            <p className="text-xl text-amber-200 max-w-2xl mx-auto">
              Test your knowledge of bourbon, scotch, wine, and more. Earn PROOF tokens and climb the leaderboard!
            </p>
          </div>

          {/* Game Modes */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {gameModes.map((mode, index) => (
              <motion.button
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  setSelectedMode(mode);
                  initializeGame(mode);
                }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 border border-amber-500/30 p-6 text-left hover:border-amber-400 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <mode.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{mode.name}</h3>
                <p className="text-amber-200/70 text-sm mb-4">{mode.description}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-amber-400">
                    {mode.questions} questions
                  </span>
                  {mode.timeLimit && (
                    <span className="text-amber-400">
                      {formatTime(mode.timeLimit)}
                    </span>
                  )}
                </div>
                
                {mode.proofMultiplier > 1 && (
                  <div className="absolute top-4 right-4 bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                    {mode.proofMultiplier}x PROOF
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Stats & Leaderboard */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Your Stats */}
            <div className="bg-stone-800/50 rounded-2xl border border-amber-500/30 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Your Stats
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-amber-200/70">Games Played</span>
                  <span className="text-white font-bold">47</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-amber-200/70">Total PROOF Earned</span>
                  <span className="text-amber-400 font-bold">2,450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-amber-200/70">Best Streak</span>
                  <span className="text-white font-bold flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    12
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-amber-200/70">Accuracy</span>
                  <span className="text-green-400 font-bold">78%</span>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="lg:col-span-2 bg-stone-800/50 rounded-2xl border border-amber-500/30 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Global Leaderboard
              </h2>
              
              <div className="space-y-3">
                {leaderboardData.slice(0, 5).map((player, index) => (
                  <div
                    key={player.rank}
                    className={`flex items-center gap-4 p-3 rounded-xl ${
                      index === 0 ? 'bg-gradient-to-r from-amber-500/20 to-transparent' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400/20 to-transparent' :
                      index === 2 ? 'bg-gradient-to-r from-orange-600/20 to-transparent' :
                      'bg-stone-700/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-amber-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-stone-600 text-white'
                    }`}>
                      {player.rank}
                    </div>
                    <span className="text-2xl">{player.avatar}</span>
                    <div className="flex-1">
                      <p className="text-white font-medium">{player.username}</p>
                      <p className="text-amber-200/60 text-sm">
                        <Flame className="w-3 h-3 inline text-orange-500" /> {player.streak} day streak
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-400 font-bold">{player.score.toLocaleString()}</p>
                      <p className="text-amber-200/60 text-sm">PROOF</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Rewards */}
          <div className="mt-8 bg-gradient-to-r from-purple-900/50 to-amber-900/50 rounded-2xl border border-purple-500/30 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Daily Bonus Available!</h3>
                  <p className="text-purple-200">Complete the Daily Challenge for 3x PROOF rewards</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const dailyMode = gameModes.find(m => m.id === 'daily_challenge')!;
                  setSelectedMode(dailyMode);
                  initializeGame(dailyMode);
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                Play Daily Challenge
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Playing View
  if (gameState === 'playing' && shuffledQuestions.length > 0) {
    const question = shuffledQuestions[currentQuestion] as typeof triviaQuestions[0] & { shuffledAnswers: string[] };
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900">
        {/* Game Header */}
        <header className="border-b border-amber-700/50 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setGameState('menu')}
                  className="text-amber-400 hover:text-amber-300"
                >
                  ← Exit
                </button>
                <span className="text-amber-100 font-medium">
                  {selectedMode?.name}
                </span>
              </div>
              
              <div className="flex items-center gap-6">
                {timeLeft !== null && (
                  <div className={`flex items-center gap-2 ${timeLeft < 30 ? 'text-red-400' : 'text-amber-400'}`}>
                    <Timer className="w-5 h-5" />
                    <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-amber-100">
                  <span>Question</span>
                  <span className="font-bold text-amber-400">
                    {currentQuestion + 1}/{shuffledQuestions.length}
                  </span>
                </div>
                
                {streak > 0 && (
                  <div className="flex items-center gap-1 bg-orange-500/20 px-3 py-1 rounded-full">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-400 font-bold">{streak}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4 h-2 bg-stone-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / shuffledQuestions.length) * 100}%` }}
              />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Question Card */}
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-stone-800/50 rounded-2xl border border-amber-500/30 p-8 mb-6"
          >
            {/* Category & Difficulty */}
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium capitalize">
                {question.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                question.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                question.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {question.difficulty}
              </span>
              <span className="ml-auto text-amber-400 font-medium">
                +{question.proof_reward * (selectedMode?.proofMultiplier || 1)} PROOF
              </span>
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold text-white mb-8">
              {question.question}
            </h2>

            {/* Answers */}
            <div className="grid gap-4">
              {question.shuffledAnswers.map((answer, index) => {
                const isSelected = selectedAnswer === answer;
                const isCorrect = answer === question.correct_answer;
                const showResult = selectedAnswer !== null;
                
                let buttonClass = 'bg-stone-700/50 border-stone-600 hover:border-amber-400 hover:bg-stone-700';
                if (showResult) {
                  if (isCorrect) {
                    buttonClass = 'bg-green-500/20 border-green-500';
                  } else if (isSelected && !isCorrect) {
                    buttonClass = 'bg-red-500/20 border-red-500';
                  } else {
                    buttonClass = 'bg-stone-700/30 border-stone-700 opacity-50';
                  }
                }
                
                return (
                  <motion.button
                    key={answer}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleAnswer(answer)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${buttonClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{answer}</span>
                      {showResult && isCorrect && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-stone-800/50 rounded-2xl border border-amber-500/30 p-6 mb-6"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedAnswer === question.correct_answer 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {selectedAnswer === question.correct_answer ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <XCircle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold mb-2 ${
                      selectedAnswer === question.correct_answer ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedAnswer === question.correct_answer ? 'Correct!' : 'Incorrect'}
                    </h3>
                    <p className="text-amber-200/80">{question.explanation}</p>
                  </div>
                </div>
                
                <button
                  onClick={nextQuestion}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                >
                  {currentQuestion < shuffledQuestions.length - 1 ? 'Next Question' : 'See Results'}
                  <ChevronRight className="w-5 h-5 inline ml-2" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Score Display */}
          <div className="flex justify-center gap-8 text-center">
            <div>
              <p className="text-amber-200/60 text-sm">Score</p>
              <p className="text-2xl font-bold text-white">{score}</p>
            </div>
            <div>
              <p className="text-amber-200/60 text-sm">PROOF Earned</p>
              <p className="text-2xl font-bold text-amber-400">+{proofEarned}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Results View
  if (gameState === 'results') {
    const correctCount = answers.filter(a => a.correct).length;
    const accuracy = Math.round((correctCount / answers.length) * 100);
    const isPerfect = correctCount === answers.length;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900">
        <main className="container mx-auto px-4 py-12 max-w-2xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            {/* Trophy Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="mb-8"
            >
              {isPerfect ? (
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/30">
                  <Crown className="w-16 h-16 text-white" />
                </div>
              ) : accuracy >= 70 ? (
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30">
                  <Trophy className="w-16 h-16 text-white" />
                </div>
              ) : (
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                  <Medal className="w-16 h-16 text-white" />
                </div>
              )}
            </motion.div>

            <h1 className="text-4xl font-bold text-white mb-2">
              {isPerfect ? 'Perfect Score!' : accuracy >= 70 ? 'Great Job!' : 'Good Effort!'}
            </h1>
            <p className="text-amber-200 text-lg mb-8">
              {isPerfect 
                ? 'You got every question right!' 
                : `You got ${correctCount} out of ${answers.length} correct`}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-stone-800/50 rounded-xl p-4 border border-amber-500/30">
                <p className="text-amber-200/60 text-sm mb-1">Score</p>
                <p className="text-3xl font-bold text-white">{score}</p>
              </div>
              <div className="bg-stone-800/50 rounded-xl p-4 border border-amber-500/30">
                <p className="text-amber-200/60 text-sm mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-green-400">{accuracy}%</p>
              </div>
              <div className="bg-stone-800/50 rounded-xl p-4 border border-amber-500/30">
                <p className="text-amber-200/60 text-sm mb-1">PROOF Earned</p>
                <p className="text-3xl font-bold text-amber-400">+{proofEarned}</p>
              </div>
            </div>

            {/* Bonus */}
            {isPerfect && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-4 border border-amber-500/50 mb-8"
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-400 font-bold">Perfect Game Bonus: +50 PROOF</span>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setGameState('menu')}
                className="px-6 py-3 bg-stone-700 text-white font-bold rounded-xl hover:bg-stone-600 transition-colors"
              >
                Back to Menu
              </button>
              <button
                onClick={() => selectedMode && initializeGame(selectedMode)}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all"
              >
                Play Again
              </button>
            </div>

            {/* Answer Review */}
            <div className="mt-12 text-left">
              <h3 className="text-xl font-bold text-white mb-4">Answer Review</h3>
              <div className="space-y-3">
                {answers.map((answer, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${
                      answer.correct 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {answer.correct ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      )}
                      <div>
                        <p className="text-white font-medium">{answer.question.question}</p>
                        <p className="text-amber-200/70 text-sm mt-1">
                          Correct: {answer.question.correct_answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return null;
}
