'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

interface HiddenCard {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  category: string;
  series: string;
  imageUrl: string;
  backgroundGradient: string;
  glowColor: string;
  xpReward: number;
  creditReward: number;
  isSecret: boolean;
  discoveryHint?: string;
  unlockCondition?: string;
  maxSupply?: number;
  currentSupply?: number;
}

interface UserCardProgress {
  discoveredCards: string[];
  totalXP: number;
  totalCredits: number;
  discoveryHistory: Array<{
    cardId: string;
    discoveredAt: string;
    location: string;
  }>;
}

interface CardDiscoveryContextType {
  userProgress: UserCardProgress;
  discoverCard: (cardId: string, location: string) => Promise<boolean>;
  hasDiscovered: (cardId: string) => boolean;
  showDiscoveryModal: boolean;
  discoveredCard: HiddenCard | null;
  closeModal: () => void;
}

// ============================================================================
// RARITY STYLES - Barrel/Whiskey Theme
// ============================================================================

const RARITY_STYLES = {
  common: {
    border: 'border-amber-700',
    bg: 'bg-amber-950/50',
    glow: '',
    text: 'text-amber-600',
    badge: 'bg-amber-900 text-amber-400'
  },
  uncommon: {
    border: 'border-amber-500',
    bg: 'bg-amber-900/40',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    text: 'text-amber-500',
    badge: 'bg-amber-800 text-amber-300'
  },
  rare: {
    border: 'border-orange-500',
    bg: 'bg-orange-900/40',
    glow: 'shadow-[0_0_20px_rgba(249,115,22,0.4)]',
    text: 'text-orange-400',
    badge: 'bg-orange-900 text-orange-300'
  },
  epic: {
    border: 'border-red-600',
    bg: 'bg-red-900/40',
    glow: 'shadow-[0_0_25px_rgba(220,38,38,0.5)]',
    text: 'text-red-400',
    badge: 'bg-red-900 text-red-300'
  },
  legendary: {
    border: 'border-yellow-400',
    bg: 'bg-yellow-900/40',
    glow: 'shadow-[0_0_30px_rgba(250,204,21,0.6)]',
    text: 'text-yellow-400',
    badge: 'bg-yellow-900 text-yellow-300'
  },
  mythic: {
    border: 'border-rose-400',
    bg: 'bg-gradient-to-br from-rose-900/50 via-amber-900/50 to-yellow-900/50',
    glow: 'shadow-[0_0_40px_rgba(251,113,133,0.7)] animate-pulse',
    text: 'text-rose-300',
    badge: 'bg-gradient-to-r from-rose-900 to-amber-900 text-rose-200'
  }
};

// ============================================================================
// HIDDEN CARDS DATABASE - BarrelVerse Theme
// ============================================================================

