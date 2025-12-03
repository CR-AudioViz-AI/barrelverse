'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Distillery {
  id: string;
  name: string;
  country: string;
  region: string;
  founded: number;
  description: string;
  notable_products: string[];
  tours_available: boolean;
  website?: string;
  latitude?: number;
  longitude?: number;
}

const SAMPLE_DISTILLERIES: Distillery[] = [
  {
    id: '1',
    name: 'Buffalo Trace Distillery',
    country: 'USA',
    region: 'Kentucky',
    founded: 1773,
    description: 'One of the oldest continuously operating distilleries in America. Home to iconic brands including Buffalo Trace, Eagle Rare, Blanton\'s, and Pappy Van Winkle.',
    notable_products: ['Buffalo Trace', 'Eagle Rare', 'Blanton\'s', 'Pappy Van Winkle', 'E.H. Taylor'],
    tours_available: true,
    website: 'https://buffalotracedistillery.com'
  },
  {
    id: '2',
    name: 'Woodford Reserve Distillery',
    country: 'USA',
    region: 'Kentucky',
    founded: 1812,
    description: 'Located in the heart of horse country, this National Historic Landmark produces premium small-batch bourbon using copper pot stills.',
    notable_products: ['Woodford Reserve', 'Woodford Double Oaked', 'Woodford Rye'],
    tours_available: true,
    website: 'https://woodfordreserve.com'
  },
  {
    id: '3',
    name: 'Wild Turkey Distillery',
    country: 'USA',
    region: 'Kentucky',
    founded: 1855,
    description: 'Perched on a hill overlooking the Kentucky River, Wild Turkey is known for its high-proof, full-flavored bourbons.',
    notable_products: ['Wild Turkey 101', 'Russell\'s Reserve', 'Rare Breed', 'Longbranch'],
    tours_available: true,
    website: 'https://wildturkeybourbon.com'
  },
  {
    id: '4',
    name: 'Maker\'s Mark Distillery',
    country: 'USA',
    region: 'Kentucky',
    founded: 1953,
    description: 'Famous for its handmade bourbon with the iconic red wax seal. Uses soft red winter wheat instead of rye for a sweeter profile.',
    notable_products: ['Maker\'s Mark', 'Maker\'s 46', 'Maker\'s Mark Cask Strength'],
    tours_available: true,
    website: 'https://makersmark.com'
  },
  {
    id: '5',
    name: 'The Macallan Distillery',
    country: 'Scotland',
    region: 'Speyside',
    founded: 1824,
    description: 'Iconic Speyside distillery renowned for sherry cask-matured single malts and exceptional craftsmanship.',
    notable_products: ['The Macallan 12', 'The Macallan 18', 'Rare Cask'],
    tours_available: true,
    website: 'https://themacallan.com'
  },
  {
    id: '6',
    name: 'Glenfiddich Distillery',
    country: 'Scotland',
    region: 'Speyside',
    founded: 1887,
    description: 'Family-owned distillery producing the world\'s best-selling single malt Scotch whisky.',
    notable_products: ['Glenfiddich 12', 'Glenfiddich 15 Solera', 'Glenfiddich 21'],
    tours_available: true,
    website: 'https://glenfiddich.com'
  },
  {
    id: '7',
    name: 'Laphroaig Distillery',
    country: 'Scotland',
    region: 'Islay',
    founded: 1815,
    description: 'Legendary Islay distillery producing intensely peaty, smoky whiskies with medicinal character.',
    notable_products: ['Laphroaig 10', 'Laphroaig Quarter Cask', 'Laphroaig Cask Strength'],
    tours_available: true,
    website: 'https://laphroaig.com'
  },
  {
    id: '8',
    name: 'Ardbeg Distillery',
    country: 'Scotland',
    region: 'Islay',
    founded: 1815,
    description: 'Cult-favorite Islay distillery known for complex, phenolic whiskies with devoted followers.',
    notable_products: ['Ardbeg 10', 'Ardbeg Uigeadail', 'Ardbeg Corryvreckan'],
    tours_available: true,
    website: 'https://ardbeg.com'
  },
  {
    id: '9',
    name: 'Jameson Distillery',
    country: 'Ireland',
    region: 'Dublin',
    founded: 1780,
    description: 'Historic Irish distillery producing the world\'s most popular Irish whiskey through triple distillation.',
    notable_products: ['Jameson Original', 'Jameson Black Barrel', 'Jameson 18 Year'],
    tours_available: true,
    website: 'https://jamesonwhiskey.com'
  },
  {
    id: '10',
    name: 'Yamazaki Distillery',
    country: 'Japan',
    region: 'Osaka',
    founded: 1923,
    description: 'Japan\'s first and oldest whisky distillery, pioneering Japanese whisky with exceptional craft.',
    notable_products: ['Yamazaki 12', 'Yamazaki 18', 'Yamazaki 25'],
    tours_available: true,
    website: 'https://suntory.com/yamazaki'
  },
  {
    id: '11',
    name: 'Four Roses Distillery',
    country: 'USA',
    region: 'Kentucky',
    founded: 1888,
    description: 'Unique bourbon producer using 10 distinct recipes from 2 mash bills and 5 yeast strains.',
    notable_products: ['Four Roses Single Barrel', 'Four Roses Small Batch', 'Four Roses Yellow Label'],
    tours_available: true,
    website: 'https://fourrosesbourbon.com'
  },
  {
    id: '12',
    name: 'Springbank Distillery',
    country: 'Scotland',
    region: 'Campbeltown',
    founded: 1828,
    description: 'One of the last family-owned distilleries performing 100% of production on-site.',
    notable_products: ['Springbank 10', 'Springbank 15', 'Longrow', 'Hazelburn'],
    tours_available: true,
    website: 'https://springbank.scot'
  }
];

