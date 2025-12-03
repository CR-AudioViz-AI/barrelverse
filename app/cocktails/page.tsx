'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Cocktail {
  id: string;
  name: string;
  base_spirit: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prep_time: number;
  ingredients: string[];
  garnish: string;
  glassware: string;
  image_url?: string;
}

// Sample cocktails until DB table is created
const SAMPLE_COCKTAILS: Cocktail[] = [
  {
    id: '1',
    name: 'Old Fashioned',
    base_spirit: 'bourbon',
    description: 'The quintessential whiskey cocktail. Simple, elegant, and timeless.',
    difficulty: 'easy',
    prep_time: 5,
    ingredients: ['2 oz bourbon', '1 sugar cube', '2-3 dashes Angostura bitters', 'Orange peel'],
    garnish: 'Orange peel, Luxardo cherry',
    glassware: 'Rocks glass'
  },
  {
    id: '2',
    name: 'Manhattan',
    base_spirit: 'rye',
    description: 'A sophisticated classic that showcases the depth of rye whiskey.',
    difficulty: 'easy',
    prep_time: 5,
    ingredients: ['2 oz rye whiskey', '1 oz sweet vermouth', '2 dashes Angostura bitters'],
    garnish: 'Luxardo cherry',
    glassware: 'Coupe or martini glass'
  },
  {
    id: '3',
    name: 'Whiskey Sour',
    base_spirit: 'bourbon',
    description: 'Perfectly balanced sweet and sour with a silky texture from egg white.',
    difficulty: 'medium',
    prep_time: 7,
    ingredients: ['2 oz bourbon', '3/4 oz lemon juice', '1/2 oz simple syrup', '1 egg white (optional)'],
    garnish: 'Angostura bitters drops, cherry',
    glassware: 'Coupe or rocks glass'
  },
  {
    id: '4',
    name: 'Mint Julep',
    base_spirit: 'bourbon',
    description: 'The official drink of the Kentucky Derby. Refreshing and cooling.',
    difficulty: 'medium',
    prep_time: 5,
    ingredients: ['2.5 oz bourbon', '0.5 oz simple syrup', '8-10 mint leaves', 'Crushed ice'],
    garnish: 'Large mint sprig',
    glassware: 'Julep cup'
  },
  {
    id: '5',
    name: 'Boulevardier',
    base_spirit: 'bourbon',
    description: 'A whiskey lover\'s Negroni. Bold, bitter, and beautiful.',
    difficulty: 'easy',
    prep_time: 5,
    ingredients: ['1.5 oz bourbon', '1 oz Campari', '1 oz sweet vermouth'],
    garnish: 'Orange peel',
    glassware: 'Rocks glass'
  },
  {
    id: '6',
    name: 'Penicillin',
    base_spirit: 'scotch',
    description: 'Modern classic combining honey, ginger, and smoky scotch.',
    difficulty: 'medium',
    prep_time: 10,
    ingredients: ['2 oz blended scotch', '0.75 oz lemon juice', '0.75 oz honey-ginger syrup', 'Islay scotch float'],
    garnish: 'Candied ginger',
    glassware: 'Rocks glass'
  },
  {
    id: '7',
    name: 'Rusty Nail',
    base_spirit: 'scotch',
    description: 'Sweet and smooth, perfect for after-dinner sipping.',
    difficulty: 'easy',
    prep_time: 3,
    ingredients: ['1.5 oz scotch', '0.75 oz Drambuie'],
    garnish: 'Lemon twist',
    glassware: 'Rocks glass'
  },
  {
    id: '8',
    name: 'Blood and Sand',
    base_spirit: 'scotch',
    description: 'Named after a 1922 film, fruity and complex.',
    difficulty: 'medium',
    prep_time: 7,
    ingredients: ['0.75 oz scotch', '0.75 oz sweet vermouth', '0.75 oz Cherry Heering', '0.75 oz orange juice'],
    garnish: 'Orange peel',
    glassware: 'Coupe'
  },
  {
    id: '9',
    name: 'Irish Coffee',
    base_spirit: 'irish_whiskey',
    description: 'Warming, creamy, and perfect for cold nights.',
    difficulty: 'medium',
    prep_time: 8,
    ingredients: ['1.5 oz Irish whiskey', '6 oz hot coffee', '1 tbsp brown sugar', 'Fresh cream'],
    garnish: 'Floating cream layer',
    glassware: 'Irish coffee mug'
  },
  {
    id: '10',
    name: 'Paper Plane',
    base_spirit: 'bourbon',
    description: 'Modern classic with equal parts creating perfect balance.',
    difficulty: 'easy',
    prep_time: 5,
    ingredients: ['0.75 oz bourbon', '0.75 oz Aperol', '0.75 oz Amaro Nonino', '0.75 oz lemon juice'],
    garnish: 'None',
    glassware: 'Coupe'
  },
  {
    id: '11',
    name: 'Sazerac',
    base_spirit: 'rye',
    description: 'New Orleans original, considered America\'s first cocktail.',
    difficulty: 'hard',
    prep_time: 10,
    ingredients: ['2 oz rye whiskey', '1 sugar cube', '3 dashes Peychaud\'s bitters', 'Absinthe rinse'],
    garnish: 'Lemon peel (expressed, discarded)',
    glassware: 'Rocks glass'
  },
  {
    id: '12',
    name: 'Gold Rush',
    base_spirit: 'bourbon',
    description: 'A modern classic - honey sweetness with bourbon warmth.',
    difficulty: 'easy',
    prep_time: 5,
    ingredients: ['2 oz bourbon', '0.75 oz honey syrup', '0.75 oz lemon juice'],
    garnish: 'None',
    glassware: 'Rocks glass'
  }
];

