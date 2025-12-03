'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Article = {
  id: string
  title: string
  slug: string
  category: string
  era: string | null
  summary: string
  content: string
  read_time: number
  author: string
  sources: string[] | null
  is_featured: boolean
  published_at: string
}

type TimelineEvent = {
  id: string
  year: number
  month: number | null
  day: number | null
  title: string
  description: string
  category: string
  spirit_category: string | null
  importance: number
}

const CATEGORIES = [
  { id: 'all', name: 'All', icon: '📚' },
  { id: 'prohibition', name: 'Prohibition Era', icon: '🚫' },
  { id: 'mob', name: 'Mob & Crime', icon: '🔫' },
  { id: 'origin', name: 'Spirit Origins', icon: '🌱' },
  { id: 'culture', name: 'Culture', icon: '🎭' },
  { id: 'events', name: 'Key Events', icon: '📅' },
  { id: 'people', name: 'Famous Figures', icon: '👤' },
]

export default function HistoryPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTimeline, setShowTimeline] = useState(false)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      
      // Load articles
      let query = supabase
        .from('bv_history_articles')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data: articlesData } = await query
      setArticles(articlesData || [])

      // Load timeline
      const { data: timelineData } = await supabase
        .from('bv_history_timeline')
        .select('*')
        .order('year', { ascending: true })

      setTimeline(timelineData || [])
      setLoading(false)
    }

    loadData()
  }, [selectedCategory])

  // Mark article as read
  const markAsRead = async (articleId: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase.from('bv_user_progress').upsert({
        user_id: user.id,
        content_type: 'history_article',
        content_id: articleId,
        completed: true,
        completed_at: new Date().toISOString()
      })
    }
  }

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <button
            onClick={() => setSelectedArticle(null)}
            className="mb-6 text-amber-400 hover:text-amber-300 flex items-center gap-2"
          >
            ← Back to History
          </button>

          <article className="bg-stone-800/50 rounded-2xl p-8 border border-amber-600/30">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-amber-400 text-sm mb-4">
                <span>{CATEGORIES.find(c => c.id === selectedArticle.category)?.icon}</span>
                <span className="capitalize">{selectedArticle.category}</span>
                {selectedArticle.era && (
                  <>
                    <span>•</span>
                    <span>{selectedArticle.era}</span>
                  </>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-4">{selectedArticle.title}</h1>
              <p className="text-xl text-stone-300 mb-4">{selectedArticle.summary}</p>
              <div className="flex items-center gap-4 text-stone-400 text-sm">
                <span>📖 {selectedArticle.read_time} min read</span>
                <span>✍️ {selectedArticle.author}</span>
                <span>📅 {new Date(selectedArticle.published_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-invert prose-amber max-w-none">
              {selectedArticle.content.split('\n\n').map((paragraph, i) => {
                if (paragraph.startsWith('# ')) {
                  return <h1 key={i} className="text-3xl font-bold mt-8 mb-4">{paragraph.replace('# ', '')}</h1>
                }
                if (paragraph.startsWith('## ')) {
                  return <h2 key={i} className="text-2xl font-bold mt-6 mb-3 text-amber-400">{paragraph.replace('## ', '')}</h2>
                }
                if (paragraph.startsWith('### ')) {
                  return <h3 key={i} className="text-xl font-bold mt-4 mb-2">{paragraph.replace('### ', '')}</h3>
                }
                return <p key={i} className="text-stone-300 leading-relaxed mb-4">{paragraph}</p>
              })}
            </div>

            {/* Sources */}
            {selectedArticle.sources && selectedArticle.sources.length > 0 && (
              <div className="mt-8 pt-8 border-t border-stone-700">
                <h3 className="font-bold mb-4">📚 Sources & Further Reading</h3>
                <ul className="list-disc list-inside text-stone-400 space-y-2">
                  {selectedArticle.sources.map((source, i) => (
                    <li key={i}>{source}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => markAsRead(selectedArticle.id)}
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold"
              >
                ✓ Mark as Read
              </button>
              <button className="bg-stone-700 hover:bg-stone-600 px-6 py-3 rounded-xl font-semibold">
                🔖 Save for Later
              </button>
              <button className="bg-stone-700 hover:bg-stone-600 px-6 py-3 rounded-xl font-semibold">
                📤 Share
              </button>
            </div>
          </article>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white">
      {/* Header */}
      <div className="bg-stone-900/80 border-b border-amber-600/30">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-amber-400 hover:text-amber-300 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">📜 The Alcohol Museum</h1>
          <p className="text-xl text-stone-300">
            Explore the fascinating history of spirits, from ancient origins to modern craft
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* View Toggle */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowTimeline(false)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              !showTimeline 
                ? 'bg-amber-600 text-white' 
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            📚 Articles
          </button>
          <button
            onClick={() => setShowTimeline(true)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              showTimeline 
                ? 'bg-amber-600 text-white' 
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            📅 Timeline
          </button>
        </div>

        {/* Category Filter */}
        {!showTimeline && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-5xl mb-4">📜</div>
            <p className="text-stone-400">Loading history...</p>
          </div>
        ) : showTimeline ? (
          /* Timeline View */
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-amber-600/30"></div>
            <div className="space-y-8">
              {timeline.map((event) => (
                <div key={event.id} className="flex gap-6 relative">
                  <div className="w-16 flex-shrink-0 text-right">
                    <span className="text-amber-400 font-bold">{event.year}</span>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-amber-600 absolute left-6 top-1 border-2 border-stone-900"></div>
                  <div className="flex-1 bg-stone-800/50 rounded-xl p-4 border border-amber-600/20 ml-4">
                    <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                    <p className="text-stone-300">{event.description}</p>
                    {event.spirit_category && (
                      <span className="inline-block mt-2 px-2 py-1 bg-stone-700 rounded text-xs capitalize">
                        {event.spirit_category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Articles Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-5xl mb-4">📚</div>
                <p className="text-xl text-stone-400">No articles in this category yet</p>
                <p className="text-stone-500 mt-2">Check back soon for new content!</p>
              </div>
            ) : (
              articles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="bg-stone-800/50 border border-amber-600/20 rounded-xl overflow-hidden hover:border-amber-500/50 hover:shadow-lg transition-all text-left group"
                >
                  {/* Image Placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-amber-900 to-stone-800 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                    {CATEGORIES.find(c => c.id === article.category)?.icon || '📜'}
                  </div>
                  
                  <div className="p-4">
                    {article.is_featured && (
                      <span className="inline-block px-2 py-1 bg-amber-600 rounded text-xs mb-2">
                        ⭐ Featured
                      </span>
                    )}
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-stone-400 text-sm line-clamp-3 mb-3">{article.summary}</p>
                    <div className="flex items-center justify-between text-stone-500 text-xs">
                      <span>📖 {article.read_time} min</span>
                      <span className="capitalize">{article.category}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
