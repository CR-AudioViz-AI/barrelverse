// app/subscription/page.tsx
'use client';

import { useState } from 'react';
import { Check, Zap, Crown, Wine, Star, Shield, Bell, MessageCircle, Award, MapPin } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Get started with basic collection tracking',
    icon: Wine,
    features: [
      { text: 'Track up to 25 bottles', included: true },
      { text: 'Basic search & browse', included: true },
      { text: 'Community access', included: true },
      { text: 'Price alerts', included: false, limit: '3' },
      { text: 'AI Sommelier', included: false, limit: '5/month' },
      { text: 'Export data', included: false },
      { text: 'Ad-free experience', included: false },
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    name: 'Collector',
    price: 9.99,
    priceId: 'collector',
    description: 'For serious spirit enthusiasts',
    icon: Star,
    features: [
      { text: 'Unlimited collection', included: true },
      { text: 'Advanced search filters', included: true },
      { text: 'Price history charts', included: true },
      { text: 'Price alerts', included: true, limit: '10' },
      { text: 'AI Sommelier', included: true, limit: '10/month' },
      { text: 'Export collection data', included: true },
      { text: 'Ad-free experience', included: true },
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Connoisseur',
    price: 19.99,
    priceId: 'connoisseur',
    description: 'Enhanced features for collectors',
    icon: Crown,
    features: [
      { text: 'Everything in Collector', included: true },
      { text: 'Unlimited price alerts', included: true },
      { text: 'AI Sommelier', included: true, limit: '50/month' },
      { text: 'Exclusive tastings access', included: true },
      { text: 'Priority support', included: true },
      { text: 'Early access features', included: true },
      { text: 'Collection analytics', included: true },
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Sommelier',
    price: 49.99,
    priceId: 'sommelier',
    description: 'The ultimate collector experience',
    icon: Shield,
    features: [
      { text: 'Everything in Connoisseur', included: true },
      { text: 'Unlimited AI Sommelier', included: true },
      { text: 'Rare bottle alerts', included: true },
      { text: 'Collection insurance quotes', included: true },
      { text: 'VIP distillery access', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'White-glove support', included: true },
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
];

export default function SubscriptionPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setIsLoading(planId);
    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-id-here', // Get from auth
          plan: planId,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription`,
        }),
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your <span className="text-amber-500">Experience</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Unlock premium features to enhance your spirit collection journey
          </p>
          
          {/* Billing toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={billingPeriod === 'monthly' ? 'text-white' : 'text-gray-500'}>Monthly</span>
            <button
              onClick={() => setBillingPeriod(b => b === 'monthly' ? 'annual' : 'monthly')}
              className={`w-14 h-7 rounded-full transition-colors ${billingPeriod === 'annual' ? 'bg-amber-600' : 'bg-gray-600'} relative`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${billingPeriod === 'annual' ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            <span className={billingPeriod === 'annual' ? 'text-white' : 'text-gray-500'}>
              Annual <span className="text-green-500 text-sm">(Save 20%)</span>
            </span>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const displayPrice = billingPeriod === 'annual' && plan.price > 0 
              ? (plan.price * 0.8).toFixed(2)
              : plan.price.toFixed(2);
            
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-amber-900/50 to-gray-800 border-2 border-amber-500'
                    : 'bg-gray-800 border border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    plan.popular ? 'bg-amber-600' : 'bg-gray-700'
                  }`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-gray-400">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${displayPrice}</span>
                  {plan.price > 0 && <span className="text-gray-400">/month</span>}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${feature.included ? 'text-green-500' : 'text-gray-600'}`} />
                      <span className={feature.included ? 'text-gray-300' : 'text-gray-500'}>
                        {feature.text}
                        {feature.limit && <span className="text-amber-400 ml-1">({feature.limit})</span>}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
                  disabled={!plan.priceId || isLoading === plan.priceId}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'bg-amber-600 text-white hover:bg-amber-500'
                      : plan.priceId
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading === plan.priceId ? 'Loading...' : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Features comparison */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Premium Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-800/50 rounded-2xl">
              <MessageCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">AI Sommelier</h3>
              <p className="text-gray-400">Get personalized recommendations, cocktail recipes, and pairing suggestions from our AI expert.</p>
            </div>
            <div className="text-center p-6 bg-gray-800/50 rounded-2xl">
              <Bell className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Price Alerts</h3>
              <p className="text-gray-400">Get notified when your wishlist bottles drop in price or become available.</p>
            </div>
            <div className="text-center p-6 bg-gray-800/50 rounded-2xl">
              <Award className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Exclusive Access</h3>
              <p className="text-gray-400">VIP distillery tours, rare bottle alerts, and member-only tasting events.</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes! Cancel your subscription anytime with no questions asked. Your premium features remain active until the end of your billing period.' },
              { q: 'Is there a free trial?', a: 'All paid plans include a 7-day free trial. You wont be charged until the trial ends.' },
              { q: 'Can I upgrade or downgrade?', a: 'Absolutely. Change your plan anytime from your account settings. Changes take effect on your next billing date.' },
              { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, Apple Pay, Google Pay, and PayPal through our secure payment processor Stripe.' },
            ].map((faq, idx) => (
              <div key={idx} className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