const SPIRIT_TYPES = ['all', 'bourbon', 'rye', 'scotch', 'irish_whiskey'];
const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'];

export default function CocktailsPage() {
  const [cocktails] = useState<Cocktail[]>(SAMPLE_COCKTAILS);
  const [selectedSpirit, setSelectedSpirit] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCocktail, setSelectedCocktail] = useState<Cocktail | null>(null);

  const filteredCocktails = cocktails.filter(c => {
    const matchesSpirit = selectedSpirit === 'all' || c.base_spirit === selectedSpirit;
    const matchesDifficulty = selectedDifficulty === 'all' || c.difficulty === selectedDifficulty;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpirit && matchesDifficulty && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSpiritEmoji = (spirit: string) => {
    switch (spirit) {
      case 'bourbon': return '🥃';
      case 'rye': return '🌾';
      case 'scotch': return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
      case 'irish_whiskey': return '🍀';
      default: return '🥃';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-amber-950/20 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/40 via-amber-800/30 to-amber-900/40 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/" className="text-amber-400 hover:text-amber-300 mb-4 inline-flex items-center gap-2">
            ← Back to BarrelVerse
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-amber-100 mt-4">
            🍸 Cocktail Laboratory
          </h1>
          <p className="text-amber-200/70 text-lg mt-2">
            Master classic and modern whiskey cocktails
          </p>
          <div className="flex gap-6 mt-4 text-sm">
            <span className="text-amber-400">{cocktails.length} Recipes</span>
            <span className="text-amber-400">•</span>
            <span className="text-amber-200/60">From classics to modern creations</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-amber-500/10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="text-amber-200/60 text-sm mb-2 block">Search</label>
              <input
                type="text"
                placeholder="Search cocktails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900/50 border border-amber-500/20 rounded-lg px-4 py-2 text-amber-100 placeholder-amber-200/30 focus:border-amber-500 focus:outline-none"
              />
            </div>
            
            {/* Spirit Filter */}
            <div>
              <label className="text-amber-200/60 text-sm mb-2 block">Base Spirit</label>
              <select
                value={selectedSpirit}
                onChange={(e) => setSelectedSpirit(e.target.value)}
                className="w-full bg-gray-900/50 border border-amber-500/20 rounded-lg px-4 py-2 text-amber-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Spirits</option>
                <option value="bourbon">🥃 Bourbon</option>
                <option value="rye">🌾 Rye</option>
                <option value="scotch">🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotch</option>
                <option value="irish_whiskey">🍀 Irish Whiskey</option>
              </select>
            </div>
            
            {/* Difficulty Filter */}
            <div>
              <label className="text-amber-200/60 text-sm mb-2 block">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full bg-gray-900/50 border border-amber-500/20 rounded-lg px-4 py-2 text-amber-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4 text-amber-200/60">
          Showing {filteredCocktails.length} cocktails
        </div>

        {/* Cocktail Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCocktails.map(cocktail => (
            <div
              key={cocktail.id}
              onClick={() => setSelectedCocktail(cocktail)}
              className="bg-gray-800/50 rounded-xl p-6 border border-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-amber-100 group-hover:text-amber-400 transition-colors">
                    {cocktail.name}
                  </h3>
                  <p className="text-amber-200/60 text-sm flex items-center gap-1">
                    {getSpiritEmoji(cocktail.base_spirit)} {cocktail.base_spirit.replace('_', ' ')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs border ${getDifficultyColor(cocktail.difficulty)}`}>
                  {cocktail.difficulty}
                </span>
              </div>
              
              <p className="text-amber-200/70 text-sm mb-4 line-clamp-2">
                {cocktail.description}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-amber-200/50">⏱️ {cocktail.prep_time} min</span>
                <span className="text-amber-200/50">{cocktail.glassware}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedCocktail && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCocktail(null)}>
            <div 
              className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-amber-500/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-amber-100">{selectedCocktail.name}</h2>
                    <p className="text-amber-200/60 mt-1 flex items-center gap-2">
                      {getSpiritEmoji(selectedCocktail.base_spirit)} {selectedCocktail.base_spirit.replace('_', ' ')} based
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCocktail(null)}
                    className="text-amber-200/60 hover:text-amber-100 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <p className="text-amber-200/80 mb-6">{selectedCocktail.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs border ${getDifficultyColor(selectedCocktail.difficulty)}`}>
                      {selectedCocktail.difficulty}
                    </span>
                    <p className="text-amber-200/50 text-xs mt-1">Difficulty</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <span className="text-amber-100 text-lg">⏱️ {selectedCocktail.prep_time}</span>
                    <p className="text-amber-200/50 text-xs mt-1">Minutes</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <span className="text-amber-100 text-lg">🥂</span>
                    <p className="text-amber-200/50 text-xs mt-1">{selectedCocktail.glassware}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-amber-100 mb-3">Ingredients</h3>
                  <ul className="space-y-2">
                    {selectedCocktail.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center gap-2 text-amber-200/80">
                        <span className="text-amber-500">•</span>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-500/10 rounded-lg p-4">
                    <h4 className="text-amber-400 font-semibold mb-1">Garnish</h4>
                    <p className="text-amber-200/70">{selectedCocktail.garnish}</p>
                  </div>
                  <div className="bg-amber-500/10 rounded-lg p-4">
                    <h4 className="text-amber-400 font-semibold mb-1">Glassware</h4>
                    <p className="text-amber-200/70">{selectedCocktail.glassware}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