export const BARRELVERSE_HIDDEN_CARDS: HiddenCard[] = [
  // ============================================
  // DISTILLER SERIES (10 cards) - Founder/Early Adopter
  // ============================================
  {
    id: 'distiller-001',
    name: 'Master Distiller',
    description: 'Awarded to those who first taste the spirit of BarrelVerse.',
    rarity: 'legendary',
    category: 'founder',
    series: 'Distiller Series',
    imageUrl: '/cards/master-distiller.png',
    backgroundGradient: 'from-amber-600 via-yellow-500 to-amber-700',
    glowColor: 'rgba(245,158,11,0.5)',
    xpReward: 500,
    creditReward: 100,
    isSecret: false,
    discoveryHint: 'Be among the first to join BarrelVerse',
    maxSupply: 100
  },
  {
    id: 'distiller-002',
    name: 'Cooper\'s Apprentice',
    description: 'You\'ve begun learning the craft of barrel making.',
    rarity: 'uncommon',
    category: 'founder',
    series: 'Distiller Series',
    imageUrl: '/cards/coopers-apprentice.png',
    backgroundGradient: 'from-amber-700 via-orange-600 to-amber-800',
    glowColor: 'rgba(217,119,6,0.4)',
    xpReward: 100,
    creditReward: 25,
    isSecret: false,
    discoveryHint: 'Create your first barrel collection'
  },
  {
    id: 'distiller-003',
    name: 'Grain Guardian',
    description: 'Protector of the sacred grains that make the mash.',
    rarity: 'rare',
    category: 'founder',
    series: 'Distiller Series',
    imageUrl: '/cards/grain-guardian.png',
    backgroundGradient: 'from-yellow-600 via-amber-500 to-yellow-700',
    glowColor: 'rgba(250,204,21,0.4)',
    xpReward: 200,
    creditReward: 50,
    isSecret: false,
    discoveryHint: 'Explore the grain varieties section'
  },

  // ============================================
  // BARREL ROOM SERIES (15 cards) - Exploration
  // ============================================
  {
    id: 'barrel-001',
    name: 'Rickhouse Explorer',
    description: 'You\'ve wandered through the digital rickhouse.',
    rarity: 'common',
    category: 'exploration',
    series: 'Barrel Room Series',
    imageUrl: '/cards/rickhouse-explorer.png',
    backgroundGradient: 'from-amber-800 via-amber-700 to-amber-900',
    glowColor: 'rgba(180,83,9,0.3)',
    xpReward: 50,
    creditReward: 10,
    isSecret: false,
    discoveryHint: 'Visit all sections of the platform'
  },
  {
    id: 'barrel-002',
    name: 'Angel\'s Share',
    description: 'Like whiskey evaporating through oak, you\'ve discovered a hidden gem.',
    rarity: 'epic',
    category: 'exploration',
    series: 'Barrel Room Series',
    imageUrl: '/cards/angels-share.png',
    backgroundGradient: 'from-purple-600 via-amber-500 to-purple-700',
    glowColor: 'rgba(147,51,234,0.5)',
    xpReward: 300,
    creditReward: 75,
    isSecret: true,
    unlockCondition: 'Find the hidden angel icon'
  },
  {
    id: 'barrel-003',
    name: 'Devil\'s Cut',
    description: 'The spirit that remains in the wood. You\'ve found what others missed.',
    rarity: 'legendary',
    category: 'exploration',
    series: 'Barrel Room Series',
    imageUrl: '/cards/devils-cut.png',
    backgroundGradient: 'from-red-700 via-orange-600 to-red-800',
    glowColor: 'rgba(220,38,38,0.6)',
    xpReward: 400,
    creditReward: 100,
    isSecret: true,
    unlockCondition: 'Konami code on any page'
  },
  {
    id: 'barrel-004',
    name: 'Char Level 4',
    description: 'Maximum char, maximum flavor discovery.',
    rarity: 'rare',
    category: 'exploration',
    series: 'Barrel Room Series',
    imageUrl: '/cards/char-level-4.png',
    backgroundGradient: 'from-gray-800 via-amber-700 to-gray-900',
    glowColor: 'rgba(251,146,60,0.4)',
    xpReward: 200,
    creditReward: 50,
    isSecret: false,
    discoveryHint: 'Visit 4 different pages in one session'
  },

  // ============================================
  // AGE STATEMENT SERIES (12 cards) - Time-Based
  // ============================================
  {
    id: 'age-001',
    name: 'New Make Spirit',
    description: 'Fresh off the still - your first day on BarrelVerse.',
    rarity: 'common',
    category: 'streak',
    series: 'Age Statement Series',
    imageUrl: '/cards/new-make.png',
    backgroundGradient: 'from-slate-300 via-gray-200 to-slate-400',
    glowColor: 'rgba(148,163,184,0.3)',
    xpReward: 25,
    creditReward: 5,
    isSecret: false,
    discoveryHint: 'Visit BarrelVerse for the first time'
  },
  {
    id: 'age-002',
    name: '3 Year Expression',
    description: 'You\'ve been aging nicely for 3 consecutive days.',
    rarity: 'uncommon',
    category: 'streak',
    series: 'Age Statement Series',
    imageUrl: '/cards/3-year.png',
    backgroundGradient: 'from-amber-500 via-amber-400 to-amber-600',
    glowColor: 'rgba(245,158,11,0.3)',
    xpReward: 75,
    creditReward: 20,
    isSecret: false,
    discoveryHint: 'Visit for 3 days in a row'
  },
  {
    id: 'age-003',
    name: '7 Year Reserve',
    description: 'A week of consistent visits. Your dedication is noted.',
    rarity: 'rare',
    category: 'streak',
    series: 'Age Statement Series',
    imageUrl: '/cards/7-year.png',
    backgroundGradient: 'from-orange-500 via-amber-500 to-orange-600',
    glowColor: 'rgba(249,115,22,0.4)',
    xpReward: 150,
    creditReward: 40,
    isSecret: false,
    discoveryHint: 'Visit for 7 days in a row'
  },
  {
    id: 'age-004',
    name: '12 Year Single Barrel',
    description: 'A true collector. 12 days of devoted exploration.',
    rarity: 'epic',
    category: 'streak',
    series: 'Age Statement Series',
    imageUrl: '/cards/12-year.png',
    backgroundGradient: 'from-red-600 via-amber-500 to-red-700',
    glowColor: 'rgba(220,38,38,0.5)',
    xpReward: 300,
    creditReward: 75,
    isSecret: false,
    discoveryHint: 'Visit for 12 days in a row'
  },
  {
    id: 'age-005',
    name: '21 Year Antique',
    description: 'Legendary patience. 21 consecutive days of engagement.',
    rarity: 'legendary',
    category: 'streak',
    series: 'Age Statement Series',
    imageUrl: '/cards/21-year.png',
    backgroundGradient: 'from-yellow-500 via-amber-400 to-yellow-600',
    glowColor: 'rgba(234,179,8,0.6)',
    xpReward: 500,
    creditReward: 125,
    isSecret: false,
    discoveryHint: 'Visit for 21 days in a row'
  },
  {
    id: 'age-006',
    name: 'Pappy Van Winkle',
    description: 'The rarest of the rare. 30 days of perfect attendance.',
    rarity: 'mythic',
    category: 'streak',
    series: 'Age Statement Series',
    imageUrl: '/cards/pappy.png',
    backgroundGradient: 'from-rose-500 via-amber-400 to-rose-600',
    glowColor: 'rgba(244,63,94,0.7)',
    xpReward: 1000,
    creditReward: 250,
    isSecret: false,
    discoveryHint: 'Visit for 30 days in a row',
    maxSupply: 50
  },

  // ============================================
  // TASTING NOTES SERIES (10 cards) - Knowledge
  // ============================================
  {
    id: 'taste-001',
    name: 'Palate Student',
    description: 'You\'ve begun learning the art of tasting.',
    rarity: 'common',
    category: 'knowledge',
    series: 'Tasting Notes Series',
    imageUrl: '/cards/palate-student.png',
    backgroundGradient: 'from-purple-700 via-purple-600 to-purple-800',
    glowColor: 'rgba(126,34,206,0.3)',
    xpReward: 50,
    creditReward: 15,
    isSecret: false,
    discoveryHint: 'Complete your first tasting note'
  },
  {
    id: 'taste-002',
    name: 'Nose Knows',
    description: 'Master of aromas. 10 tasting notes completed.',
    rarity: 'rare',
    category: 'knowledge',
    series: 'Tasting Notes Series',
    imageUrl: '/cards/nose-knows.png',
    backgroundGradient: 'from-pink-600 via-purple-500 to-pink-700',
    glowColor: 'rgba(219,39,119,0.4)',
    xpReward: 200,
    creditReward: 50,
    isSecret: false,
    discoveryHint: 'Complete 10 tasting notes'
  },
  {
    id: 'taste-003',
    name: 'Certified Sommelier',
    description: 'Your expertise in spirits is unmatched.',
    rarity: 'epic',
    category: 'knowledge',
    series: 'Tasting Notes Series',
    imageUrl: '/cards/sommelier.png',
    backgroundGradient: 'from-violet-600 via-purple-500 to-violet-700',
    glowColor: 'rgba(139,92,246,0.5)',
    xpReward: 350,
    creditReward: 85,
    isSecret: false,
    discoveryHint: 'Complete 25 tasting notes'
  },

  // ============================================
  // BOURBON TRAIL SERIES (8 cards) - Regional
  // ============================================
  {
    id: 'trail-001',
    name: 'Kentucky Explorer',
    description: 'You\'ve virtually visited the heart of bourbon country.',
    rarity: 'uncommon',
    category: 'regional',
    series: 'Bourbon Trail Series',
    imageUrl: '/cards/kentucky-explorer.png',
    backgroundGradient: 'from-blue-700 via-blue-600 to-blue-800',
    glowColor: 'rgba(37,99,235,0.4)',
    xpReward: 100,
    creditReward: 30,
    isSecret: false,
    discoveryHint: 'Explore Kentucky distillery profiles'
  },
  {
    id: 'trail-002',
    name: 'Tennessee Traveler',
    description: 'The charcoal mellowing state has your attention.',
    rarity: 'uncommon',
    category: 'regional',
    series: 'Bourbon Trail Series',
    imageUrl: '/cards/tennessee-traveler.png',
    backgroundGradient: 'from-orange-700 via-orange-600 to-orange-800',
    glowColor: 'rgba(234,88,12,0.4)',
    xpReward: 100,
    creditReward: 30,
    isSecret: false,
    discoveryHint: 'Explore Tennessee whiskey profiles'
  },
  {
    id: 'trail-003',
    name: 'Scottish Pilgrim',
    description: 'You\'ve crossed the Atlantic for single malt wisdom.',
    rarity: 'rare',
    category: 'regional',
    series: 'Bourbon Trail Series',
    imageUrl: '/cards/scottish-pilgrim.png',
    backgroundGradient: 'from-teal-700 via-teal-600 to-teal-800',
    glowColor: 'rgba(15,118,110,0.4)',
    xpReward: 175,
    creditReward: 45,
    isSecret: false,
    discoveryHint: 'Explore Scotch whisky profiles'
  },

  // ============================================
  // SECRET STASH (5 cards) - Ultra Rare Easter Eggs
  // ============================================
  {
    id: 'secret-001',
    name: 'Warehouse H',
    description: 'The mythical warehouse where legends are stored.',
    rarity: 'mythic',
    category: 'secret',
    series: 'Secret Stash',
    imageUrl: '/cards/warehouse-h.png',
    backgroundGradient: 'from-black via-amber-900 to-black',
    glowColor: 'rgba(251,191,36,0.8)',
    xpReward: 1500,
    creditReward: 500,
    isSecret: true,
    unlockCondition: 'Type "warehouse h" in search',
    maxSupply: 25
  },
  {
    id: 'secret-002',
    name: 'The Bunghole',
    description: 'You found the hole that gives the barrel its soul.',
    rarity: 'legendary',
    category: 'secret',
    series: 'Secret Stash',
    imageUrl: '/cards/bunghole.png',
    backgroundGradient: 'from-stone-800 via-amber-600 to-stone-900',
    glowColor: 'rgba(168,162,158,0.6)',
    xpReward: 750,
    creditReward: 200,
    isSecret: true,
    unlockCondition: 'Click on a barrel image 7 times'
  },
  {
    id: 'secret-003',
    name: 'Prohibition Runner',
    description: 'You\'ve found the secret speakeasy entrance.',
    rarity: 'epic',
    category: 'secret',
    series: 'Secret Stash',
    imageUrl: '/cards/prohibition-runner.png',
    backgroundGradient: 'from-gray-900 via-gray-700 to-gray-900',
    glowColor: 'rgba(107,114,128,0.5)',
    xpReward: 400,
    creditReward: 100,
    isSecret: true,
    unlockCondition: 'Visit the site between 2-3 AM'
  },
  {
    id: 'secret-004',
    name: 'The White Dog',
    description: 'Raw, unaged spirit. The beginning of all great things.',
    rarity: 'rare',
    category: 'secret',
    series: 'Secret Stash',
    imageUrl: '/cards/white-dog.png',
    backgroundGradient: 'from-slate-200 via-white to-slate-300',
    glowColor: 'rgba(226,232,240,0.5)',
    xpReward: 250,
    creditReward: 60,
    isSecret: true,
    unlockCondition: 'Triple-click the logo'
  },
  {
    id: 'secret-005',
    name: 'Buffalo Trace Legend',
    description: 'You\'ve discovered the most coveted of all secrets.',
    rarity: 'mythic',
    category: 'secret',
    series: 'Secret Stash',
    imageUrl: '/cards/buffalo-trace-legend.png',
    backgroundGradient: 'from-amber-500 via-yellow-400 to-amber-600',
    glowColor: 'rgba(251,191,36,0.9)',
    xpReward: 2000,
    creditReward: 750,
    isSecret: true,
    unlockCondition: 'Collect all other cards first',
    maxSupply: 10
  }
];

