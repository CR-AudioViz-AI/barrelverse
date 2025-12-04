'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PricingTier {
  id: string
  name: string
  icon: string
  price: number
  annualPrice: number
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
  badge?: string
}

const tiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Explorer',
    icon: '🌱',
    price: 0,
    annualPrice: 0,
    description: 'Perfect for casual enthusiasts just starting their journey',
    features: [
      'Browse 10,000+ spirits database',
      'Track up to 25 bottles in collection',
      'Basic tasting notes (5/month)',
      'Join community discussions',
      'View public profiles',
      'Basic quiz access',
      'Mobile app access',
    ],
    cta: 'Start Free',
  },
  {
    id: 'enthusiast',
    name: 'Enthusiast',
    icon: '🥃',
    price: 7.99,
    annualPrice: 79,
    description: 'For dedicated collectors who want the full experience',
    features: [
      'Everything in Explorer, plus:',
      'Unlimited collection tracking',
      'Unlimited tasting notes with AI insights',
      'Wishlist with price alerts',
      'Collection value tracking',
      'Advanced flavor wheel & analytics',
      'Export collection data (CSV/PDF)',
      'Ad-free experience',
      'Priority support',
      'Custom profile themes',
      '10 barrel tracking slots',
    ],
    highlighted: true,
    cta: 'Start 14-Day Trial',
    badge: 'Most Popular',
  },
  {
    id: 'collector',
    name: 'Collector Pro',
    icon: '👑',
    price: 19.99,
    annualPrice: 199,
    description: 'For serious collectors and barrel owners',
    features: [
      'Everything in Enthusiast, plus:',
      'Unlimited barrel tracking',
      'Barrel aging analytics & predictions',
      'Insurance valuation reports',
      'Verified collector badge',
      'Early access to features',
      'Custom vanity URL (yourname.barrelverse.com)',
      'Guestbook & visitor analytics',
      'Private collection sharing links',
      'API access for integrations',
      'Dedicated account manager',
      'Annual tasting event invitation',
    ],
    cta: 'Go Pro',
    badge: 'Best Value',
  },
  {
    id: 'maker',
    name: 'Maker / Brand',
    icon: '🏭',
    price: 99,
    annualPrice: 999,
    description: 'For distilleries, breweries, and brands',
    features: [
      'Official brand verification',
      'Branded profile page',
      'Product catalog management',
      'Coming soon announcements',
      'Release notifications to followers',
      'Visitor analytics dashboard',
      'Lead generation tools',
      'Sponsored placement options',
      'Event promotion tools',
      'Direct messaging with collectors',
      'Sales & pre-order integration',
      'Multi-user team access',
      'White-label embeds',
      'Priority listing in search',
    ],
    cta: 'Contact Sales',
  },
]

