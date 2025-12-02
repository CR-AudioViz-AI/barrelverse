'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import { getClient } from '@/lib/supabase/client'

interface Course {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  duration_minutes: number
  proof_reward: number
  is_premium: boolean
  is_active: boolean
  lessons: string | null
  image_url: string | null
  badge_reward: string | null
}

const CATEGORY_ICONS: Record<string, string> = {
  bourbon: '🥃',
  scotch: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  irish: '🍀',
  japanese: '🇯🇵',
  tequila: '🌵',
  rum: '🏝️',
  gin: '🌿',
  vodka: '❄️',
  cognac: '🍇',
  wine: '🍷',
  beer: '🍺',
  cocktails: '🍸',
  general: '📚',
  certification: '🎓',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
  expert: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

function calculateLevel(proofBalance: number): number {
  if (proofBalance < 100) return 1
  if (proofBalance < 500) return 2
  if (proofBalance < 1000) return 3
  if (proofBalance < 2500) return 4
  if (proofBalance < 5000) return 5
  if (proofBalance < 10000) return 6
  if (proofBalance < 25000) return 7
  if (proofBalance < 50000) return 8
  if (proofBalance < 100000) return 9
  return 10 + Math.floor((proofBalance - 100000) / 50000)
}

export default function AcademyPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const supabase = getClient()

  useEffect(() => {
    async function fetchCourses() {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('bv_courses')
        .select('*')
        .eq('is_active', true)
        .order('difficulty', { ascending: true })
      
      if (data) {
        setCourses(data)
      }
      setIsLoading(false)
    }
    
    fetchCourses()
  }, [supabase])

  const categories = useMemo(() => {
    const cats = new Set(courses.map(c => c.category))
    return Array.from(cats).sort()
  }, [courses])

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      if (selectedCategory !== 'all' && course.category !== selectedCategory) return false
      if (selectedDifficulty !== 'all' && course.difficulty !== selectedDifficulty) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return course.title.toLowerCase().includes(query) || 
               course.description.toLowerCase().includes(query)
      }
      return true
    })
  }, [courses, selectedCategory, selectedDifficulty, searchQuery])

  const getLessons = (course: Course): { title: string; content: string }[] => {
    if (!course.lessons) return []
    try {
      return JSON.parse(course.lessons)
    } catch {
      return []
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const userLevel = profile ? calculateLevel(profile.proof_balance || 0) : 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white">
      {/* Header */}
      <div className="border-b border-amber-600/20 bg-stone-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-amber-300 hover:text-amber-200">
                ← Home
              </Link>
              <div className="h-6 w-px bg-amber-600/30" />
              <h1 className="text-xl font-bold">🎓 BarrelVerse Academy</h1>
            </div>
            {user && profile && (
              <div className="flex items-center gap-4">
                <div className="text-amber-400">
                  <span className="text-stone-400">Level</span> {userLevel}
                </div>
                <div className="text-amber-400">
                  <span className="text-stone-400">$PROOF</span> {profile.proof_balance || 0}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Master the World of Spirits</h2>
          <p className="text-xl text-stone-400 max-w-2xl mx-auto">
            From beginner basics to expert certifications. Learn at your own pace 
            and earn $PROOF along the way.
          </p>
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">{courses.length}</div>
              <div className="text-stone-400">Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">
                {courses.reduce((sum, c) => sum + getLessons(c).length, 0)}
              </div>
              <div className="text-stone-400">Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">
                {courses.reduce((sum, c) => sum + c.proof_reward, 0).toLocaleString()}
              </div>
              <div className="text-stone-400">$PROOF Available</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-full px-4 py-3 bg-stone-800 border border-amber-600/30 rounded-lg text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-stone-800 border border-amber-600/30 rounded-lg focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {CATEGORY_ICONS[cat] || '📚'} {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-3 bg-stone-800 border border-amber-600/30 rounded-lg focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin text-5xl">🎓</div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-xl text-stone-400">No courses found</p>
            <p className="text-stone-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const lessons = getLessons(course)
              return (
                <div
                  key={course.id}
                  className="bg-stone-800/50 border border-amber-600/20 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all group"
                >
                  <div className="h-32 bg-gradient-to-br from-amber-900/50 to-stone-800 flex items-center justify-center text-5xl relative">
                    {CATEGORY_ICONS[course.category] || '📚'}
                    {course.is_premium && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-black text-xs px-2 py-1 rounded font-bold">
                        PREMIUM
                      </div>
                    )}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs border ${DIFFICULTY_COLORS[course.difficulty] || DIFFICULTY_COLORS.beginner}`}>
                      {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-2 group-hover:text-amber-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-stone-400 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center gap-4">
                        <span className="text-stone-400">
                          📖 {lessons.length} lessons
                        </span>
                        <span className="text-stone-400">
                          ⏱️ {formatDuration(course.duration_minutes)}
                        </span>
                      </div>
                    </div>

                    {lessons.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-stone-500 mb-2">LESSONS:</div>
                        <div className="space-y-1">
                          {lessons.slice(0, 3).map((lesson, i) => (
                            <div key={i} className="text-xs text-stone-400 truncate">
                              {i + 1}. {lesson.title}
                            </div>
                          ))}
                          {lessons.length > 3 && (
                            <div className="text-xs text-amber-500">
                              +{lessons.length - 3} more lessons
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-stone-700">
                      <div className="text-amber-400 font-bold">
                        +{course.proof_reward} $PROOF
                      </div>
                      <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-semibold transition-colors">
                        Start Course
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Certification Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold mb-6 text-center">🏆 Certification Programs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Certified Enthusiast', icon: '⭐', desc: 'Complete beginner courses', reward: 500 },
              { name: 'Certified Connoisseur', icon: '🌟', desc: 'Master intermediate content', reward: 1000 },
              { name: 'Certified Expert', icon: '💫', desc: 'Complete advanced courses', reward: 2500 },
              { name: 'Certified Master', icon: '👑', desc: 'Pass all certifications', reward: 5000 },
            ].map((cert) => (
              <div
                key={cert.name}
                className="bg-stone-800/30 border border-amber-600/20 rounded-lg p-4 text-center hover:border-amber-500/50 transition-all"
              >
                <div className="text-4xl mb-2">{cert.icon}</div>
                <h4 className="font-bold text-amber-400">{cert.name}</h4>
                <p className="text-sm text-stone-400 mb-2">{cert.desc}</p>
                <div className="text-amber-300 text-sm">+{cert.reward} $PROOF</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="mt-16 text-center bg-gradient-to-r from-amber-900/30 to-stone-800/30 border border-amber-600/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Learning?</h3>
            <p className="text-stone-400 mb-6">
              Create a free account to track your progress, earn $PROOF, and unlock certifications.
            </p>
            <Link
              href="/auth/register"
              className="inline-block px-8 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-bold transition-colors"
            >
              Sign Up Free
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