const COUNTRIES = ['all', 'USA', 'Scotland', 'Ireland', 'Japan'];
const REGIONS: Record<string, string[]> = {
  'USA': ['Kentucky', 'Tennessee', 'Texas'],
  'Scotland': ['Speyside', 'Islay', 'Highland', 'Lowland', 'Campbeltown'],
  'Ireland': ['Dublin', 'Cork'],
  'Japan': ['Osaka', 'Yamanashi']
};

export default function DistilleriesPage() {
  const [distilleries] = useState<Distillery[]>(SAMPLE_DISTILLERIES);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistillery, setSelectedDistillery] = useState<Distillery | null>(null);

  const filteredDistilleries = distilleries.filter(d => {
    const matchesCountry = selectedCountry === 'all' || d.country === selectedCountry;
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.region.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  const getCountryFlag = (country: string) => {
    switch (country) {
      case 'USA': return '🇺🇸';
      case 'Scotland': return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
      case 'Ireland': return '🇮🇪';
      case 'Japan': return '🇯🇵';
      default: return '🌍';
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
            🏭 Distillery Atlas
          </h1>
          <p className="text-amber-200/70 text-lg mt-2">
            Explore legendary distilleries from around the world
          </p>
          <div className="flex gap-6 mt-4 text-sm">
            <span className="text-amber-400">{distilleries.length} Distilleries</span>
            <span className="text-amber-400">•</span>
            <span className="text-amber-200/60">From Kentucky to Islay to Japan</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-amber-500/10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="text-amber-200/60 text-sm mb-2 block">Search</label>
              <input
                type="text"
                placeholder="Search distilleries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900/50 border border-amber-500/20 rounded-lg px-4 py-2 text-amber-100 placeholder-amber-200/30 focus:border-amber-500 focus:outline-none"
              />
            </div>
            
            {/* Country Filter */}
            <div>
              <label className="text-amber-200/60 text-sm mb-2 block">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-gray-900/50 border border-amber-500/20 rounded-lg px-4 py-2 text-amber-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Countries</option>
                <option value="USA">🇺🇸 United States</option>
                <option value="Scotland">🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland</option>
                <option value="Ireland">🇮🇪 Ireland</option>
                <option value="Japan">🇯🇵 Japan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4 text-amber-200/60">
          Showing {filteredDistilleries.length} distilleries
        </div>

        {/* Distillery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDistilleries.map(distillery => (
            <div
              key={distillery.id}
              onClick={() => setSelectedDistillery(distillery)}
              className="bg-gray-800/50 rounded-xl p-6 border border-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-amber-100 group-hover:text-amber-400 transition-colors">
                    {distillery.name}
                  </h3>
                  <p className="text-amber-200/60 text-sm flex items-center gap-1">
                    {getCountryFlag(distillery.country)} {distillery.region}, {distillery.country}
                  </p>
                </div>
              </div>
              
              <p className="text-amber-200/70 text-sm mb-4 line-clamp-2">
                {distillery.description}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-amber-200/50">Est. {distillery.founded}</span>
                {distillery.tours_available && (
                  <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs">
                    Tours Available
                  </span>
                )}
              </div>
              
              <div className="mt-4 flex flex-wrap gap-1">
                {distillery.notable_products.slice(0, 3).map((product, i) => (
                  <span key={i} className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded text-xs">
                    {product}
                  </span>
                ))}
                {distillery.notable_products.length > 3 && (
                  <span className="text-amber-200/50 text-xs">+{distillery.notable_products.length - 3} more</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedDistillery && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDistillery(null)}>
            <div 
              className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-amber-500/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-amber-100">{selectedDistillery.name}</h2>
                    <p className="text-amber-200/60 mt-1 flex items-center gap-2">
                      {getCountryFlag(selectedDistillery.country)} {selectedDistillery.region}, {selectedDistillery.country}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDistillery(null)}
                    className="text-amber-200/60 hover:text-amber-100 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <span className="text-amber-100 text-2xl font-bold">{selectedDistillery.founded}</span>
                    <p className="text-amber-200/50 text-sm">Founded</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <span className="text-amber-100 text-2xl">{selectedDistillery.tours_available ? '✅' : '❌'}</span>
                    <p className="text-amber-200/50 text-sm">Tours</p>
                  </div>
                </div>

                <p className="text-amber-200/80 mb-6">{selectedDistillery.description}</p>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-amber-100 mb-3">Notable Products</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDistillery.notable_products.map((product, i) => (
                      <span key={i} className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-sm">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedDistillery.website && (
                  <a
                    href={selectedDistillery.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    🌐 Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