const faqs = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes! You can cancel your subscription at any time. Your premium features will remain active until the end of your billing period.',
  },
  {
    q: 'Is my collection data safe?',
    a: 'Absolutely. We use enterprise-grade encryption and daily backups. Your data is stored redundantly across multiple secure data centers. You always own your data and can export it anytime.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, Amex, Discover), PayPal, Apple Pay, and Google Pay.',
  },
  {
    q: 'Can I upgrade or downgrade my plan?',
    a: 'Yes, you can change your plan at any time. Upgrades take effect immediately with prorated billing. Downgrades take effect at your next billing date.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a 14-day money-back guarantee on all paid plans. If you are not satisfied, contact us within 14 days for a full refund.',
  },
  {
    q: 'Is there a family or group plan?',
    a: 'Yes! Contact us for family plans (up to 5 members) or group/club plans with special pricing.',
  },
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-black text-white">
      <header className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-6">
            <Link href="/spirits" className="hover:text-amber-400 transition-colors">Spirits</Link>
            <Link href="/community" className="hover:text-amber-400 transition-colors">Community</Link>
            <button className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg font-semibold transition-colors">
              Sign In
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of collectors tracking their spirits journey. Start free, upgrade when you are ready.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`${!isAnnual ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-16 h-8 bg-stone-700 rounded-full transition-colors"
            >
              <div className={`absolute top-1 w-6 h-6 bg-amber-500 rounded-full transition-all ${isAnnual ? 'left-9' : 'left-1'}`} />
            </button>
            <span className={`${isAnnual ? 'text-white' : 'text-gray-400'}`}>
              Annual <span className="text-green-400 text-sm">(Save 17%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl p-6 ${
                tier.highlighted
                  ? 'bg-gradient-to-b from-amber-900/50 to-stone-800/50 border-2 border-amber-500 scale-105'
                  : 'bg-stone-800/50 border border-amber-900/20'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                  {tier.badge}
                </div>
              )}

              <div className="text-center mb-6">
                <div className="text-4xl mb-2">{tier.icon}</div>
                <h3 className="text-2xl font-bold mb-1">{tier.name}</h3>
                <p className="text-gray-400 text-sm">{tier.description}</p>
              </div>

              <div className="text-center mb-6">
                {tier.price === 0 ? (
                  <div className="text-4xl font-bold">Free</div>
                ) : (
                  <>
                    <div className="text-4xl font-bold">
                      ${isAnnual ? Math.round(tier.annualPrice / 12) : tier.price}
                      <span className="text-lg text-gray-400">/mo</span>
                    </div>
                    {isAnnual && tier.price > 0 && (
                      <div className="text-sm text-gray-400">
                        ${tier.annualPrice}/year (billed annually)
                      </div>
                    )}
                  </>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span className={feature.startsWith('Everything') ? 'text-amber-400 font-semibold' : 'text-gray-300'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  tier.highlighted
                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                    : tier.id === 'maker'
                    ? 'bg-purple-600 hover:bg-purple-500'
                    : 'bg-stone-700 hover:bg-stone-600'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-8">Feature Comparison</h2>
          <div className="bg-stone-800/50 rounded-2xl overflow-hidden border border-amber-900/20">
            <table className="w-full">
              <thead>
                <tr className="border-b border-amber-900/30">
                  <th className="text-left p-4">Feature</th>
                  <th className="p-4 text-center">Explorer</th>
                  <th className="p-4 text-center bg-amber-900/20">Enthusiast</th>
                  <th className="p-4 text-center">Collector Pro</th>
                  <th className="p-4 text-center">Maker</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Collection Tracking', '25 bottles', 'Unlimited', 'Unlimited', 'Unlimited'],
                  ['Tasting Notes', '5/month', 'Unlimited', 'Unlimited', 'Unlimited'],
                  ['AI Insights', '❌', '✅', '✅', '✅'],
                  ['Value Tracking', '❌', '✅', '✅', '✅'],
                  ['Barrel Tracking', '❌', '10 barrels', 'Unlimited', 'Unlimited'],
                  ['Export Data', '❌', '✅', '✅', '✅'],
                  ['Custom URL', '❌', '❌', '✅', '✅'],
                  ['Visitor Analytics', '❌', '❌', '✅', '✅'],
                  ['API Access', '❌', '❌', '✅', '✅'],
                  ['Brand Verification', '❌', '❌', '❌', '✅'],
                  ['Product Catalog', '❌', '❌', '❌', '✅'],
                  ['Team Access', '1 user', '1 user', '1 user', 'Unlimited'],
                ].map(([feature, ...values], i) => (
                  <tr key={i} className="border-b border-amber-900/20">
                    <td className="p-4 font-medium">{feature}</td>
                    {values.map((value, j) => (
                      <td key={j} className={`p-4 text-center ${j === 1 ? 'bg-amber-900/10' : ''}`}>
                        {value === '✅' ? <span className="text-green-400">✓</span> : 
                         value === '❌' ? <span className="text-gray-600">—</span> : 
                         <span className="text-gray-300">{value}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid md:grid-cols-4 gap-6 mb-20">
          {[
            { icon: '🔒', title: 'Secure & Encrypted', desc: 'Bank-level security for your data' },
            { icon: '💾', title: 'Daily Backups', desc: 'Your collection is always safe' },
            { icon: '📱', title: 'Works Everywhere', desc: 'PC, Mac, Phone, Tablet' },
            { icon: '💳', title: '14-Day Guarantee', desc: 'Full refund, no questions asked' },
          ].map((badge, i) => (
            <div key={i} className="text-center p-6 bg-stone-800/30 rounded-xl border border-amber-900/20">
              <div className="text-4xl mb-3">{badge.icon}</div>
              <h4 className="font-bold mb-1">{badge.title}</h4>
              <p className="text-sm text-gray-400">{badge.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-stone-800/50 rounded-xl border border-amber-900/20 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-stone-700/30 transition-colors"
                >
                  <span className="font-semibold">{faq.q}</span>
                  <span className="text-amber-400">{expandedFaq === i ? '−' : '+'}</span>
                </button>
                {expandedFaq === i && (
                  <div className="px-4 pb-4 text-gray-400">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-amber-900/30 to-stone-800/30 rounded-2xl p-12 border border-amber-900/20">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Collection Journey?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Join over 50,000 collectors tracking their spirits. Start free today—no credit card required.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-amber-600 hover:bg-amber-500 px-8 py-4 rounded-lg font-bold text-lg transition-colors">
              Start Free Today
            </button>
            <button className="bg-stone-700 hover:bg-stone-600 px-8 py-4 rounded-lg font-semibold transition-colors">
              Compare Plans
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            🎉 Special offer: Get 2 months free with annual billing
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-900/30 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-amber-500 mb-4">🥃 BarrelVerse</div>
              <p className="text-gray-400 text-sm">The ultimate platform for spirits collectors and enthusiasts.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/spirits" className="hover:text-amber-400">Spirits Database</Link></li>
                <li><Link href="/collection" className="hover:text-amber-400">Collection Tracker</Link></li>
                <li><Link href="/barrels" className="hover:text-amber-400">Barrel Tracker</Link></li>
                <li><Link href="/community" className="hover:text-amber-400">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-amber-400">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-amber-400">Careers</Link></li>
                <li><Link href="/press" className="hover:text-amber-400">Press</Link></li>
                <li><Link href="/contact" className="hover:text-amber-400">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/privacy" className="hover:text-amber-400">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-amber-400">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-amber-400">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-amber-900/30 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2025 BarrelVerse by CR AudioViz AI. All rights reserved. Please drink responsibly.
          </div>
        </div>
      </footer>
    </div>
  )
}
