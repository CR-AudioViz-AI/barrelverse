'use client'

import Link from 'next/link'
import { useState } from 'react'

const PLANS = [
  {
    name: 'Free',
    price: 0,
    period: '',
    description: 'Get started and test the waters',
    features: [
      'List up to 10 spirits',
      'Basic business profile',
      'Appear in search results',
      'Customer messaging',
    ],
    limitations: [
      'Limited visibility',
      'No analytics',
      'No featured placement',
    ],
    cta: 'Get Started Free',
    href: '/business/register',
    popular: false,
  },
  {
    name: 'Basic',
    price: 29,
    period: '/month',
    description: 'For small shops getting serious',
    features: [
      'List up to 100 spirits',
      'Full business profile',
      'Priority in search results',
      'Basic analytics dashboard',
      'Inventory alerts for customers',
      'Photo gallery',
    ],
    limitations: [],
    cta: 'Start 14-Day Trial',
    href: '/business/register?plan=basic',
    popular: false,
  },
  {
    name: 'Pro',
    price: 79,
    period: '/month',
    description: 'For busy stores and bars',
    features: [
      'List up to 500 spirits',
      'Featured placement in searches',
      'Advanced analytics & insights',
      'Customer search trends',
      'Rare bottle alerts',
      'API access for POS integration',
      'Priority support',
      'Verified badge',
    ],
    limitations: [],
    cta: 'Start 14-Day Trial',
    href: '/business/register?plan=pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 199,
    period: '/month',
    description: 'For chains and distributors',
    features: [
      'Unlimited spirits',
      'Multiple locations',
      'White-label options',
      'Dedicated account manager',
      'Custom integrations',
      'Bulk upload tools',
      'Franchise management',
      'SLA guarantee',
    ],
    limitations: [],
    cta: 'Contact Sales',
    href: '/business/contact',
    popular: false,
  },
]

export default function BusinessPricingPage() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <Link href="/find" className="inline-flex items-center text-amber-300 hover:text-amber-200 mb-8">
          ← Back to Find Spirits
        </Link>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-amber-200 mb-8">
            Choose the plan that fits your business
          </p>

          {/* Annual Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={annual ? 'text-stone-400' : 'text-white'}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${
                annual ? 'bg-amber-600' : 'bg-stone-600'
              }`}
            >
              <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                annual ? 'translate-x-6' : ''
              }`} />
            </button>
            <span className={annual ? 'text-white' : 'text-stone-400'}>
              Annual <span className="text-green-400 text-sm">(Save 20%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {PLANS.map((plan) => {
            const displayPrice = annual && plan.price > 0 
              ? Math.round(plan.price * 0.8) 
              : plan.price

            return (
              <div
                key={plan.name}
                className={`rounded-xl p-6 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-amber-900/50 to-stone-800/50 border-2 border-amber-500 relative'
                    : 'bg-stone-800/50 border border-amber-600/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}

                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-stone-400 text-sm mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold">${displayPrice}</span>
                  <span className="text-stone-400">{plan.period}</span>
                  {annual && plan.price > 0 && (
                    <p className="text-green-400 text-sm">
                      ${displayPrice * 12}/year (save ${plan.price * 12 * 0.2})
                    </p>
                  )}
                </div>

                <Link
                  href={plan.href}
                  className={`block w-full py-3 rounded-lg font-semibold text-center mb-6 ${
                    plan.popular
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-stone-700 hover:bg-stone-600'
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <span className="text-green-400">✓</span>
                      {feature}
                    </li>
                  ))}
                  {plan.limitations.map((limitation) => (
                    <li key={limitation} className="flex items-start gap-2 text-sm text-stone-500">
                      <span>✗</span>
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I try before I buy?',
                a: 'Yes! Start with our free plan to test the platform. Upgrade anytime when you\'re ready for more features.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards through Stripe. Enterprise customers can pay by invoice.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Absolutely. Cancel your subscription anytime from your dashboard. No contracts, no hassle.',
              },
              {
                q: 'How do customers find my store?',
                a: 'When users search for spirits you have in stock, your store appears in the results sorted by distance and plan level.',
              },
              {
                q: 'Can I bulk upload my inventory?',
                a: 'Pro and Enterprise plans include bulk upload via CSV. We can also help integrate with your POS system.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-stone-800/50 border border-amber-600/30 rounded-xl p-4">
                <h3 className="font-bold mb-2">{q}</h3>
                <p className="text-stone-400 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-stone-400 mb-4">Questions? We're here to help.</p>
          <Link href="/business/contact" className="text-amber-400 hover:text-amber-300">
            Contact our sales team →
          </Link>
        </div>
      </div>
    </div>
  )
}