// ============================================================================
// CONTEXT PROVIDER
// ============================================================================

const CardDiscoveryContext = createContext<CardDiscoveryContextType | null>(null);

export function CardDiscoveryProvider({ children }: { children: React.ReactNode }) {
  const [userProgress, setUserProgress] = useState<UserCardProgress>({
    discoveredCards: [],
    totalXP: 0,
    totalCredits: 0,
    discoveryHistory: []
  });
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
  const [discoveredCard, setDiscoveredCard] = useState<HiddenCard | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('barrelverse-card-progress');
    if (saved) {
      try {
        setUserProgress(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse card progress:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('barrelverse-card-progress', JSON.stringify(userProgress));
  }, [userProgress]);

  const hasDiscovered = useCallback((cardId: string) => {
    return userProgress.discoveredCards.includes(cardId);
  }, [userProgress.discoveredCards]);

  const discoverCard = useCallback(async (cardId: string, location: string): Promise<boolean> => {
    if (hasDiscovered(cardId)) return false;

    const card = BARRELVERSE_HIDDEN_CARDS.find(c => c.id === cardId);
    if (!card) return false;

    setUserProgress(prev => ({
      ...prev,
      discoveredCards: [...prev.discoveredCards, cardId],
      totalXP: prev.totalXP + card.xpReward,
      totalCredits: prev.totalCredits + card.creditReward,
      discoveryHistory: [
        ...prev.discoveryHistory,
        {
          cardId,
          discoveredAt: new Date().toISOString(),
          location
        }
      ]
    }));

    setDiscoveredCard(card);
    setShowDiscoveryModal(true);

    return true;
  }, [hasDiscovered]);

  const closeModal = useCallback(() => {
    setShowDiscoveryModal(false);
    setDiscoveredCard(null);
  }, []);

  return (
    <CardDiscoveryContext.Provider
      value={{
        userProgress,
        discoverCard,
        hasDiscovered,
        showDiscoveryModal,
        discoveredCard,
        closeModal
      }}
    >
      {children}
      <AnimatePresence>
        {showDiscoveryModal && discoveredCard && (
          <CardDiscoveryModal card={discoveredCard} onClose={closeModal} />
        )}
      </AnimatePresence>
    </CardDiscoveryContext.Provider>
  );
}

export function useCardDiscovery() {
  const context = useContext(CardDiscoveryContext);
  if (!context) {
    throw new Error('useCardDiscovery must be used within CardDiscoveryProvider');
  }
  return context;
}

// ============================================================================
// DISCOVERY MODAL
// ============================================================================

function CardDiscoveryModal({ card, onClose }: { card: HiddenCard; onClose: () => void }) {
  const style = RARITY_STYLES[card.rarity];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, rotateY: 180, opacity: 0 }}
        animate={{ scale: 1, rotateY: 0, opacity: 1 }}
        exit={{ scale: 0.5, rotateY: -180, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Particles */}
        <div className="absolute inset-0 -m-20 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: 0, 
                y: 0, 
                opacity: 1,
                scale: 0 
              }}
              animate={{ 
                x: (Math.random() - 0.5) * 300,
                y: (Math.random() - 0.5) * 300,
                opacity: 0,
                scale: Math.random() * 2 + 1
              }}
              transition={{ 
                duration: 2,
                delay: Math.random() * 0.5,
                ease: 'easeOut'
              }}
              className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
              style={{ backgroundColor: card.glowColor }}
            />
          ))}
        </div>

        {/* Card */}
        <div
          className={`
            relative w-80 rounded-2xl overflow-hidden
            ${style.border} border-4
            ${style.glow}
            bg-gradient-to-br ${card.backgroundGradient}
          `}
        >
          <div className="p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-6xl mb-4"
            >
              🥃
            </motion.div>

            <div className={`text-sm font-medium ${style.text} mb-1`}>
              {card.series}
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {card.name}
            </h2>

            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${style.badge} mb-4`}>
              {card.rarity}
            </span>

            <p className="text-white/80 text-sm mb-6">
              {card.description}
            </p>

            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">+{card.xpReward}</div>
                <div className="text-xs text-white/60">XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">+{card.creditReward}</div>
                <div className="text-xs text-white/60">Credits</div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors"
            >
              Collect Card
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// CARD DISPLAY COMPONENT
// ============================================================================

interface CardDisplayProps {
  card: HiddenCard;
  isDiscovered: boolean;
  showHint?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function HiddenCardDisplay({
  card,
  isDiscovered,
  showHint = false,
  onClick,
  size = 'md'
}: CardDisplayProps) {
  const style = RARITY_STYLES[card.rarity];
  
  const sizeClasses = {
    sm: 'w-32 h-44',
    md: 'w-48 h-64',
    lg: 'w-64 h-80'
  };

  if (!isDiscovered) {
    return (
      <div
        className={`
          ${sizeClasses[size]}
          rounded-xl border-2 border-dashed border-amber-800/50
          bg-amber-950/30 backdrop-blur-sm
          flex flex-col items-center justify-center
          cursor-pointer hover:border-amber-700/70 transition-all
        `}
        onClick={onClick}
      >
        <div className="text-4xl mb-2 opacity-30">🔒</div>
        <div className="text-amber-700 text-xs text-center px-2">
          {card.isSecret ? '???' : 'Undiscovered'}
        </div>
        {showHint && !card.isSecret && (
          <div className="mt-2 text-amber-600/60 text-xs text-center italic px-2">
            Hint: {card.discoveryHint || 'Keep exploring...'}
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`
        ${sizeClasses[size]}
        rounded-xl overflow-hidden
        ${style.border} border-2
        ${style.glow}
        bg-gradient-to-br ${card.backgroundGradient}
        cursor-pointer transition-all
      `}
      onClick={onClick}
    >
      <div className="h-full flex flex-col p-3">
        <div className="text-center mb-2">
          <span className={`text-xs font-medium ${style.text}`}>
            {card.series}
          </span>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <span className="text-4xl">🥃</span>
        </div>
        
        <div className="text-center">
          <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">
            {card.name}
          </h3>
          <span className={`inline-block px-2 py-0.5 rounded text-xs ${style.badge}`}>
            {card.rarity}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// COLLECTION GRID
// ============================================================================

export function CardCollectionGrid() {
  const { userProgress, hasDiscovered } = useCardDiscovery();
  
  const cardsBySeries = BARRELVERSE_HIDDEN_CARDS.reduce((acc, card) => {
    if (!acc[card.series]) acc[card.series] = [];
    acc[card.series].push(card);
    return acc;
  }, {} as Record<string, HiddenCard[]>);

  const totalCards = BARRELVERSE_HIDDEN_CARDS.length;
  const discoveredCount = userProgress.discoveredCards.length;
  const progressPercent = Math.round((discoveredCount / totalCards) * 100);

  return (
    <div className="space-y-8">
      {/* Stats Header */}
      <div className="bg-amber-950/50 rounded-2xl p-6 border border-amber-800/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-amber-100">Your Collection</h2>
          <div className="text-right">
            <div className="text-3xl font-bold text-amber-400">{discoveredCount}/{totalCards}</div>
            <div className="text-amber-600 text-sm">Cards Discovered</div>
          </div>
        </div>
        
        <div className="w-full bg-amber-900/50 rounded-full h-3 mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="bg-gradient-to-r from-amber-500 to-yellow-400 h-3 rounded-full"
          />
        </div>
        <div className="text-amber-500 text-sm text-center">{progressPercent}% Complete</div>

        <div className="flex gap-6 mt-4 justify-center">
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-400">{userProgress.totalXP}</div>
            <div className="text-xs text-amber-600">Total XP</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-amber-400">{userProgress.totalCredits}</div>
            <div className="text-xs text-amber-600">Credits Earned</div>
          </div>
        </div>
      </div>

      {/* Cards by Series */}
      {Object.entries(cardsBySeries).map(([series, cards]) => {
        const seriesDiscovered = cards.filter(c => hasDiscovered(c.id)).length;
        
        return (
          <div key={series} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-amber-200">{series}</h3>
              <span className="text-amber-500 text-sm">
                {seriesDiscovered}/{cards.length} collected
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {cards.map(card => (
                <HiddenCardDisplay
                  key={card.id}
                  card={card}
                  isDiscovered={hasDiscovered(card.id)}
                  showHint={true}
                  size="sm"
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// DISCOVERY HOOK - Monitor User Behavior
// ============================================================================

export function useCardDiscoveryTriggers() {
  const { discoverCard, hasDiscovered } = useCardDiscovery();
  const [visitCount, setVisitCount] = useState(0);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    // Track visit count
    const visits = parseInt(localStorage.getItem('barrelverse-visits') || '0') + 1;
    localStorage.setItem('barrelverse-visits', visits.toString());
    setVisitCount(visits);

    // First visit card
    if (visits === 1 && !hasDiscovered('age-001')) {
      discoverCard('age-001', 'first-visit');
    }

    // Check for streak cards
    checkStreakCards();

    // Set up Konami code listener
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          if (!hasDiscovered('barrel-003')) {
            discoverCard('barrel-003', 'konami-code');
          }
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [discoverCard, hasDiscovered]);

  const checkStreakCards = () => {
    const lastVisit = localStorage.getItem('barrelverse-last-visit');
    const streak = parseInt(localStorage.getItem('barrelverse-streak') || '0');
    const today = new Date().toDateString();
    
    if (lastVisit !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastVisit === yesterday.toDateString()) {
        const newStreak = streak + 1;
        localStorage.setItem('barrelverse-streak', newStreak.toString());
        
        if (newStreak >= 3 && !hasDiscovered('age-002')) {
          discoverCard('age-002', 'streak-3');
        }
        if (newStreak >= 7 && !hasDiscovered('age-003')) {
          discoverCard('age-003', 'streak-7');
        }
        if (newStreak >= 12 && !hasDiscovered('age-004')) {
          discoverCard('age-004', 'streak-12');
        }
        if (newStreak >= 21 && !hasDiscovered('age-005')) {
          discoverCard('age-005', 'streak-21');
        }
        if (newStreak >= 30 && !hasDiscovered('age-006')) {
          discoverCard('age-006', 'streak-30');
        }
      } else {
        localStorage.setItem('barrelverse-streak', '1');
      }
      localStorage.setItem('barrelverse-last-visit', today);
    }
  };

  const trackSearch = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    setSearchHistory(prev => [...prev, lowerQuery]);

    if (lowerQuery.includes('warehouse h') && !hasDiscovered('secret-001')) {
      discoverCard('secret-001', 'search-warehouse-h');
    }
  }, [discoverCard, hasDiscovered]);

  const trackLogoClick = useCallback(() => {
    const clicks = parseInt(localStorage.getItem('barrelverse-logo-clicks') || '0') + 1;
    localStorage.setItem('barrelverse-logo-clicks', clicks.toString());

    if (clicks === 3 && !hasDiscovered('secret-004')) {
      discoverCard('secret-004', 'logo-triple-click');
    }
  }, [discoverCard, hasDiscovered]);

  const trackBarrelClick = useCallback((barrelId: string) => {
    const key = `barrelverse-barrel-clicks-${barrelId}`;
    const clicks = parseInt(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, clicks.toString());

    if (clicks === 7 && !hasDiscovered('secret-002')) {
      discoverCard('secret-002', 'barrel-seven-clicks');
    }
  }, [discoverCard, hasDiscovered]);

  return {
    visitCount,
    trackSearch,
    trackLogoClick,
    trackBarrelClick
  };
}

export default CardDiscoveryProvider;
