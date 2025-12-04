'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Live stats (would come from API in production)
const LIVE_STATS = {
  totalSpirits: 12847,
  totalCollectors: 75432,
  totalBottlesTracked: 892156,
  collectionValue: 47856000,
  dailyNewSpirits: 200,
  countriesRepresented: 89
}

// Featured content
const FEATURED_SPIRIT = {
  name: 'Blanton\'s Original Single Barrel',
  brand: 'Buffalo Trace',
  category: 'Bourbon',
  rating: 92,
  description: 'The original single barrel bourbon, known for its distinctive horse stopper.',
  price: 65,
  rarity: 'Allocated'
}

const TODAY_IN_HISTORY = {
  year: 1933,
  event: 'Prohibition Ends!',
  description: 'The 21st Amendment is ratified, ending 13 years of Prohibition.'
}

const DAILY_TRIVIA = {
  question: 'What percentage of the world\'s bourbon is made in Kentucky?',
  answer: '95%'
}

export default function HomePage() {
  const [statsVisible, setStatsVisible] = useState(false)

  useEffect(() => {
    setStatsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-amber-950/10 to-stone-950 text-white">
      {/* Navigation */}
      <header className="border-b border-amber-900/30 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold text-amber-500 flex items-center gap-2">
                🥃 BarrelVerse
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/spirits" className="hover:text-amber-400 transition-colors">Explore</Link>
                <Link href="/museum" className="hover:text-amber-400 transition-colors">Museum</Link>
                <Link href="/games" className="hover:text-amber-400 transition-colors">Games</Link>
                <Link href="/tour" className="hover:text-amber-400 transition-colors">Tours</Link>
                <Link href="/today" className="hover:text-amber-400 transition-colors">Today</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/scanner" className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <span>📸</span> Scan
              </Link>
              <Link href="/auth/login" className="hidden md:block hover:text-amber-400 transition-colors">Sign In</Link>
              <Link href="/auth/signup" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg font-semibold transition-colors">
                Join Free
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-gradient-to-r from-amber-600 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-bold mb-6">
              🏆 THE WORLD'S #1 SPIRITS PLATFORM
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Discover. Collect. <span className="text-amber-400">Experience.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Track your collection, explore 500+ years of history, walk through virtual distilleries, 
              and connect with 75,000+ spirits enthusiasts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="bg-amber-600 hover:bg-amber-500 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-amber-600/30">
                Start Your Collection →
              </Link>
              <Link href="/museum" className="bg-white/10 hover:bg-white/20 backdrop-blur px-8 py-4 rounded-xl font-bold text-lg transition-all border border-white/20">
                🏛️ Explore Museum
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="bg-gradient-to-r from-amber-900/50 via-stone-800/50 to-amber-900/50 border-y border-amber-500/30 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`grid grid-cols-2 md:grid-cols-6 gap-6 text-center transition-all duration-1000 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {[
              { value: LIVE_STATS.totalSpirits.toLocaleString(), label: 'Spirits Catalogued' },
              { value: LIVE_STATS.totalCollectors.toLocaleString(), label: 'Collectors' },
              { value: '$' + (LIVE_STATS.collectionValue / 1000000).toFixed(1) + 'M', label: 'Collection Value' },
              { value: LIVE_STATS.totalBottlesTracked.toLocaleString(), label: 'Bottles Tracked' },
              { value: LIVE_STATS.dailyNewSpirits + '/day', label: 'New Additions' },
              { value: LIVE_STATS.countriesRepresented, label: 'Countries' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl md:text-3xl font-bold text-amber-400">{stat.value}</div>
                <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need in One Place</h2>
            <p className="text-xl text-gray-400">The ultimate platform for spirits enthusiasts</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🏛️',
                title: 'Virtual Museum',
                description: 'Walk through 500+ years of spirits history. Explore artifacts, labels, and stories from every era.',
                link: '/museum',
                color: 'amber'
              },
              {
                icon: '🏭',
                title: 'Distillery Tours',
                description: 'Step inside legendary distilleries. Experience the sights, sounds, and stories of bourbon-making.',
                link: '/tour',
                color: 'orange'
              },
              {
                icon: '📸',
                title: 'Bottle Scanner',
                description: 'Scan any bottle to instantly add it to your collection, check prices, and see reviews.',
                link: '/scanner',
                color: 'green'
              },
              {
                icon: '📊',
                title: 'Collection Tracker',
                description: 'Track every bottle you own. Monitor values, set alerts for rare finds, and showcase your collection.',
                link: '/collection',
                color: 'blue'
              },
              {
                icon: '🎮',
                title: 'Games & Trivia',
                description: '12+ games to test your knowledge. Earn XP, unlock badges, and compete globally.',
                link: '/games',
                color: 'purple'
              },
              {
                icon: '🎓',
                title: 'Courses & Learning',
                description: 'Master spirits with 500+ courses. From beginner basics to expert certifications.',
                link: '/courses',
                color: 'pink'
              }
            ].map((feature, i) => (
              <Link
                key={i}
                href={feature.link}
                className="group bg-stone-800/50 rounded-2xl p-8 border border-stone-700/50 hover:border-amber-500/50 transition-all hover:scale-[1.02]"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 mb-4">{feature.description}</p>
                <span className="text-amber-400 flex items-center gap-2">
                  Explore <span className="group-hover:translate-x-2 transition-transform">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Content Section */}
      <section className="py-20 bg-stone-800/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Today in History */}
            <div className="bg-gradient-to-br from-amber-900/50 to-stone-800/50 rounded-2xl p-6 border border-amber-500/30">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📅</span>
                <h3 className="font-bold">Today in History</h3>
              </div>
              <div className="text-4xl font-bold text-amber-400 mb-2">{TODAY_IN_HISTORY.year}</div>
              <h4 className="text-xl font-bold mb-2">{TODAY_IN_HISTORY.event}</h4>
              <p className="text-gray-400 text-sm mb-4">{TODAY_IN_HISTORY.description}</p>
              <Link href="/today" className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-2">
                See more history →
              </Link>
            </div>

            {/* Featured Spirit */}
            <div className="bg-gradient-to-br from-stone-800/50 to-amber-900/30 rounded-2xl p-6 border border-stone-700/50">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⭐</span>
                <h3 className="font-bold">Featured Spirit</h3>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-20 bg-amber-900/50 rounded-lg flex items-center justify-center text-3xl">🥃</div>
                <div>
                  <h4 className="font-bold">{FEATURED_SPIRIT.name}</h4>
                  <p className="text-sm text-gray-400">{FEATURED_SPIRIT.brand}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-amber-400">★ {FEATURED_SPIRIT.rating}</span>
                    <span className="bg-red-900/50 text-red-400 px-2 py-0.5 rounded text-xs">{FEATURED_SPIRIT.rarity}</span>
                  </div>
                </div>
              </div>
              <Link href="/spirits" className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-2">
                View all spirits →
              </Link>
            </div>

            {/* Daily Trivia */}
            <div className="bg-gradient-to-br from-purple-900/50 to-stone-800/50 rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🧠</span>
                <h3 className="font-bold">Daily Trivia</h3>
              </div>
              <p className="text-lg mb-4">{DAILY_TRIVIA.question}</p>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <span className="text-gray-500 text-sm">Tap to reveal answer</span>
              </div>
              <Link href="/trivia" className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-2 mt-4">
                Play more trivia →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* For Business Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">For Business</h2>
            <p className="text-xl text-gray-400">Connect with 75,000+ engaged spirits enthusiasts</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link href="/retailers" className="bg-gradient-to-br from-green-900/50 to-stone-800/50 rounded-2xl p-8 border border-green-500/30 hover:border-green-400/50 transition-all group">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-2xl font-bold mb-2">For Retailers</h3>
              <p className="text-gray-400 mb-4">Get discovered when collectors search for bottles. Sync inventory, promote events, and grow your customer base.</p>
              <span className="text-green-400 flex items-center gap-2">
                Learn more <span className="group-hover:translate-x-2 transition-transform">→</span>
              </span>
            </Link>

            <Link href="/maker" className="bg-gradient-to-br from-blue-900/50 to-stone-800/50 rounded-2xl p-8 border border-blue-500/30 hover:border-blue-400/50 transition-all group">
              <div className="text-4xl mb-4">🏭</div>
              <h3 className="text-2xl font-bold mb-2">For Distilleries & Brands</h3>
              <p className="text-gray-400 mb-4">Showcase your products, announce releases, engage with fans, and access detailed analytics on your audience.</p>
              <span className="text-blue-400 flex items-center gap-2">
                Learn more <span className="group-hover:translate-x-2 transition-transform">→</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-stone-800/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Loved by Collectors</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: 'Finally, a proper way to track my bourbon collection! The virtual museum is incredible.', author: 'Mike R.', role: 'Kentucky Bourbon Enthusiast' },
              { quote: 'The distillery tours feel like actually being there. I\'ve learned so much about how bourbon is made.', author: 'Sarah J.', role: 'Whiskey Collector' },
              { quote: 'The trivia games are addictive. My friends and I compete for the top scores every week.', author: 'Dan T.', role: 'Spirits Educator' }
            ].map((testimonial, i) => (
              <div key={i} className="bg-stone-800/50 rounded-2xl p-6 border border-stone-700/50">
                <div className="text-4xl text-amber-500 mb-4">"</div>
                <p className="text-gray-300 mb-4">{testimonial.quote}</p>
                <div>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-amber-900/50 via-stone-800/50 to-amber-900/50 rounded-3xl p-12 border border-amber-500/30">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl text-gray-300 mb-8">Join 75,000+ spirits enthusiasts today. It's free!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="bg-amber-600 hover:bg-amber-500 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105">
                Create Free Account
              </Link>
              <Link href="/museum" className="bg-stone-700 hover:bg-stone-600 px-8 py-4 rounded-xl font-bold text-lg transition-all">
                Explore as Guest
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-2">
              <Link href="/" className="text-2xl font-bold text-amber-500 flex items-center gap-2 mb-4">
                🥃 BarrelVerse
              </Link>
              <p className="text-gray-400 text-sm mb-4">The world's #1 spirits platform. Discover, collect, and experience the finest spirits from around the world.</p>
              <p className="text-gray-500 text-xs">A CR AudioViz AI Platform</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/spirits" className="hover:text-amber-400">All Spirits</Link></li>
                <li><Link href="/museum" className="hover:text-amber-400">Virtual Museum</Link></li>
                <li><Link href="/tour" className="hover:text-amber-400">Distillery Tours</Link></li>
                <li><Link href="/today" className="hover:text-amber-400">Today in History</Link></li>
                <li><Link href="/labels" className="hover:text-amber-400">Label Gallery</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Learn & Play</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/courses" className="hover:text-amber-400">Courses</Link></li>
                <li><Link href="/trivia" className="hover:text-amber-400">Trivia</Link></li>
                <li><Link href="/games" className="hover:text-amber-400">Games</Link></li>
                <li><Link href="/flavors" className="hover:text-amber-400">Flavor Wheel</Link></li>
                <li><Link href="/cocktails" className="hover:text-amber-400">Cocktails</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Business</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/retailers" className="hover:text-amber-400">For Retailers</Link></li>
                <li><Link href="/maker" className="hover:text-amber-400">For Brands</Link></li>
                <li><Link href="/pricing" className="hover:text-amber-400">Pricing</Link></li>
                <li><Link href="/referral" className="hover:text-amber-400">Referral Program</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-800 pt-8 text-center text-gray-500 text-sm">
            <p>© 2024 BarrelVerse. All rights reserved. Drink responsibly. Must be 21+.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
