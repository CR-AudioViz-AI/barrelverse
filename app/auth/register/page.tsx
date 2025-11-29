'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    birthDate: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const validateAge = (birthDate: string): boolean => {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age >= 21
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    if (!validateAge(formData.birthDate)) {
      setError('You must be 21 or older to create an account')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            display_name: formData.username,
            birth_date: formData.birthDate,
          }
        }
      })

      if (error) throw error

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-stone-800/50 border border-amber-600/30 rounded-xl p-8">
            <div className="text-5xl mb-4">✉️</div>
            <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
            <p className="text-stone-300 mb-6">
              We&apos;ve sent a confirmation link to <strong>{formData.email}</strong>. 
              Please click the link to verify your account.
            </p>
            <Link
              href="/auth/login"
              className="inline-block bg-amber-600 hover:bg-amber-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold">🍾 BarrelVerse</h1>
          </Link>
          <p className="text-amber-200 mt-2">Create your account</p>
        </div>

        <div className="bg-stone-800/50 border border-amber-600/30 rounded-xl p-8">
          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="bg-red-900/30 border border-red-600 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-amber-300 text-sm font-medium mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                className="w-full bg-stone-900 border border-amber-600/30 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                placeholder="whiskey_lover"
              />
              <p className="text-xs text-stone-500 mt-1">Letters, numbers, and underscores only</p>
            </div>

            <div>
              <label htmlFor="email" className="block text-amber-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-stone-900 border border-amber-600/30 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-amber-300 text-sm font-medium mb-2">
                Date of Birth
              </label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                required
                className="w-full bg-stone-900 border border-amber-600/30 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
              />
              <p className="text-xs text-stone-500 mt-1">You must be 21 or older</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-amber-300 text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full bg-stone-900 border border-amber-600/30 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                placeholder="••••••••"
              />
              <p className="text-xs text-stone-500 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-amber-300 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full bg-stone-900 border border-amber-600/30 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                required
                className="mt-1 w-4 h-4 rounded bg-stone-900 border-amber-600/30 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="terms" className="text-sm text-stone-300">
                I confirm I am 21 years or older and agree to the{' '}
                <Link href="/terms" className="text-amber-400 hover:text-amber-300">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-amber-400 hover:text-amber-300">Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-stone-400">Already have an account? </span>
            <Link href="/auth/login" className="text-amber-400 hover:text-amber-300 font-medium">
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-amber-300 hover:text-amber-200 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
